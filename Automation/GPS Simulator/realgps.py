import asyncio
import aiohttp
import logging
import random
from datetime import datetime, timedelta, date
from typing import List, Tuple, Dict
import math

API_BASE = "http://10.21.139.182:5000/api"
OSRM_URL = "http://router.project-osrm.org/"
TRIP_ID = "68c2ed928c91b9b2ce471c04"

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(message)s")

# ----------- Utils -----------
def haversine(a: Tuple[float, float], b: Tuple[float, float]) -> float:
    """Distance in km between two coords (lon, lat)."""
    lon1, lat1 = a
    lon2, lat2 = b
    R = 6371.0
    dlon = math.radians(lon2 - lon1)
    dlat = math.radians(lat2 - lat1)
    x = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * \
        math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    return 2 * R * math.asin(math.sqrt(x))

def coords_to_osrm(coords: List[Tuple[float, float]]) -> str:
    return ";".join(f"{lon},{lat}" for lon, lat in coords)

async def fetch_osrm_route(session: aiohttp.ClientSession, coords: List[Tuple[float, float]]) -> List[Tuple[float, float]]:
    url = f"{OSRM_URL}/route/v1/driving/{coords_to_osrm(coords)}"
    params = {"overview": "full", "geometries": "geojson"}
    async with session.get(url, params=params) as resp:
        if resp.status != 200:
            raise RuntimeError(await resp.text())
        data = await resp.json()
    return [(lon, lat) for lon, lat in data["routes"][0]["geometry"]["coordinates"]]

# ----------- Simulation -----------
async def simulate_trip(trip: Dict, base_date: date):
    async with aiohttp.ClientSession() as session:
        bus_id = trip["busId"]["busNumber"]
        trip_instance_id = f"{trip['_id']}_{base_date.strftime('%Y%m%d')}"

        stations = [trip["startStation"]] + trip.get("stops", []) + [trip["endStation"]]
        station_coords = [(s["coordinates"][0], s["coordinates"][1]) for s in stations]

        # OSRM route
        route = await fetch_osrm_route(session, station_coords)

        # ------------------- CLOCK SIMULATION -------------------
        # Start clock at scheduled start time
        start_time = datetime.combine(base_date, datetime.min.time())
        h, m = map(int, stations[0]["scheduledTime"].split(":"))
        clock = start_time + timedelta(hours=h, minutes=m)

        # Assume bus speed = 40 km/h
        speed_kmh = 40.0
        speed_mps = speed_kmh * 1000 / 3600  # meters per sec

        logging.info(f"🚍 Trip {trip_instance_id} started at {clock}")
        for i in range(len(route) - 1):
            lon, lat = route[i]
            next_lon, next_lat = route[i + 1]

            # distance between points
            dist_km = haversine((lon, lat), (next_lon, next_lat))
            dist_m = dist_km * 1000
            travel_secs = dist_m / speed_mps  # how many secs this hop should take

            # advance clock
            clock += timedelta(seconds=travel_secs)

            print(f"🚍 Bus {trip_instance_id} updated at {clock}.")
            payload = {
                "busId": bus_id,
                "tripInstanceId": trip_instance_id,
                "latitude": lat,
                "longitude": lon,
                "speed": round(random.uniform(30, 45), 1),
                "heading": random.randint(0, 359),
                "lastUpdated": clock.isoformat() + "Z"
            }

            try:
                async with session.post(f"{API_BASE}/gps", json=payload) as resp:
                    if resp.status != 200:
                        logging.warning(f"GPS post failed {resp.status}")
            except Exception as e:
                logging.error(f"Post error: {e}")

            # real wait (can speed up if you want a faster sim)
            await asyncio.sleep(0.2)

        logging.info(f"✅ Trip {trip_instance_id} finished at {clock}")

# ----------- Main -----------
async def main():
    async with aiohttp.ClientSession() as session:
        async with session.get(f"{API_BASE}/trip/{TRIP_ID}") as resp:
            trip = await resp.json()
    await simulate_trip(trip["data"], date.today())

if __name__ == "__main__":
    asyncio.run(main())
