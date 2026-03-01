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
    
    search_lower = search_query.lower()
    
    for field in SEARCH_FIELDS:
        field_value = facility.get(field, "")
        if search_lower in str(field_value).lower():
            return True
    
    return False
