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

  // Check if we're in local development
  const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';

  // All hooks must be called before any conditional returns
  useEffect(() => {
    setIsClient(true);
  }, []);

  // For production: use Google Maps API
  // Load Google Maps script
  useEffect(() => {
    if (!isClient || typeof window === 'undefined' || isLocal) return;

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
  }, [isClient, isLocal]);

  // Initialize map once Google Maps is loaded
  useEffect(() => {
    if (isLocal) return; // Skip API initialization for local
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
  }, [facility, isLoaded, isLocal]);

  // Now we can do conditional rendering after all hooks are called
  if (!isClient) {
    return (
      <div 
        className="w-full h-full bg-gray-200 rounded-lg animate-pulse"
        style={width && height ? { width, height } : undefined}
      />
    );
  }

  // For local: use free Google Maps embed (iframe) - no API key needed
  if (isLocal) {
    // Free Google Maps embed URL - works without API key
    // t=k = satellite view, z=17 = zoom level
    const freeEmbedUrl = `https://www.google.com/maps?q=${facility.latitude},${facility.longitude}&t=k&z=17&output=embed`;
    
    // Google Maps URL to open in new tab when clicked
    const mapUrl = `https://www.google.com/maps/@${facility.latitude},${facility.longitude},20z`;

    return (
      <div 
        className="w-full h-full rounded-lg overflow-hidden relative z-0"
        style={width && height ? { width, height, zIndex: 0 } : { zIndex: 0 }}
      >
        <iframe
          src={freeEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0, pointerEvents: 'none' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        {/* Transparent overlay to handle clicks */}
        <div
          className="absolute inset-0 cursor-pointer"
          style={{ zIndex: 1 }}
          onClick={(e) => {
            e.stopPropagation();
            window.open(mapUrl, '_blank', 'noopener,noreferrer');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              window.open(mapUrl, '_blank', 'noopener,noreferrer');
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Open location in Google Maps"
        />
      </div>
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

  // Google Maps URL to open in new tab when clicked (for production)
  const mapUrl = `https://www.google.com/maps/@${facility.latitude},${facility.longitude},20z`;

  return (
    <div 
      ref={mapRef}
      className="w-full h-full rounded-lg overflow-hidden relative z-0"
      style={width && height ? { width, height, zIndex: 0 } : { zIndex: 0 }}
    >
      {/* Transparent overlay to handle clicks for production API map */}
      <div
        className="absolute inset-0 cursor-pointer"
        style={{ zIndex: 1 }}
        onClick={(e) => {
          e.stopPropagation();
          window.open(mapUrl, '_blank', 'noopener,noreferrer');
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            window.open(mapUrl, '_blank', 'noopener,noreferrer');
          }
        }}
        tabIndex={0}
        role="button"
        aria-label="Open location in Google Maps"
      />
    </div>
  );
}
