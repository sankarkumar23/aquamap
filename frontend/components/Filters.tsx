'use client';

import { FacilityFilters } from '@/types/facility';
import { US_STATES } from '@/lib/states';

interface FiltersProps {
  filters: FacilityFilters;
  onFiltersChange: (filters: FacilityFilters) => void;
}

export function Filters({ filters, onFiltersChange }: FiltersProps) {
  const handleStateChange = (value: string) => {
    onFiltersChange({
      ...filters,
      state: value === '' ? undefined : value,
    });
  };

  return (
    <div className="mb-4">
      <div className="max-w-xs">
        <select
          value={filters.state || ''}
          onChange={(e) => handleStateChange(e.target.value)}
          className="w-full px-3 py-2.5 h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {US_STATES.map((state) => (
            <option key={state.value} value={state.value}>
              {state.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
