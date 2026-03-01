"""Pydantic models for API requests and responses."""
from typing import Optional, List
from pydantic import BaseModel


class Facility(BaseModel):
    """Facility data model."""
    osm_id: str
    osm_type: str
    facility_type: str
    name: str
    operator: str
    address: str
    phone: str
    website: str
    capacity: str
    description: str
    latitude: float
    longitude: float
    coordinates_from_polygon: int
    polygon_wkt: str
    osm_url: str
    place_id: str
    google_maps_url: str
    types: str
    business_status: str
    distance_from_osm: float
    matched_keywords: str
    is_enriched: int


class PaginationInfo(BaseModel):
    """Pagination metadata."""
    has_next_page: bool
    next_cursor: Optional[str] = None
    total_count: Optional[int] = None
    current_page: Optional[int] = None
    per_page: int


class FacilitiesResponse(BaseModel):
    """Response model for facilities list."""
    data: List[Facility]
    pagination: PaginationInfo


class StatsResponse(BaseModel):
    """Response model for statistics."""
    total_count: int
    enriched_count: int
    not_enriched_count: int
    drinking_water_count: int
    wastewater_count: int
