# === test_flask_api.py ===
import requests
import json

# Flask API endpoint
url = "http://127.0.0.1:5500/eta"

# Example bus coordinates
payload = {
    "current_lat": 30.741,
    "current_lon": 76.7821,
    "destination_lat": 30.7255,
    "destination_lon": 76.795
}

try:
    response = requests.post(url, json=payload)
    response.raise_for_status()  # Raise error if request failed
    data = response.json()
    
    # Print only the clean API response
    print("✅ API Response:")
    print(json.dumps(data, indent=4))
    
except requests.exceptions.RequestException as e:
    print(f"❌ Request failed: {e}")