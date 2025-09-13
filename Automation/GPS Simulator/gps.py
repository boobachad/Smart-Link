import asyncio
import aiohttp
import random
import logging
from datetime import datetime, timedelta, date
import argparse

# Function to parse a date string into a date object
def valid_date(d):
    try:
        return datetime.strptime(d, "%Y-%m-%d").date()
    except ValueError:
        raise argparse.ArgumentTypeError(f"Invalid date format: {d}. Use YYYY-MM-DD.")

# Create parser
parser = argparse.ArgumentParser(description="Take two dates as input.")
parser.add_argument("start_date", type=valid_date, help="Start date in YYYY-MM-DD format")
parser.add_argument("end_date", type=valid_date, help="End date in YYYY-MM-DD format")

# Parse args
args = parser.parse_args()

API_BASE = "http://localhost:5000/api"
TIME_MULTIPLIER = 600  # 1 real sec = 10 simulated minutes
SEMAPHORE = asyncio.Semaphore(200)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(message)s")

# Track processed trip/date combos to avoid duplicates
processed_trips = set()

def parse_time(t: str):
    h, m = map(int, t.split(":"))
    return timedelta(hours=h, minutes=m)

def interpolate_points(start, end, steps=50):
    lon1, lat1 = start
    lon2, lat2 = end
    return [
        (lon1 + (lon2 - lon1) * i / steps,
         lat1 + (lat2 - lat1) * i / steps)
        for i in range(steps + 1)
    ]

def make_trip_instance_id(trip_id: str, base_date: date) -> str:
    """Generate unique trip instance ID (tripId + date only)"""
    return f"{trip_id}_{base_date.strftime('%Y%m%d')}"

async def simulate_trip(session, trip, base_date: date):
    async with SEMAPHORE:
        bus_id = trip["busId"].get("busNumber") if "busId" in trip else f"SIM{trip['_id'][:6]}"
        trip_instance_id = make_trip_instance_id(trip["_id"], base_date)

        # 🛑 skip if this trip/date already processed
        if trip_instance_id in processed_trips:
            logging.warning(f"⚠️ Skipping duplicate trip {trip_instance_id}")
            return
        processed_trips.add(trip_instance_id)

        logging.info(f"🚍 Starting simulation for {bus_id} | TripInstance={trip_instance_id}")

        stations = [trip["startStation"]] + trip.get("stops", []) + [trip["endStation"]]
        times = [parse_time(st["scheduledTime"]) for st in stations]
        coords = [st["coordinates"] for st in stations]

        path_with_times = []
        for idx in range(len(coords) - 1):
            seg_points = interpolate_points(coords[idx], coords[idx + 1], steps=30)
            seg_duration = times[idx + 1] - times[idx]
            step_delta = seg_duration / len(seg_points)
            for j, (lon, lat) in enumerate(seg_points):
                path_with_times.append((lon, lat, times[idx] + j * step_delta))

        current_date = base_date
        last_minutes = None

        for i, (lon, lat, sim_time) in enumerate(path_with_times):
            minutes = sim_time.total_seconds() / 60
            if last_minutes is not None and minutes < last_minutes:
                current_date += timedelta(days=1)
            last_minutes = minutes

            fake_datetime = datetime.combine(current_date, datetime.min.time()) + sim_time

            gps_payload = {
                "busId": bus_id,
                "tripInstanceId": trip_instance_id,  # ✅ stable unique ID
                "latitude": lat,
                "longitude": lon,
                "speed": round(random.uniform(25, 45), 1),
                "heading": random.randint(0, 359),
                "lastUpdated": fake_datetime.isoformat() + "Z"
            }

            try:
                async with session.post(f"{API_BASE}/gps", json=gps_payload) as resp:
                    logging.info(f"[{bus_id}] Trip={trip_instance_id} "
                                 f"Point {i+1}/{len(path_with_times)} "
                                 f"→ {resp.status}, time={gps_payload['lastUpdated']}")
            except Exception as e:
                logging.error(f"[{bus_id}] Error: {e}")

            if i < len(path_with_times) - 1:
                real_sleep = (path_with_times[i + 1][2] - sim_time).total_seconds() / TIME_MULTIPLIER
                await asyncio.sleep(max(0.01, real_sleep))

async def fetch_trips():
    async with aiohttp.ClientSession() as session:
        async with session.get(f"{API_BASE}/trips") as resp:
            trips = await resp.json()
            return trips.get("data", [])

async def main():
    trips = await fetch_trips()
    async with aiohttp.ClientSession() as session:
        start_date = args.start_date
        end_date = args.end_date

        current_date = start_date
        while current_date <= end_date:
            logging.info(f"\n=== Running simulation for {current_date} ===\n")
            tasks = [simulate_trip(session, trip, current_date) for trip in trips]
            await asyncio.gather(*tasks)
            current_date += timedelta(days=1)

        logging.info("\n✅ Simulation finished — reached end date.\n")

if __name__ == "__main__":
    asyncio.run(main())