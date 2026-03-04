"""FastAPI application main file."""
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import uvicorn
import logging
import traceback

from config import (
    API_TITLE,
    API_VERSION,
    CORS_ORIGINS,
    API_HOST,
    API_PORT,
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE,
    MIN_PAGE_SIZE,
)
from models import Facility, FacilitiesResponse, PaginationInfo, StatsResponse
from firestore_service import FirestoreService

# Initialize FastAPI app
app = FastAPI(title=API_TITLE, version=API_VERSION)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Firestore service
firestore_service = FirestoreService()


@app.get("/api/facilities", response_model=FacilitiesResponse)
async def get_facilities(
    limit: int = Query(
        DEFAULT_PAGE_SIZE,
        ge=MIN_PAGE_SIZE,
        le=MAX_PAGE_SIZE,
        description="Number of records per page"
    ),
    cursor: Optional[str] = Query(None, description="Cursor for cursor-based pagination"),
    page: Optional[int] = Query(None, ge=1, description="Page number for offset-based pagination"),
    search: Optional[str] = Query(None, description="Full-text search query"),
    state: Optional[str] = Query(None, description="Filter by state abbreviation"),
):
    """Get paginated list of facilities with optional filters."""
    try:
        facilities_list, has_next, next_cursor, total_count = firestore_service.get_facilities_paginated(
            limit=limit,
            cursor=cursor,
            page=page,
            search=search,
            state=state,
        )
        
        # Convert to FacilitiesResponse model
        pagination = PaginationInfo(
            has_next_page=has_next,
            next_cursor=next_cursor,
            total_count=total_count,
            current_page=page,
            per_page=limit
        )
        
        return FacilitiesResponse(
            data=facilities_list,
            pagination=pagination
        )
    except Exception as e:
        error_traceback = traceback.format_exc()
        logger.error(f"Error in get_facilities: {str(e)}\n{error_traceback}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/facilities/stats", response_model=StatsResponse)
async def get_stats():
    """Get statistics about facilities."""
    try:
        stats = firestore_service.get_stats()
        return stats
    except Exception as e:
        error_traceback = traceback.format_exc()
        logger.error(f"Error in get_stats: {str(e)}\n{error_traceback}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/facilities/{osm_id}", response_model=Facility)
async def get_facility(osm_id: str):
    """Get a single facility by OSM ID."""
    try:
        facility = firestore_service.get_facility_by_osm_id(osm_id)
        if not facility:
            raise HTTPException(status_code=404, detail="Facility not found")
        return facility
    except HTTPException:
        raise
    except Exception as e:
        error_traceback = traceback.format_exc()
        logger.error(f"Error in get_facility: {str(e)}\n{error_traceback}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": API_TITLE, "version": API_VERSION}


# For local development
if __name__ == "__main__":
    uvicorn.run(app, host=API_HOST, port=API_PORT)
