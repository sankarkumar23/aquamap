import { Facility, FacilitiesResponse, StatsResponse, FacilityFilters } from '@/types/facility';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchFacilities(
  limit: number = 50,
  cursor?: string | null,
  page?: number,
  filters?: FacilityFilters
): Promise<FacilitiesResponse> {
  const params = new URLSearchParams({
    limit: limit.toString(),
  });

  if (cursor) {
    params.append('cursor', cursor);
  }

  if (page) {
    params.append('page', page.toString());
  }

  if (filters?.search) {
    params.append('search', filters.search);
  }

  if (filters?.facility_type) {
    params.append('facility_type', filters.facility_type);
  }

  if (filters?.state) {
    params.append('state', filters.state);
  }

  if (filters?.is_enriched !== undefined) {
    params.append('is_enriched', filters.is_enriched.toString());
  }

  const response = await fetch(`${API_BASE_URL}/api/facilities?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch facilities: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchFacility(osm_id: string): Promise<Facility> {
  const response = await fetch(`${API_BASE_URL}/api/facilities/${osm_id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch facility: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchStats(): Promise<StatsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/facilities/stats`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch stats: ${response.statusText}`);
  }

  return response.json();
}
