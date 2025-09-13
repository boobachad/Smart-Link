import json

# Fetch trips from JSON file
with open('./routes_final.json', 'r') as f:
    routes = json.load(f)
durations = []
for route in routes:
    # Each route has a timing object with totalDuration
    if "timing" not in route:
        continue
    duration = route["startStation"]["totalDuration"]

    durations.append(duration)

# Print all durations
print("Trip Durations (minutes):", durations)

# Print max duration
if durations:
    print("Max Duration:", max(durations), "minutes")
else:
    print("No trips found")
