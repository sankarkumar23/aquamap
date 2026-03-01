export interface Facility {
  osm_id: string;
  osm_type: string;
  facility_type: string;
  name: string;
  operator: string;
  address: string;
  phone: string;
  website: string;
  capacity: string;
  description: string;
  latitude: number;
  longitude: number;
  coordinates_from_polygon: number;
  polygon_wkt: string;
  osm_url: string;
  place_id: string;
  google_maps_url: string;
  types: string;
  business_status: string;
  distance_from_osm: number;
  matched_keywords: string;
  is_enriched: number;
}

export interface PaginationInfo {
  has_next_page: boolean;
  next_cursor: string | null;
  total_count: number | null;
  current_page: number | null;
  per_page: number;
}

export interface FacilitiesResponse {
  data: Facility[];
  pagination: PaginationInfo;
}

export interface StatsResponse {
  total_count: number;
  enriched_count: number;
  not_enriched_count: number;
  drinking_water_count: number;
  wastewater_count: number;
}

export interface FacilityFilters {
  search?: string;
  facility_type?: string;
  state?: string;
  is_enriched?: number;
}
