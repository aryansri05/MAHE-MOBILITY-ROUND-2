import { MapContainer, TileLayer, Marker, Polyline, GeoJSON } from "react-leaflet";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import deadzones from "./deadzones.json";
import { booleanPointInPolygon, point } from "@turf/turf";
import { socket } from "../socket";

export default function MapView() {
  const [route, setRoute] = useState([]);
  const [position, setPosition] = useState(null);

  // Example: Bangalore route
  const start = [77.5946, 12.9716]; // lng, lat
  const end = [77.5985, 12.9755];

  useEffect(() => {
    fetch(
      `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`
    )
      .then((res) => res.json())
      .then((data) => {
        const coords = data.routes[0].geometry.coordinates.map((c) => [
          c[1],
          c[0],
        ]);
        setRoute(coords);
        setPosition(coords[0]);
      });
  }, []);

  useEffect(() => {
    if (route.length === 0) return;

    let i = 0;

    const interval = setInterval(() => {
      i = (i + 1) % route.length;
      const newPos = route[i];
      setPosition(newPos);

      // Check for deadzone
      // Leaflet latlng is [lat, lng]. Turf point is [lng, lat]
      const carPoint = point([newPos[1], newPos[0]]);
      let inDeadZone = false;

      for (const feature of deadzones.features) {
        if (booleanPointInPolygon(carPoint, feature)) {
          inDeadZone = true;
          break;
        }
      }

      if (inDeadZone) {
        socket.emit("network_status", "DEAD_ZONE");
      } else {
        socket.emit("network_status", "CONNECTED");
      }

    }, 500);

    return () => clearInterval(interval);
  }, [route]);

  const geoJsonStyle = {
    color: "red",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.5,
  };

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <MapContainer center={[12.9716, 77.5946]} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <GeoJSON data={deadzones} style={geoJsonStyle} />

        {route.length > 0 && <Polyline positions={route} color="blue" />}
        {position && <Marker position={position} />}
      </MapContainer>
    </div>
  );
}