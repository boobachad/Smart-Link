# === app.py ===
from flask import Flask, request, jsonify
import pandas as pd
import joblib
from datetime import datetime, timedelta
import pytz
import requests
from math import radians, cos, sin, asin, sqrt
import json

app = Flask(__name__)

# --- Load trained model ---
MODEL_FILE = "eta_model_xgboost_gpu_DT_NEW.pkl"
xgb_model = joblib.load(MODEL_FILE)

# --- Load historical data ---
HISTORY_FILE = "intra_city_history.json"
with open(HISTORY_FILE, "r") as f:
    history_records = pd.DataFrame(json.load(f))

# --- Extract start/end coordinates from nested JSON ---
history_records['start_lat'] = history_records['start_station'].apply(lambda x: x['coordinates'][0])
history_records['start_lon'] = history_records['start_station'].apply(lambda x: x['coordinates'][1])
history_records['end_lat'] = history_records['end_station'].apply(lambda x: x['coordinates'][0])
history_records['end_lon'] = history_records['end_station'].apply(lambda x: x['coordinates'][1])

# --- Ensure num_stops column exists ---
if 'num_stops' not in history_records.columns:
    history_records['num_stops'] = history_records['stops_in_between'].apply(lambda x: len(x) + 2)

# --- Ensure scheduled_time_minutes exists ---
if 'scheduled_time_minutes' not in history_records.columns:
    history_records['scheduled_time_minutes'] = history_records['scheduled_time_minutes']

# --- India timezone ---
india_tz = pytz.timezone('Asia/Kolkata')

# --- Helper functions ---
def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1))*cos(radians(lat2))*sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    return R * c

def get_live_weather(coords):
    weather_api_key = "621d14583cca031ece74b61c6075975b"
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={coords['lat']}&lon={coords['lon']}&appid={weather_api_key}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        weather_condition = response.json()['weather'][0]['main']
        if "Rain" in weather_condition: return "Rainy"
        if "Fog" in weather_condition or "Mist" in weather_condition: return "Foggy"
        return "Clear"
    except:
        return "Clear"

def get_osrm_route_info(origin_coords, destination_coords):
    origin = f"{origin_coords['lon']},{origin_coords['lat']}"
    destination = f"{destination_coords['lon']},{destination_coords['lat']}"
    url = f"http://router.project-osrm.org/route/v1/driving/{origin};{destination}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        route = response.json()['routes'][0]
        return route['duration'], route['distance']
    except:
        return None, None

# --- ETA calculation ---
def calculate_eta(bus_coords, dest_coords):
    now = datetime.now(india_tz)
    osrm_sec, osrm_dist = get_osrm_route_info(bus_coords, dest_coords)
    if osrm_sec is None:
        return {"error": "OSRM route calculation failed."}

    weather = get_live_weather(bus_coords)

    # Auto-derive scheduled_time_min and num_stops from closest historical trip
    history = history_records.copy()
    history['current_to_start_dist'] = history.apply(
        lambda row: haversine(bus_coords['lat'], bus_coords['lon'], row['start_lat'], row['start_lon']), axis=1)
    history['dest_to_end_dist'] = history.apply(
        lambda row: haversine(dest_coords['lat'], dest_coords['lon'], row['end_lat'], row['end_lon']), axis=1)
    closest_row = history.loc[(history['current_to_start_dist'] + history['dest_to_end_dist']).idxmin()]
    scheduled_time_min = closest_row['scheduled_time_minutes']
    num_stops = closest_row['num_stops']

    # --- Prepare AI model input ---
    feature_names = xgb_model.get_booster().feature_names
    sample = pd.DataFrame([{
        'distance_km': osrm_dist / 1000,
        'num_stops': num_stops,
        'scheduled_time_minutes': scheduled_time_min,
        'hour': now.hour,
        'day_of_week': now.weekday(),
        'peak_hour': 1 if 8 <= now.hour <= 10 or 17 <= now.hour <= 20 else 0,
        'weather_' + weather: 1,
        'passenger_demand_Medium': 1
    }]).reindex(columns=feature_names, fill_value=0)

    predicted_travel_time_min = float(xgb_model.predict(sample)[0])

    # --- Delay calculation ---
    delay_min = round(predicted_travel_time_min - scheduled_time_min, 1)
    if delay_min > 1:
        status = "DELAYED"
    elif delay_min < -1:
        status = "AHEAD"
    else:
        status = "ON TIME"

    estimated_arrival_time = now + timedelta(minutes=predicted_travel_time_min)

    return {
        "delay_minutes": delay_min,
        "estimated_arrival_time": estimated_arrival_time.strftime('%Y-%m-%d %I:%M %p'),
        "predicted_travel_time_minutes": round(predicted_travel_time_min, 2),
        "status": status,
        "weather_at_start": weather
    }

# --- Flask route ---
@app.route("/eta", methods=["POST"])
def eta():
    try:
        data = request.get_json()
        bus_coords = {"lat": float(data['current_lat']), "lon": float(data['current_lon'])}
        dest_coords = {"lat": float(data['destination_lat']), "lon": float(data['destination_lon'])}
        result = calculate_eta(bus_coords, dest_coords)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5500, debug=True)
