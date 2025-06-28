// src/MapTest.jsx
import React, { useRef, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer } from 'react-leaflet';

export default function MapTest() {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => mapRef.current.invalidateSize(), 300);
    }
  }, []);

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        whenCreated={(map) => { mapRef.current = map; }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      </MapContainer>
    </div>
  );
}
