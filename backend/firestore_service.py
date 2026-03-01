"""Firestore service for database operations."""
from typing import Optional, List, Dict, Any
from google.cloud import firestore
from google.cloud.firestore_v1.base_query import BaseQuery
from config import GOOGLE_CLOUD_PROJECT_ID, FIRESTORE_COLLECTION
from utils import extract_state_from_address, matches_search


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
        facility_type: Optional[str] = None,
        is_enriched: Optional[int] = None,
    ) -> BaseQuery:
        """Build a Firestore query with filters.
        
        Args:
            facility_type: Filter by facility type
            is_enriched: Filter by enrichment status (0 or 1)
            
        Returns:
            Firestore query object
        """
        # Don't order by name in Firestore since empty strings come first
        # We'll sort in memory after fetching to put empty names at bottom
        query = self.collection.order_by("osm_id")  # Use osm_id for consistent ordering
        
        if facility_type:
            query = query.where("facility_type", "==", facility_type)
        
        if is_enriched is not None:
            query = query.where("is_enriched", "==", is_enriched)
        
        return query
    
    def get_facilities_paginated(
        self,
        limit: int,
        cursor: Optional[str] = None,
        page: Optional[int] = None,
        facility_type: Optional[str] = None,
        is_enriched: Optional[int] = None,
        state: Optional[str] = None,
        search: Optional[str] = None,
    ) -> tuple[List[Dict[str, Any]], bool, Optional[str], Optional[int]]:
        """Get facilities with pagination, filtering, and search.
        
        IMPORTANT: Always fetch ALL records, apply filters and sorting, then paginate.
        This ensures filtering and sorting work across the entire dataset.
        
        Args:
            limit: Number of records per page
            cursor: Cursor for cursor-based pagination (not used when filters are active)
            page: Page number for offset-based pagination
            facility_type: Filter by facility type
            is_enriched: Filter by enrichment status
            state: Filter by state abbreviation
            search: Full-text search query
            
        Returns:
            Tuple of (facilities list, has_next_page, next_cursor, total_count) 
        """
        # Build base query
        query = self.build_query(facility_type, is_enriched)
        
        # ALWAYS fetch ALL records to ensure proper filtering and sorting across entire dataset
        # This is necessary because:
        # 1. State filter extracts from address (client-side operation)
        # 2. Search is client-side text matching
        # 3. Sorting by name with empty names at bottom requires full dataset
        print(f"[DEBUG] Fetching all records for filtering/sorting. Filters: state={state}, search={search}, facility_type={facility_type}, is_enriched={is_enriched}")
        
        # Fetch ALL documents from Firestore (no limit)
        docs = query.stream()
        facilities_list = []
        
        # Fetch all documents
        doc_count = 0
        for doc in docs:
            doc_count += 1
            facility_data = doc.to_dict()
            facility_data["osm_id"] = doc.id
            
            # Apply state filter (client-side since we extract from address)
            if state:
                facility_state = extract_state_from_address(facility_data.get("address", ""))
                if facility_state != state.upper():
                    continue
            
            # Apply search filter (client-side)
            if search:
                if not matches_search(facility_data, search):
                    continue
            
            facilities_list.append(facility_data)
        
        print(f"[DEBUG] Fetched {doc_count} total documents, {len(facilities_list)} after filtering")
        
        # Sort by name: non-empty names first (case-insensitive), then empty/null names at bottom
        def sort_key(facility):
            name = facility.get("name", "").strip()
            if not name or name == "":
                # Empty names go to bottom - use a high value to ensure they sort last
                return (1, "zzzzzzzzzzzzzzzzzzzz")  # Use very high value to ensure empty names are last
            return (0, name.lower())  # Non-empty names sorted alphabetically
        
        facilities_list.sort(key=sort_key)
        print(f"[DEBUG] Sorted {len(facilities_list)} facilities")
        
        # Calculate total count BEFORE pagination (this is the true total after filtering)
        total_count = len(facilities_list)
        
        # Apply pagination AFTER filtering and sorting
        # For page-based pagination
        if page:
            offset = (page - 1) * limit
            facilities_list = facilities_list[offset:offset + limit]
            has_next = (offset + limit) < total_count
        else:
            # For cursor-based or first page, just take the first 'limit' records
            has_next = len(facilities_list) > limit
            if has_next:
                facilities_list = facilities_list[:limit]
        
        # Get next cursor (using osm_id of last item)
        next_cursor = None
        if facilities_list and has_next:
            next_cursor = facilities_list[-1].get("osm_id")
        
        print(f"[DEBUG] Returning {len(facilities_list)} facilities, has_next={has_next}, total_count={total_count}")
        
        # Return total count (calculated after filtering, before pagination)
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
