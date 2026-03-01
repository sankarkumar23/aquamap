# Web Application Development Prompt

Use this prompt to create a web application for viewing water treatment facilities data from Firestore.

---

## Project Requirements

Build a full-stack web application with Python backend (Flask or FastAPI) and a modern frontend (React/Next.js or Vue.js) to display water treatment facility data stored in Google Cloud Firestore.

## Google Cloud & Firestore Configuration

### Google Cloud Project Details
- **Project ID:** `aquamap-488903`
- **Project Name:** AquaMap
- **Organization:** sandykamy36-org (415798345098)
- **Google Account:** sandykamy36@gmail.com
- **Firestore Database:** Native mode (already created)
- **Collection Name:** `facility`
- **Total Records:** ~15,611 facilities

### Firestore Authentication
Use Application Default Credentials (ADC) for local development:
```bash
gcloud auth application-default login
gcloud auth application-default set-quota-project aquamap-488903
```

For production, use a service account JSON key with Firestore access.

### Firestore Console Links
- **Firestore Console:** https://console.cloud.google.com/firestore?project=aquamap-488903
- **Firestore API:** https://console.cloud.google.com/apis/library/firestore.googleapis.com?project=aquamap-488903

## Firestore Collection Structure

### Collection: `facility`

**Document ID:** `osm_id` (string, e.g., "1000072649")

**Document Fields (22 total fields - all fields are present in every document):**

#### Primary Identifiers
- `osm_id` (string) - OpenStreetMap ID, used as document ID
- `osm_type` (string) - OSM element type: "node", "way", or "relation"
- `facility_type` (string) - Type of facility: "Drinking Water Treatment" or "Wastewater Treatment"

#### Basic Information
- `name` (string) - Facility name (prefers Google Maps name if enriched, otherwise OSM name)
- `operator` (string) - Operator/owner of the facility
- `address` (string) - Full formatted address (prefers Google Maps formatted_address if enriched)
- `phone` (string) - Phone number (prefers Google Maps if enriched)
- `website` (string) - Website URL (prefers Google Maps if enriched)
- `capacity` (string) - Facility capacity (may be empty string "")
- `description` (string) - Facility description (may be empty string "")

#### Location Data
- `latitude` (float) - Latitude coordinate (prefers Google Maps if enriched)
- `longitude` (float) - Longitude coordinate (prefers Google Maps if enriched)
- `coordinates_from_polygon` (int) - 0 or 1, indicates if coordinates were calculated from polygon
- `polygon_wkt` (string) - Well-Known Text representation of facility polygon (may be empty)
- `osm_url` (string) - URL to OpenStreetMap page for this facility

#### Google Maps Enrichment Data
- `place_id` (string) - Google Places API place_id (empty string if not enriched)
- `google_maps_url` (string) - Google Maps URL for this facility (empty string if not enriched)
- `types` (string) - Comma-separated list of Google Places types (e.g., "local_government_office, government_office, service")
- `business_status` (string) - Google Places business status (e.g., "OPERATIONAL", empty string if not enriched)
- `distance_from_osm` (float) - Distance in meters from OSM coordinates to Google Maps location (0.0 if not enriched)
- `matched_keywords` (string) - Keywords that matched during enrichment search (e.g., "water, treatment, plant", empty string if not enriched)
- `is_enriched` (int) - 1 if facility has Google Maps enrichment data, 0 otherwise

### Data Characteristics
- **All 22 fields are present in every document** (NULL values converted to empty strings "" or 0/0.0)
- **Document count:** ~15,611 facilities
- **Enrichment status:** Some facilities have `is_enriched = 1` with Google Maps data, others have `is_enriched = 0`
- **Geographic coverage:** All US states
- **Coordinate coverage:** All facilities have latitude/longitude (some calculated from polygons)

## Application Requirements

### Backend (Python)

**Framework Options:**
- Flask with Flask-RESTful or Flask-RESTX
- FastAPI (recommended for modern async support)

**Required Features:**
1. **RESTful API endpoints:**
   - `GET /api/facilities` - List facilities with pagination, filtering, and search
     - Query parameters: 
       - `limit` (required) - Number of records per page (default: 50, max: 100)
       - `cursor` (optional) - Cursor for cursor-based pagination (for infinite scroll)
       - `page` (optional) - Page number for offset-based pagination (alternative to cursor)
       - `search` (optional) - Full-text search query
       - `facility_type` (optional) - Filter by facility type
       - `state` (optional) - Filter by state
       - `is_enriched` (optional) - Filter by enrichment status (0 or 1)
     - Response format:
       ```json
       {
         "data": [...],
         "pagination": {
           "has_next_page": true,
           "next_cursor": "last_osm_id_from_current_batch",
           "total_count": 15611,
           "current_page": 1,
           "per_page": 50
         }
       }
       ```
   - `GET /api/facilities/{osm_id}` - Get single facility by OSM ID
   - `GET /api/facilities/stats` - Get statistics (total count, enriched count, by type, etc.)

