export async function getCoordinates(location) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch coordinates");
    }

    const data = await response.json();

    if (data.length === 0) {
      return null; // no match found
    }

    // Take the first result
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      display_name: data[0].display_name,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}
