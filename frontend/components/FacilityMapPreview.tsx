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
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load Google Maps script
  useEffect(() => {
    if (!isClient || typeof window === 'undefined') return;

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      setMapError('Google Maps API key not found. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local');
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsLoaded(true));
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsLoaded(true);
    };

    script.onerror = (error) => {
      console.error('[Google Maps] Script load error:', error);
      setMapError('Failed to load Google Maps script. Check your API key.');
    };

    document.head.appendChild(script);

    return () => {
      // Don't remove script on cleanup as it might be used by other components
    };
  }, [isClient]);

  // Initialize map once Google Maps is loaded
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current || typeof window === 'undefined') {
      return;
    }
    if (!window.google || !window.google.maps) {
      console.error('[Google Maps] Google Maps API not available');
      return;
    }

    if (!mapRef.current) return;

    // Initialize Google Map with satellite view only
    const map = new google.maps.Map(mapRef.current, {
      center: { lat: facility.latitude, lng: facility.longitude },
      zoom: 17, // Reduced by 2 points (was 19)
      mapTypeId: 'satellite', // Always satellite view
      disableDefaultUI: true, // Disable all controls
      zoomControl: false,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
      gestureHandling: 'none', // Disable all interactions
      draggable: false,
      scrollwheel: false,
      disableDoubleClickZoom: true,
      keyboardShortcuts: false,
    });

    // Add marker
    const marker = new google.maps.Marker({
      position: { lat: facility.latitude, lng: facility.longitude },
      map: map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#ff0000',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [facility, isLoaded]);


  if (!isClient) {
    return (
      <div 
        className="w-full h-full bg-gray-200 rounded-lg animate-pulse"
        style={width && height ? { width, height } : undefined}
      />
    );
  }

  if (mapError) {
    return (
      <div 
        className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center text-red-600 text-xs p-2"
        style={width && height ? { width, height } : undefined}
      >
        {mapError}
      </div>
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