2. **Search & Filtering:**
   - Full-text search across: `name`, `address`, `phone`, `website`, `types`, `description`, `operator`
   - Filter by: `facility_type`, `is_enriched`, `state` (extracted from address)
   - Geographic filtering by bounding box (latitude/longitude range)

3. **Firestore Integration:**
   - Use `google-cloud-firestore` Python library
   - Implement efficient queries with cursor-based pagination for infinite scroll
   - Support both offset-based pagination (for traditional page navigation) and cursor-based pagination (for infinite scroll)
   - Use Firestore's `start_after()` for cursor-based pagination (more efficient for large datasets)
   - Cache frequently accessed data (optional but recommended)
   - Return pagination metadata: `has_next_page`, `next_cursor`, `total_count` (if available)

4. **Data Processing:**
   - Handle empty strings vs null values correctly
   - Convert Firestore document data to JSON
   - Handle large result sets efficiently

### Frontend

**Framework Options:**
- React with Next.js (recommended)
- Vue.js with Nuxt.js
- Plain React or Vue.js

**Required Features:**
1. **Data Grid/Table:**
   - Display facilities in a sortable, filterable table
   - Columns: name, address, facility_type, phone, website, is_enriched
   - **Virtual Pagination (Infinite Scroll):** Implement virtual/infinite scrolling for efficient data loading
     - Load data in chunks (50-100 records per batch)
     - Fetch next batch as user scrolls near bottom
     - Use React Query's `useInfiniteQuery` or similar for infinite scroll
     - Show loading indicator while fetching next batch
     - Maintain scroll position during data updates
   - Traditional pagination option (optional): Page-based navigation with page numbers
   - Row click to view details

2. **Search Bar:**
   - Real-time search with debouncing (300ms)
   - Search across multiple fields
   - Highlight matching text

3. **Filters:**
   - Facility type dropdown (Drinking Water Treatment / Wastewater Treatment)
   - Enrichment status toggle (All / Enriched Only / Not Enriched)
   - State filter (multi-select or dropdown)

4. **Detail View:**
   - Modal or separate page showing all 22 fields
   - Organized sections: Basic Info, Location, Contact, Enrichment Data
   - Links to Google Maps and OpenStreetMap
   - Display polygon on map if available

5. **Map View (Optional but Recommended):**
   - Google Maps integration showing all facilities as markers
   - Marker clustering for performance
   - Click marker to show facility details
   - Filter markers based on grid filters
   - Toggle between grid view and map view

6. **UI/UX:**
   - Modern, clean design
   - Responsive (mobile-friendly)
   - Loading states and error handling
   - Toast notifications for user feedback

### Additional Features (Optional)

- Export to CSV/Excel
- Advanced analytics dashboard
- Facility comparison view
- Bookmark/favorite facilities
- Share facility links

## Technology Stack Recommendations

### Backend
- **Python 3.11+**
- **FastAPI** or **Flask**
- **google-cloud-firestore** (Firestore client)
- **python-dotenv** (environment variables)
- **pydantic** (data validation, if using FastAPI)
- **CORS middleware** (for frontend API calls)

### Frontend
- **React 18+** with **TypeScript**
- **Next.js 14** (if using React)
- **TanStack Table** (React Table v8) for data grid with virtual scrolling support
- **React Query** (TanStack Query) with `useInfiniteQuery` for infinite scroll pagination
- **react-window** or **@tanstack/react-virtual** for virtual scrolling (renders only visible rows)
- **Tailwind CSS** for styling
- **Google Maps JavaScript API** for map view
- **shadcn/ui** or **Material-UI** for UI components

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Google Cloud
GOOGLE_CLOUD_PROJECT_ID=aquamap-488903
FIRESTORE_COLLECTION=facility

# Google Maps (for map view in frontend)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Backend API
API_HOST=localhost
API_PORT=8000
CORS_ORIGINS=http://localhost:3000
```

## Sample Firestore Query (Python)

```python
from google.cloud import firestore

db = firestore.Client(project="aquamap-488903")
collection = db.collection("facility")

# Get all facilities with pagination (offset-based)
facilities = collection.limit(50).offset(0).stream()

# Get single facility
facility = collection.document("1000072649").get()

# Cursor-based pagination (recommended for infinite scroll)
# First page
first_page = collection.order_by("osm_id").limit(50).stream()
last_doc = None
for doc in first_page:
    last_doc = doc

# Next page using cursor
if last_doc:
    next_page = collection.order_by("osm_id").start_after(last_doc).limit(50).stream()

# Search by facility type with pagination
query = collection.where("facility_type", "==", "Drinking Water Treatment")
results = query.limit(100).stream()

# Get enriched facilities only
enriched = collection.where("is_enriched", "==", 1).limit(100).stream()

