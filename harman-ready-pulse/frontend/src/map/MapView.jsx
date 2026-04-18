import { MapContainer, TileLayer, Marker, Polyline, GeoJSON } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import deadzones from "./deadzones.json";
import { booleanPointInPolygon, point } from "@turf/turf";
import { socket } from "../socket";

// Fix: Leaflet default marker icons are broken in Vite/webpack builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function MapView() {
  const [route, setRoute] = useState([]);
  const [position, setPosition] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const indexRef = useRef(0);

  // Bangalore route: MG Road → Brigade Road
  const start = [77.5946, 12.9716];
  const end = [77.5985, 12.9755];

  useEffect(() => {
    setLoading(true);
    fetch(
      `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`
    )
      .then((res) => res.json())
      .then((data) => {
        const coords = data.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]);
        setRoute(coords);
        setPosition(coords[0]);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });

    const handleSimulationState = (state) => {
      if (state.playing !== undefined) setIsPlaying(state.playing);
    };
    socket.on("simulation_state", handleSimulationState);
    return () => socket.off("simulation_state", handleSimulationState);
  }, []);

  useEffect(() => {
    if (route.length === 0 || !isPlaying) return;
    const interval = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % route.length;
      const newPos = route[indexRef.current];
      setPosition(newPos);

      const carPoint = point([newPos[1], newPos[0]]);
      let inDeadZone = false;
      for (const feature of deadzones.features) {
        if (booleanPointInPolygon(carPoint, feature)) { inDeadZone = true; break; }
      }
      socket.emit("network_status", inDeadZone ? "DEAD_ZONE" : "CONNECTED");
    }, 500);
    return () => clearInterval(interval);
  }, [route, isPlaying]);

  const geoJsonStyle = { color: "#ef4444", weight: 2, opacity: 0.9, fillOpacity: 0.25 };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-xl border border-gray-800">
        <div className="text-center text-gray-400">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Loading route...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-xl border border-gray-800">
        <p className="text-red-400 text-sm">Could not load map route. Check internet connection.</p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%" }} className="rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
      <MapContainer
        center={[12.9716, 77.5946]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <GeoJSON data={deadzones} style={geoJsonStyle} />
        {route.length > 0 && <Polyline positions={route} color="#3b82f6" weight={5} opacity={0.9} />}
        {position && <Marker position={position} />}
      </MapContainer>
    </div>
  );
}