import json
import time
import requests

# API endpoint where you want to send data
API_URL = "http://10.244.86.182:5000/api/drivers"  # 🔴 change this to your backend endpoint

# Load driver data
with open("drivers_mock.json", "r", encoding="utf-8") as f:
    drivers = json.load(f)

# Loop and send one by one
for i, driver in enumerate(drivers, start=1):
    try:
        driver.pop('connectivity', None)  # Remove 'connectivity' if it exists
        response = requests.post(API_URL, json=driver)
        if response.status_code == 201 or response.status_code == 200:
            print(f"[{i}] ✅ Driver added: {driver['name']}")
        else:
            print(f"[{i}] ⚠️ Failed for {driver['name']} - Status {response.status_code} - {response.text}")
    except Exception as e:
        print(f"[{i}] ❌ Error for {driver['name']}: {str(e)}")
    
    # Optional small delay to be extra safe (e.g., 0.5 sec)
    time.sleep(0.5)

print("✅ Upload completed!")
