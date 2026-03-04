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
        
        Fetches only the records for the requested page using Firestore's offset/limit.
        State filtering is done server-side using the state field.
        Search filtering is applied after fetching the page (client-side text matching).
        
        Args:
            limit: Number of records per page
            cursor: Cursor for cursor-based pagination (not currently used)
            page: Page number for offset-based pagination (1-indexed)
            state: Filter by state abbreviation (uses state field directly)
            search: Full-text search query (applied after fetching page)
            
        Returns:
            Tuple of (facilities list, has_next_page, next_cursor, total_count) 
        """
        # Build base query with state filter (if provided) and order by name
        query = self.build_query(state=state, search=search)
        
        # For page-based pagination, calculate offset
        if page:
            offset = (page - 1) * limit
            # Apply offset and limit to query - Firestore will fetch only this page
            query = query.offset(offset).limit(limit + 1)  # Fetch one extra to check if there's a next page
        else:
            # For cursor-based or first page, just use limit
            query = query.limit(limit + 1)  # Fetch one extra to check if there's a next page
        
        # Execute query - this fetches only the records for the requested page
        docs = list(query.stream())
        
        # Check if there's a next page (we fetched limit + 1)
        has_next = len(docs) > limit
        
        # Always return exactly 'limit' number of documents
        docs = docs[:limit]  # Slice to exact limit
        
        facilities_list = []
        for doc in docs:
            facility_data = doc.to_dict()
            # Ensure osm_id is set from document ID
            facility_data["osm_id"] = str(doc.id)
            
            # Apply search filter (client-side text matching)
            if search:
                if not matches_search(facility_data, search):
                    continue
            
            facilities_list.append(facility_data)
        
        # sort_name field should already be normalized in Firestore
        # No need for additional Python-side sorting since sort_name handles empty names
        # But we'll keep a simple sort as a safety measure in case sort_name is missing
        facilities_list.sort(key=lambda x: (
            str(x.get("sort_name", "")).lower() if x.get("sort_name") else "\uffff",
            str(x.get("name", "")).lower() if x.get("name") else "\uffff"
        ))
        
        # If search filter was applied and filtered out results, we may need to adjust has_next
        # But we can't fetch more, so we'll keep the original has_next from the query
        # The frontend will handle this by checking if we got fewer results than expected
        
        # Get next cursor (using osm_id of last item)
        next_cursor = None
        if facilities_list and has_next:
            next_cursor = facilities_list[-1].get("osm_id")
        
        # For total_count: Get accurate count for the filtered state
        # IMPORTANT: Get total count BEFORE pagination, for the filtered state
        # Use manual count with select([]) - this is reliable and efficient (only fetches document IDs)
        total_count = None
        try:
            # Build count query with same filters (state filter) but without order_by
            # We use select([]) to only fetch document IDs, not full documents (efficient)
            count_query = self.collection
            if state:
                count_query = count_query.where("state", "==", state.upper())
            
            # Count all matching documents by streaming with select([])
            # This only fetches document IDs, not full document data
            doc_count = 0
            for doc in count_query.select([]).stream():
                doc_count += 1
            total_count = doc_count
        except Exception as e:
            # If counting fails, try to estimate based on current page results
            # If we have has_next, we know there are more than what we fetched
            if has_next:
                # Estimate: at least (current page * limit) + 1
                estimated_min = (page * limit if page else limit) + 1
                total_count = estimated_min
            else:
                # No next page, so total is exactly what we have
                total_count = len(facilities_list)
        
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
