'use client';

import { useEffect, useRef, useState } from 'react';
import { Facility } from '@/types/facility';

interface FacilityMapPreviewProps {
  facility: Facility;
  width?: number;
  height?: number;
}

export function FacilityMapPreview({ 
  facility, 
  width = 400, 
  height = 200 
}: FacilityMapPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapRef.current || mapInstanceRef.current || typeof window === 'undefined') return;

    // Dynamically import Leaflet only on client side
    import('leaflet').then((L) => {
      import('leaflet/dist/leaflet.css');
      
      if (!mapRef.current) return;

      // Initialize Leaflet map with OpenStreetMap tiles (free, no API key)
      const map = L.default.map(mapRef.current, {
        center: [facility.latitude, facility.longitude],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        touchZoom: false,
        doubleClickZoom: false,
        scrollWheelZoom: false,
        boxZoom: false,
        keyboard: false,
      });

      // Add OpenStreetMap tile layer (free)
      L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      // Add marker with a simple red circle (no external dependencies)
      const marker = L.default.circleMarker([facility.latitude, facility.longitude], {
        radius: 8,
        fillColor: '#ff0000',
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(map);

      // Ensure map fills the container properly
      setTimeout(() => {
        map.invalidateSize();
      }, 0);

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [facility, isClient]);

  if (!isClient) {
    return (
      <div 
        className="w-full h-full bg-gray-200 rounded-lg animate-pulse"
        style={width && height ? { width, height } : undefined}
      />
    );
  }

  return (
    <div 
      ref={mapRef}
      className="w-full h-full rounded-lg overflow-hidden relative z-0"
      style={width && height ? { width, height, zIndex: 0 } : { zIndex: 0 }}
    />
  );
}
