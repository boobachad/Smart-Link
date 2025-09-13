import json

def clear_trips_in_json(input_file, output_file):
    try:
        # Load the JSON file
        with open(input_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        # If it's a single JSON object
        if isinstance(data, dict):
            if "trips" in data:
                data["trips"] = []
        
        # If it's a list of JSON objects
        elif isinstance(data, list):
            for route in data:
                if "trips" in route:
                    route["trips"] = []

        # Save updated JSON to new file
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        print(f"✅ Trips cleared and updated JSON saved to {output_file}")

    except Exception as e:
        print(f"❌ Error: {e}")


# Example usage
clear_trips_in_json("routes.json", "routes_updated.json")
