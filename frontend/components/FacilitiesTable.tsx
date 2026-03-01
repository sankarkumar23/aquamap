'use client';

import { useMemo, useRef, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { fetchFacilities } from '@/lib/api';
import { Facility, FacilityFilters } from '@/types/facility';
import { MapPin, Phone, Globe, CheckCircle, XCircle } from 'lucide-react';

interface FacilitiesTableProps {
  filters: FacilityFilters;
  onRowClick: (facility: Facility) => void;
}

export function FacilitiesTable({ filters, onRowClick }: FacilitiesTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['facilities', filters],
    queryFn: ({ pageParam }) => fetchFacilities(50, pageParam, undefined, filters),
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.has_next_page
        ? lastPage.pagination.next_cursor
        : undefined;
    },
    initialPageParam: null as string | null,
  });

  const facilities = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  const virtualizer = useVirtualizer({
    count: facilities.length + (hasNextPage ? 1 : 0),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 10,
  });

  useEffect(() => {
    const [lastItem] = [...virtualizer.getVirtualItems()].reverse();

    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= facilities.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    facilities.length,
    virtualizer.getVirtualItems(),
  ]);

  if (status === 'pending') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading facilities...</div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error loading facilities. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <div
          ref={parentRef}
          className="h-[600px] overflow-auto"
          style={{ contain: 'strict' }}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const facility = facilities[virtualRow.index];
              const isLoaderRow = virtualRow.index > facilities.length - 1;

              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {isLoaderRow ? (
                    <div className="flex items-center justify-center p-4">
                      {hasNextPage ? (
                        <div className="text-gray-500">Loading more...</div>
                      ) : (
                        <div className="text-gray-400">No more facilities</div>
                      )}
                    </div>
                  ) : facility ? (
                    <div
                      className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => onRowClick(facility)}
                    >
                      <div className="px-6 py-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {facility.name}
                              </h3>
                              {facility.is_enriched === 1 ? (
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                              ) : (
                                <XCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                              )}
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{facility.address}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                {facility.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    <span>{facility.phone}</span>
                                  </div>
                                )}
                                {facility.website && (
                                  <div className="flex items-center gap-2">
                                    <Globe className="w-4 h-4" />
                                    <a
                                      href={facility.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-blue-600 hover:underline truncate max-w-xs"
                                    >
                                      {facility.website}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {facility.facility_type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
