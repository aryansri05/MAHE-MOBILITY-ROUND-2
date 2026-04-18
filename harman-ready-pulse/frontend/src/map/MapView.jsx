import { MapContainer, TileLayer, Marker, Polyline, GeoJSON } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import * as turf from "@turf/turf";
import { socket } from "../socket";

// Fix: Leaflet default marker icons are broken in Vite/webpack builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Inline dead zones data (avoids Vite JSON transform issues)
const deadzones = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        network: "Jio_Failure",
        description: "Primary Dead Zone (Indiranagar)",
        color: "#ef4444"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [77.6300, 12.9700],
            [77.6500, 12.9700],
            [77.6500, 12.9900],
            [77.6300, 12.9900],
            [77.6300, 12.9700]
          ]
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        network: "Airtel_Failure",
        description: "Secondary Dead Zone (Koramangala)",
        color: "#ef4444"
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [77.6100, 12.9200],
            [77.6300, 12.9200],
            [77.6300, 12.9400],
            [77.6100, 12.9400],
            [77.6100, 12.9200]
          ]
        ]
      }
    }
  ]
};

// Inline simulation route — drives through both dead zones
const SIMULATION_COORDS = [
  [77.6400, 13.0000],
  [77.6400, 12.9850],
  [77.6400, 12.9800],
  [77.6400, 12.9600],
  [77.6200, 12.9450],
  [77.6200, 12.9300],
  [77.6200, 12.9100]
];

export default function MapView() {
  const [route, setRoute] = useState([]);
  const [position, setPosition] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const indexRef = useRef(0);

  useEffect(() => {
    // Convert [lng, lat] to [lat, lng] for Leaflet
    const coords = SIMULATION_COORDS.map(c => [c[1], c[0]]);
    setRoute(coords);
    setPosition(coords[0]);

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

      const carPoint = turf.point([newPos[1], newPos[0]]);
      const isOffline = deadzones.features.some(zone => 
          turf.booleanPointInPolygon(carPoint, zone)
      );

      if (isOffline) {
          socket.emit('network_state', 'DEAD_ZONE');
      } else {
          socket.emit('network_state', '5G');
      }
    }, 500);
    return () => clearInterval(interval);
  }, [route, isPlaying]);

  const geoJsonStyle = (feature) => ({
    color: feature?.properties?.color || "#ef4444",
    weight: 2,
    opacity: 0.9,
    fillOpacity: 0.25,
  });

  // Center map to show both dead zones
  const mapCenter = [12.9550, 77.6300];

  return (
    <div style={{ width: "100%", height: "100%" }} className="rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
      <MapContainer
        center={mapCenter}
        zoom={12}
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