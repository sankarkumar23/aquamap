"""Configuration constants and settings."""
import os
from dotenv import load_dotenv

load_dotenv()

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT_ID", "aquamap-488903")
FIRESTORE_COLLECTION = os.getenv("FIRESTORE_COLLECTION", "facility")

# API Configuration
# Cloud Run uses PORT environment variable
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("PORT", os.getenv("API_PORT", 8000)))
API_TITLE = "Water Facility Management System API"
API_VERSION = "1.0.0"

# CORS Configuration
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

# Pagination Defaults
DEFAULT_PAGE_SIZE = 50
MAX_PAGE_SIZE = 100
MIN_PAGE_SIZE = 1

# US State Abbreviations
US_STATES = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
]

# Facility Types
FACILITY_TYPE_DRINKING_WATER = "Drinking Water Treatment"
FACILITY_TYPE_WASTEWATER = "Wastewater Treatment"

# Search Fields
SEARCH_FIELDS = [
    "name",
    "address",
    "phone",
    "website",
    "types",
    "description",
    "operator",
    "osm_id",  # Include OSM ID in search
]
