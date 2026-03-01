'use client';

import { useEffect } from 'react';
import { Facility } from '@/types/facility';
import { X, MapPin, Phone, Globe, ExternalLink } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import FacilityMapPreview to avoid SSR issues
const FacilityMapPreview = dynamic(() => import('./FacilityMapPreview').then(mod => ({ default: mod.FacilityMapPreview })), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg" />
});

interface FacilityDetailModalProps {
  facility: Facility | null;
  onClose: () => void;
}

export function FacilityDetailModal({ facility, onClose }: FacilityDetailModalProps) {
  // Handle ESC key to close modal
  useEffect(() => {
    if (!facility) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [facility, onClose]);

  if (!facility) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[95vh] overflow-y-auto relative z-[10000]">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-900 line-clamp-2 pr-4">{facility.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Basic Information */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Basic Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500">Facility Type</label>
                <p className="text-sm text-gray-900 mt-0.5">{facility.facility_type}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">OSM ID</label>
                <p className="text-sm text-gray-900 mt-0.5">{facility.osm_id}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Operator</label>
                <p className="text-sm text-gray-900 mt-0.5">{facility.operator || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Capacity</label>
                <p className="text-sm text-gray-900 mt-0.5">{facility.capacity || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Business Status</label>
                <p className="text-sm text-gray-900 mt-0.5">{facility.business_status || 'N/A'}</p>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Contact Information</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-500">Address</label>
                    <p className="text-sm text-gray-900 mt-0.5">{facility.address || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-500">Phone</label>
                    <p className="text-sm text-gray-900 mt-0.5">{facility.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
              {facility.website && (
                <div className="flex items-start gap-2">
                  <Globe className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-500">Website</label>
                    <a
                      href={facility.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      {facility.website}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Location Data */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Location Data</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-medium text-gray-500">Latitude</label>
                <p className="text-sm text-gray-900 mt-0.5">{Number(facility.latitude).toFixed(5)}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Longitude</label>
                <p className="text-sm text-gray-900 mt-0.5">{Number(facility.longitude).toFixed(5)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {facility.google_maps_url && (
                <a
                  href={facility.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Google Maps
                </a>
              )}
              <a
                href={facility.osm_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                OpenStreetMap
              </a>
            </div>
          </section>

          {/* Map View */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Location Map</h3>
            <div className="w-full h-48 rounded-lg overflow-hidden border border-gray-200">
              <FacilityMapPreview facility={facility} width={800} height={192} />
            </div>
          </section>

          {/* Description */}
          {facility.description && (
            <section>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-700">{facility.description}</p>
            </section>
          )}

          {/* Polygon Info */}
          {facility.polygon_wkt && (
            <section>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Polygon Data</h3>
              <p className="text-xs font-mono text-gray-600 bg-gray-50 p-2 rounded break-all">
                {facility.polygon_wkt.substring(0, 150)}...
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
