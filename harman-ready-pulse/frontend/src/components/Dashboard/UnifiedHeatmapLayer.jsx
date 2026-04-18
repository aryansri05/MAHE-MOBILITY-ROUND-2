import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

export default function UnifiedHeatmapLayer({ data }) {
  const map = useMap();

  useEffect(() => {
    if (!data || data.length === 0) return;

    // The configuration:
    // { 0.1: 'red', 0.4: 'orange', 0.6: 'yellow', 1.0: 'lime' }
    // radius: 25, blur: 15, max: 1.0
    // Feed the live array of [lat, lng, intensity] directly into this plugin
    const heatLayer = L.heatLayer(data, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.1: 'red',
        0.4: 'orange',
        0.6: 'yellow',
        1.0: '#22c55e'
      }
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [data, map]);

  return null;
}
