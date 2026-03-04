"""Firestore service for database operations."""
from typing import Optional, List, Dict, Any
import traceback
from google.cloud import firestore
from google.cloud.firestore_v1.base_query import BaseQuery
from config import GOOGLE_CLOUD_PROJECT_ID, FIRESTORE_COLLECTION
from utils import matches_search


class FirestoreService:
    """Service class for Firestore database operations."""
    
    def __init__(self, project_id: str = GOOGLE_CLOUD_PROJECT_ID, 
                 collection_name: str = FIRESTORE_COLLECTION):
        """Initialize Firestore client and collection.
        
        Args:
            project_id: Google Cloud project ID
            collection_name: Firestore collection name
        """
        self.db = firestore.Client(project=project_id)
        self.collection = self.db.collection(collection_name)
    
    def get_facility_by_id(self, osm_id: str) -> Optional[Dict[str, Any]]:
        """Get a single facility by OSM ID.
        
        Args:
            osm_id: OpenStreetMap ID
            
        Returns:
            Facility data dictionary or None if not found
        """
        doc = self.collection.document(osm_id).get()
        if not doc.exists:
            return None
        
        facility_data = doc.to_dict()
        facility_data["osm_id"] = doc.id
        return facility_data
    
    def build_query(
        self,
        state: Optional[str] = None,
        search: Optional[str] = None,
    ) -> BaseQuery:
        """Build a Firestore query with filters.
        
        Args:
            state: Filter by state abbreviation
            search: Full-text search query (applied after fetching)
            
        Returns:
            Firestore query object
        """
        # For Firestore composite indexes, where clauses should come before order_by
        query = self.collection
        
        if state:
            query = query.where("state", "==", state.upper())
        
        # Order by sort_name for consistent sorting (this field should have normalized values)
        query = query.order_by("sort_name")
        
        return query
    
    def get_facilities_paginated(
        self,
        limit: int,
        cursor: Optional[str] = None,
        page: Optional[int] = None,
        state: Optional[str] = None,
        search: Optional[str] = None,
    ) -> tuple[List[Dict[str, Any]], bool, Optional[str], Optional[int]]:
        """Get facilities with virtual pagination, ordered by name.
        
        Fetches records with state filter, applies search filter, then paginates.
        State filtering is done server-side using the state field.
        Search filtering is applied before pagination (client-side text matching).
        
        Args:
            limit: Number of records per page
            cursor: Cursor for cursor-based pagination (not currently used)
            page: Page number for offset-based pagination (1-indexed)
            state: Filter by state abbreviation (uses state field directly)
            search: Full-text search query (applied before pagination)
            
        Returns:
            Tuple of (facilities list, has_next_page, next_cursor, total_count) 
        """
        # Build base query with state filter (if provided) and order by name
        query = self.build_query(state=state, search=search)
        
        # Fetch all matching records (with state filter) - we'll apply search and paginate after
        # Note: This is necessary because Firestore doesn't support full-text search natively
        all_docs = list(query.stream())
        
        # Convert to facility dictionaries and apply search filter
        all_facilities = []
        for doc in all_docs:
            facility_data = doc.to_dict()
            # Ensure osm_id is set from document ID
            facility_data["osm_id"] = str(doc.id)
            
            # Apply search filter (client-side text matching) BEFORE pagination
            if search:
                if not matches_search(facility_data, search):
                    continue
            
            all_facilities.append(facility_data)
        
        # sort_name field should already be normalized in Firestore
        # No need for additional Python-side sorting since sort_name handles empty names
        # But we'll keep a simple sort as a safety measure in case sort_name is missing
        all_facilities.sort(key=lambda x: (
            str(x.get("sort_name", "")).lower() if x.get("sort_name") else "\uffff",
            str(x.get("name", "")).lower() if x.get("name") else "\uffff"
        ))
        
        # Now apply pagination to the filtered results
        total_filtered = len(all_facilities)
        
        if page:
            offset = (page - 1) * limit
            facilities_list = all_facilities[offset:offset + limit]
            has_next = offset + limit < total_filtered
        else:
            # First page or cursor-based
            facilities_list = all_facilities[:limit]
            has_next = len(all_facilities) > limit
        
        # Get next cursor (using osm_id of last item)
        next_cursor = None
        if facilities_list and has_next:
            next_cursor = facilities_list[-1].get("osm_id")
        
        # Total count is the number of filtered facilities (after search)
        total_count = total_filtered
        
        return facilities_list, has_next, next_cursor, total_count
    
    def get_all_facilities(self) -> List[Dict[str, Any]]:
        """Get all facilities from the collection.
        
        Note: This may be slow for large datasets. Consider caching.
        
        Returns:
            List of all facility dictionaries
        """
        all_docs = self.collection.stream()
        facilities = []
        
        for doc in all_docs:
            facility_data = doc.to_dict()
            facility_data["osm_id"] = doc.id
            facilities.append(facility_data)
        
        return facilities
    
    def get_stats(self) -> Dict[str, int]:
        """Get statistics about facilities.
        
        Returns:
            Dictionary with statistics (total_count, enriched_count, etc.)
        """
        all_docs = self.collection.stream()
        
        total_count = 0
        enriched_count = 0
        drinking_water_count = 0
        wastewater_count = 0
        
        for doc in all_docs:
            total_count += 1
            data = doc.to_dict()
            
            if data.get("is_enriched") == 1:
                enriched_count += 1
            
            facility_type = data.get("facility_type", "")
            if facility_type == "Drinking Water Treatment":
                drinking_water_count += 1
            elif facility_type == "Wastewater Treatment":
                wastewater_count += 1
        
        return {
            "total_count": total_count,
            "enriched_count": enriched_count,
            "not_enriched_count": total_count - enriched_count,
            "drinking_water_count": drinking_water_count,
            "wastewater_count": wastewater_count,
        }
