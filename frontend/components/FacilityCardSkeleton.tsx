'use client';

export function FacilityCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Map Preview Skeleton */}
      <div className="w-full h-48 bg-gray-200 shimmer"></div>

      {/* Facility Info Skeleton */}
      <div className="p-4">
        {/* Name Skeleton */}
        <div className="h-6 bg-gray-200 rounded mb-2 w-3/4 shimmer"></div>
        
        <div className="space-y-2 mt-3">
          {/* Address Skeleton */}
          <div className="flex items-start gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded flex-shrink-0 mt-0.5 shimmer"></div>
            <div className="h-4 bg-gray-200 rounded flex-1 shimmer"></div>
          </div>
          
          {/* Phone Skeleton */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded flex-shrink-0 shimmer"></div>
            <div className="h-4 bg-gray-200 rounded w-32 shimmer"></div>
          </div>
          
          {/* Website Skeleton */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded flex-shrink-0 shimmer"></div>
            <div className="h-4 bg-gray-200 rounded w-40 shimmer"></div>
          </div>
        </div>

        {/* Badge Skeleton */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-24 shimmer"></div>
        </div>
      </div>
    </div>
  );
}
