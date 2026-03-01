"""FastAPI application main file."""
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import uvicorn

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
    facility_type: Optional[str] = Query(None, description="Filter by facility type"),
    state: Optional[str] = Query(None, description="Filter by state abbreviation"),
    is_enriched: Optional[int] = Query(None, ge=0, le=1, description="Filter by enrichment status"),
):
    """Get facilities with pagination, filtering, and search."""
    try:
        facilities_list, has_next, next_cursor, total_count = firestore_service.get_facilities_paginated(
            limit=limit,
            cursor=cursor,
            page=page,
            facility_type=facility_type,
            is_enriched=is_enriched,
            state=state,
            search=search,
        )
        
        # Convert to Facility models
        facilities = [Facility(**fac) for fac in facilities_list]
        
        return FacilitiesResponse(
            data=facilities,
            pagination=PaginationInfo(
                has_next_page=has_next,
                next_cursor=next_cursor,
                current_page=page if page else 1,
                per_page=limit,
                total_count=total_count,
            )
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/facilities/stats", response_model=StatsResponse)
async def get_stats():
    """Get statistics about facilities."""
    try:
        stats = firestore_service.get_stats()
        return StatsResponse(**stats)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/facilities/{osm_id}", response_model=Facility)
async def get_facility(osm_id: str):
    """Get a single facility by OSM ID."""
    try:
        facility_data = firestore_service.get_facility_by_id(osm_id)
        
        if not facility_data:
            raise HTTPException(status_code=404, detail="Facility not found")
        
        return Facility(**facility_data)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": API_TITLE, "version": API_VERSION}


if __name__ == "__main__":
    uvicorn.run(app, host=API_HOST, port=API_PORT)