# Example API endpoint implementation with cursor pagination
def get_facilities(limit=50, cursor=None, filters=None):
    query = collection.order_by("osm_id")
    
    # Apply filters
    if filters:
        if filters.get("facility_type"):
            query = query.where("facility_type", "==", filters["facility_type"])
        if filters.get("is_enriched") is not None:
            query = query.where("is_enriched", "==", filters["is_enriched"])
    
    # Apply cursor for pagination
    if cursor:
        cursor_doc = collection.document(cursor).get()
        if cursor_doc.exists:
            query = query.start_after(cursor_doc)
    
    # Get results
    docs = query.limit(limit).stream()
    facilities = [doc.to_dict() for doc in docs]
    
    # Get last document for next cursor
    last_doc_id = facilities[-1]["osm_id"] if facilities else None
    has_next = len(facilities) == limit
    
    return {
        "data": facilities,
        "pagination": {
            "has_next_page": has_next,
            "next_cursor": last_doc_id,
            "per_page": limit
        }
    }
```

## Sample Document Structure

```json
{
  "osm_id": "1000617647",
  "osm_type": "way",
  "facility_type": "Drinking Water Treatment",
  "name": "Water Treatment Plant | City of Bozeman",
  "operator": "City of Bozeman",
  "address": "7024 Sourdough Canyon Rd, Bozeman, MT 59715, USA",
  "phone": "(406) 994-0500",
  "website": "https://www.bozeman.net/departments/utilities/water-treatmen",
  "capacity": "",
  "description": "",
  "latitude": 45.5990745,
  "longitude": -111.02683909999999,
  "coordinates_from_polygon": 0,
  "polygon_wkt": "POLYGON ((-111.0261242 45.5996197, ...))",
  "osm_url": "https://www.openstreetmap.org/way/1000617647",
  "place_id": "ChIJIwYjPFhbRVMRE0km8d3xPYE",
  "google_maps_url": "https://www.google.com/maps/place/?q=place_id:ChIJIwYjPFhbRVMRE0km8d3xPYE",
  "types": "local_government_office, government_office, service, point_of_interest, establishment",
  "business_status": "OPERATIONAL",
  "distance_from_osm": 248.25304062742836,
  "matched_keywords": "water, treatment, plant",
  "is_enriched": 1
}
```

## Implementation Steps

1. **Setup Project Structure**
   - Create backend directory with Python virtual environment
   - Create frontend directory with React/Next.js
   - Install dependencies

2. **Backend Development**
   - Set up Firestore client connection
   - Create API endpoints for facilities
   - Implement search and filtering logic
   - Add pagination support
   - Test API endpoints

3. **Frontend Development**
   - Set up React/Next.js project
   - Create data grid component with virtual scrolling
   - Implement infinite scroll pagination using React Query's `useInfiniteQuery`
   - Set up virtual scrolling with `react-window` or `@tanstack/react-virtual` for performance
   - Implement search and filters (with debouncing)
   - Create detail view/modal
   - Add map view (optional)
   - Style with Tailwind CSS
   - Add loading states for initial load and infinite scroll loading

4. **Integration**
   - Connect frontend to backend API
   - Test end-to-end functionality
   - Add error handling
   - Optimize performance

5. **Deployment**
   - Deploy backend (Google Cloud Run, Heroku, or similar)
   - Deploy frontend (Vercel, Netlify, or similar)
   - Configure CORS and environment variables

## Notes

- All fields are strings, integers, or floats (no complex nested objects)
- Empty strings ("") are used instead of null for missing values
- `is_enriched` field indicates if Google Maps data is available
- `polygon_wkt` contains WKT geometry strings (can be parsed for map display)
- Geographic filtering can be done using latitude/longitude ranges
- Full-text search should be implemented client-side or using Firestore's limited text search capabilities (consider Algolia for advanced search)

## Virtual Pagination Implementation Details

### Why Virtual Pagination?
- **Performance:** With 15,611+ records, loading all at once is inefficient
- **User Experience:** Infinite scroll feels more natural than clicking through pages
- **Memory Efficiency:** Only renders visible rows, reducing DOM nodes

### Backend Implementation:
1. **Cursor-based pagination** (recommended):
   - Use Firestore's `start_after()` with document reference
   - More efficient than offset-based for large datasets
   - Returns `next_cursor` (last document ID) for next page

2. **Offset-based pagination** (alternative):
   - Use `offset()` and `limit()` for traditional page navigation
   - Less efficient for large datasets but simpler to implement

### Frontend Implementation:
1. **React Query Infinite Query:**
   ```typescript
   const {
     data,
     fetchNextPage,
     hasNextPage,
     isFetchingNextPage,
   } = useInfiniteQuery({
     queryKey: ['facilities', filters],
     queryFn: ({ pageParam }) => fetchFacilities({ cursor: pageParam, ...filters }),
     getNextPageParam: (lastPage) => lastPage.pagination.next_cursor,
     initialPageParam: null,
   })
   ```

2. **Virtual Scrolling:**
   - Use `react-window` or `@tanstack/react-virtual` to render only visible rows
   - Reduces DOM nodes from 15,611 to ~20-30 visible rows
   - Smooth scrolling performance

3. **Infinite Scroll Trigger:**
   - Detect when user scrolls near bottom (e.g., 200px from bottom)
   - Call `fetchNextPage()` automatically
   - Show loading indicator while fetching

4. **Search & Filter Handling:**
   - Reset pagination when filters change
   - Debounce search input (300ms) to avoid excessive API calls
   - Clear cached data when filters change

---

**Use this prompt to generate a complete web application with all the above requirements.**
