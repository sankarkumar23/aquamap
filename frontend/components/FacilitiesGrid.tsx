'use client';

import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { fetchFacilities } from '@/lib/api';
import { Facility, FacilityFilters } from '@/types/facility';
import { MapPin, Phone, Globe } from 'lucide-react';
import { Pagination } from './Pagination';
import { FacilityCardSkeleton } from './FacilityCardSkeleton';

// Dynamically import FacilityMapPreview to avoid SSR issues with Leaflet
const FacilityMapPreview = dynamic(() => import('./FacilityMapPreview').then(mod => ({ default: mod.FacilityMapPreview })), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-200 animate-pulse" />
});

interface FacilitiesGridProps {
  filters: FacilityFilters;
  currentPage: number;
  onPageChange: (page: number) => void;
  onFacilityClick: (facility: Facility) => void;
  totalCount?: number;
}

export function FacilitiesGrid({ 
  filters, 
  currentPage, 
  onPageChange,
  onFacilityClick,
  totalCount
}: FacilitiesGridProps) {
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['facilities', filters, currentPage],
    queryFn: () => fetchFacilities(50, null, currentPage, filters),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {Array.from({ length: 20 }).map((_, index) => (
              <FacilityCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error loading facilities. Please try again.</div>
      </div>
    );
  }

  const facilities = data?.data ?? [];
  const pagination = data?.pagination;
  
  // Calculate total pages - use has_next_page to determine if we can go further
  let totalPages = currentPage;
  if (pagination?.total_count) {
    totalPages = Math.ceil(pagination.total_count / (pagination.per_page || 50));
  } else if (pagination?.has_next_page) {
    // If we have a next page but no total count, set totalPages to current + 1
    // This allows the Next button to work even without exact total count
    totalPages = currentPage + 1;
  }
  
  // Ensure at least 1 page
  totalPages = Math.max(1, totalPages);

  // Calculate display info - prioritize pagination.total_count (filtered count) over stats totalCount
  // When filters are active, pagination.total_count contains the filtered count
  // When no filters, use totalCount from stats (overall total) if pagination.total_count is not available
  const itemsPerPage = pagination?.per_page || 50;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = startItem + facilities.length - 1;
  const totalItems = pagination?.total_count ?? totalCount ?? facilities.length;
  
  // Recalculate total pages with actual total count
  const actualTotalPages = pagination?.total_count 
    ? Math.ceil(pagination.total_count / itemsPerPage)
    : (totalCount ? Math.ceil(totalCount / itemsPerPage) : totalPages);

  return (
    <div className="flex flex-col h-full">
      {/* Pagination at top - inline with info */}
      {pagination && (
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-3 bg-gray-50">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{startItem.toLocaleString()}</span> to{' '}
              <span className="font-semibold text-gray-900">{endItem.toLocaleString()}</span> of{' '}
              <span className="font-semibold text-gray-900">{totalItems.toLocaleString()}</span> facilities
              {actualTotalPages > 1 && (
                <> (Page <span className="font-semibold text-gray-900">{currentPage}</span> of{' '}
                <span className="font-semibold text-gray-900">{actualTotalPages}</span>)</>
              )}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={actualTotalPages}
              onPageChange={onPageChange}
              isLoading={isLoading}
              hasNextPage={pagination.has_next_page}
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto p-6">
        {facilities.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">No facilities found</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {facilities.map((facility) => (
              <div
                key={facility.osm_id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden flex flex-col"
              >
                {/* Map Preview - Clickable to open map in new tab */}
                <div 
                  className="w-full h-48 bg-gray-200 relative overflow-hidden cursor-pointer" 
                  style={{ zIndex: 0 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Open OSM map in new tab (prefer OSM, fallback to Google Maps)
                    const mapUrl = facility.osm_url || facility.google_maps_url;
                    if (mapUrl) {
                      window.open(mapUrl, '_blank', 'noopener,noreferrer');
                    }
                  }}
                >
                  <FacilityMapPreview facility={facility} />
                </div>

                {/* Facility Info */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {facility.name || 'Unnamed Facility'}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-600 flex-1">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{facility.address}</span>
                    </div>
                    
                    {facility.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span>{facility.phone}</span>
                      </div>
                    )}
                    
                    {facility.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 flex-shrink-0" />
                        <a
                          href={facility.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-600 hover:underline truncate"
                        >
                          {facility.website}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {facility.facility_type}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onFacilityClick(facility);
                      }}
                      className="px-4 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                    >
                      View Detail
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
