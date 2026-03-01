'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Facility } from '@/types/facility';

interface MapViewProps {
  facilities: Facility[];
  selectedFacility: Facility | null;
  onMarkerClick: (facility: Facility) => void;
}

export function MapView({ facilities, selectedFacility, onMarkerClick }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn('Google Maps API key not found');
      setIsLoading(false);
      return;
    }

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places'],
    });

    loader
      .load()
      .then(() => {
        if (mapRef.current) {
          const newMap = new google.maps.Map(mapRef.current, {
            center: { lat: 39.8283, lng: -98.5795 }, // Center of US
            zoom: 4,
          });
          setMap(newMap);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error('Error loading Google Maps:', error);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!map || facilities.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Create markers for facilities
    facilities.forEach((facility) => {
      const marker = new google.maps.Marker({
        position: { lat: facility.latitude, lng: facility.longitude },
        map,
        title: facility.name,
        icon: {
          url: facility.is_enriched === 1
            ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            : 'http://maps.google.com/mapfiles/ms/icons/gray-dot.png',
        },
      });

      marker.addListener('click', () => {
        onMarkerClick(facility);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (markersRef.current.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      markersRef.current.forEach((marker) => {
        const position = marker.getPosition();
        if (position) {
          bounds.extend(position);
        }
      });
      map.fitBounds(bounds);
    }
  }, [map, facilities, onMarkerClick]);

  useEffect(() => {
    if (!map || !selectedFacility) return;

    // Center map on selected facility
    map.setCenter({
      lat: selectedFacility.latitude,
      lng: selectedFacility.longitude,
    });
    map.setZoom(15);
  }, [map, selectedFacility]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <div className="text-gray-500 text-center p-4">
          <p className="font-semibold mb-2">Google Maps API key not configured</p>
          <p className="text-sm">
            Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={mapRef} className="w-full h-full min-h-[600px] rounded-lg" />
  );
}
