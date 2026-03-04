"""Utility functions."""
from typing import Optional
from config import US_STATES, SEARCH_FIELDS


def extract_state_from_address(address: str) -> Optional[str]:
    """Extract state abbreviation from address string.
    
    Args:
        address: Full address string
        
    Returns:
        State abbreviation (e.g., "CA", "NY") or None if not found
    """
    if not address:
        return None
    
    address_parts = address.split(",")
    for part in reversed(address_parts):
        part = part.strip()
        if len(part) == 2 and part.upper() in US_STATES:
            return part.upper()
    
    return None


def matches_search(facility: dict, search_query: str) -> bool:
    """Check if facility matches search query (client-side search).
    
    Args:
        facility: Facility data dictionary
        search_query: Search query string
        
    Returns:
        True if facility matches search query, False otherwise
    """
    if not search_query:
        return True
    
    search_lower = search_query.lower().strip()
    search_original = search_query.strip()
    
    for field in SEARCH_FIELDS:
        field_value = facility.get(field, "")
        
        # Convert to string for comparison
        field_str = str(field_value).strip()
        field_lower = field_str.lower()
        
        # For OSM ID, check both exact match and substring match
        # OSM ID might be stored as number or string, and is also the document ID
        if field == "osm_id":
            # Check exact match (case-insensitive and case-sensitive)
            if search_lower == field_lower or search_original == field_str:
                return True
            # Also check if search is contained in OSM ID
            if search_lower in field_lower:
                return True
        else:
            # For other fields, check if search is contained
            if search_lower in field_lower:
                return True
    
    return False
