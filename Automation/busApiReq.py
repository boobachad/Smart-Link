import json
import requests

# Config
API_URL = "http://localhost:5000/api/buses/bulk"   # Replace with your API endpoint
JSON_FILE = "buses_mock.json"                        # Path to your JSON file
BATCH_SIZE = 20                                # Number of records per request

def chunk_data(data, size):
    """Split data into chunks of given size"""
    for i in range(0, len(data), size):
        yield data[i:i + size]

def main():
    # Load JSON data
    with open(JSON_FILE, "r", encoding="utf-8") as f:
        records = json.load(f)

    # Send data in chunks
    for idx, batch in enumerate(chunk_data(records, BATCH_SIZE), start=1):
        try:
            payload = {"buses": batch} 
            response = requests.post(API_URL, json=payload)
            response.raise_for_status()
            print(f"✅ Batch {idx} sent successfully: {len(batch)} records")
        except requests.RequestException as e:
            print(f"❌ Error sending batch {idx}: {e}")

if __name__ == "__main__":
    main()