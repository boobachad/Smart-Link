'use client';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Component to fit bounds automatically
const FitBounds = ({ startCoords, endCoords }) => {
  const map = useMap();
  useEffect(() => {
    if (startCoords && endCoords) {
      const bounds = L.latLngBounds(
        [startCoords.lat, startCoords.lng],
        [endCoords.lat, endCoords.lng]
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [startCoords, endCoords, map]);
  return null;
};

const RouteMap = ({ origin, destination, mapData, orsApiKey }) => {
  const [routeCoords, setRouteCoords] = useState([]);

  if (!mapData?.startCoords || !mapData?.endCoords) {
    return <p className="text-center text-gray-600">Route data not available</p>;
  }

  // Fix default marker in Leaflet + Next.js
  const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
  L.Marker.prototype.options.icon = DefaultIcon;

  // Fetch route from ORS
  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const orsApiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjkzZDVmNzVmMWM1ZjQ5NzRiZDA0OGQ3MjI5MWJkNmE5IiwiaCI6Im11cm11cjY0In0="
        const start = [mapData.startCoords.lng, mapData.startCoords.lat]; // ORS uses [lng, lat]
        const end = [mapData.endCoords.lng, mapData.endCoords.lat];
        const res = await fetch(
          `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${orsApiKey}&start=${start.join(',')}&end=${end.join(',')}`
        );
        const data = await res.json();
        if (data?.features?.[0]?.geometry?.coordinates) {
          // ORS returns [lng, lat], convert to [lat, lng] for Leaflet
          const coords = data.features[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          setRouteCoords(coords);
        }
      } catch (err) {
        console.error('Error fetching ORS route:', err);
      }
    };

    fetchRoute();
  }, [mapData, orsApiKey]);

  return (
    <div className="h-64 w-full rounded-xl shadow-md relative">
      {/* {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center rounded-xl z-10">
          <p className="text-gray-500">Loading route...</p>
        </div>
      )} */}

      <MapContainer
        center={[mapData.startCoords.lat, mapData.startCoords.lng]}
        zoom={12}
        scrollWheelZoom={true}
        className="h-64 w-full rounded-xl"
      >
        <FitBounds startCoords={mapData.startCoords} endCoords={mapData.endCoords} />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        />

        <Marker position={[mapData.startCoords.lat, mapData.startCoords.lng]}>
          <Popup>{origin}</Popup>
        </Marker>

        <Marker position={[mapData.endCoords.lat, mapData.endCoords.lng]}>
          <Popup>{destination}</Popup>
        </Marker>

        {routeCoords.length > 0 && (
          <Polyline positions={routeCoords} color="blue" weight={4} />
        )}
      </MapContainer>
    </div>
  );
};

export default RouteMap;
