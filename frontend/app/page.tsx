'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SearchBar } from '@/components/SearchBar';
import { Filters } from '@/components/Filters';
import { FacilitiesGrid } from '@/components/FacilitiesGrid';
import { FacilityDetailModal } from '@/components/FacilityDetailModal';
import { AquaMapIcon } from '@/components/AquaMapIcon';
import { fetchStats } from '@/lib/api';
import { Facility, FacilityFilters } from '@/types/facility';

export default function Home() {
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [filters, setFilters] = useState<FacilityFilters>({ state: 'TX' });
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when filters change
  const handleFiltersChange = (newFilters: FacilityFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
  });


  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AquaMapIcon size={40} className="flex-shrink-0" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Water Facility Management System</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Water Treatment Facilities Database
                </p>
              </div>
            </div>
            {stats && (
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.total_count.toLocaleString()}
                  </div>
                  <div className="text-gray-600">Total Facilities</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.enriched_count.toLocaleString()}
                  </div>
                  <div className="text-gray-600">Enriched</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.drinking_water_count.toLocaleString()}
                  </div>
                  <div className="text-gray-600">Drinking Water</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.wastewater_count.toLocaleString()}
                  </div>
                  <div className="text-gray-600">Wastewater</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden w-full px-4 sm:px-6 lg:px-8 py-4">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-4 flex-shrink-0">
          <div className="w-full md:w-[70%]">
            <SearchBar
              value={filters.search || ''}
              onChange={(value) => {
                // When searching, clear state filter to allow searching across all states
                // This is especially important when searching by OSM ID
                const newFilters = { ...filters, search: value };
                if (value && value.trim()) {
                  // Clear state filter when there's an active search
                  delete newFilters.state;
                }
                setFilters(newFilters);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="w-full md:w-[30%]">
            <Filters filters={filters} onFiltersChange={handleFiltersChange} />
          </div>
        </div>

        {/* Grid Content */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <FacilitiesGrid
            filters={filters}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onFacilityClick={setSelectedFacility}
            totalCount={stats?.total_count}
          />
        </div>
      </main>

      {/* Detail Modal */}
      <FacilityDetailModal
        facility={selectedFacility}
        onClose={() => setSelectedFacility(null)}
      />
    </div>
  );
}
