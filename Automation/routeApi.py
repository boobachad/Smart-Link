import json
import time
import requests

API_URL = "http://10.244.86.182:5000/api/routes"
JSON_FILE = "routes_final.json"

# Load driver data safely
with open(JSON_FILE, "r", encoding="utf-8") as f:
    try:
        raw_drivers = json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ Failed to load JSON: {e}")
        exit(1)

# Ensure we have a list
if not isinstance(raw_drivers, list):
    print("❌ JSON file must contain a list of records")
    exit(1)

# Convert strings to dicts if needed and filter out invalid entries
drivers = []
for d in raw_drivers:
    if isinstance(d, dict):
        drivers.append(d)
    elif isinstance(d, str) and d.strip():  # non-empty string
        try:
            drivers.append(json.loads(d))
        except json.JSONDecodeError:
            print(f"⚠️ Skipping invalid JSON string: {d}")
    else:
        print(f"⚠️ Skipping invalid record: {d}")

print(f"ℹ️ Total valid drivers to send: {len(drivers)}")

# Loop and send one by one
for i, driver in enumerate(drivers, start=1):
    try:
        # Remove _id if it exists
        driver.pop('_id', None)

        response = requests.post(API_URL, json=driver)
        if response.status_code in [200, 201]:
            print(f"[{i}] ✅ Driver added: {driver.get('name', 'N/A')}")
        else:
            print(f"[{i}] ⚠️ Failed for {driver.get('name', 'N/A')} - Status {response.status_code} - {response.text}")
    except Exception as e:
        print(f"[{i}] ❌ Error for {driver.get('name', 'N/A')}: {str(e)}")
    
    time.sleep(0.5)

print("✅ Upload completed!")
