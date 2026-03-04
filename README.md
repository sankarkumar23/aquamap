# Water Facility Management System

A full-stack web application for viewing and exploring water treatment facilities data from Google Cloud Firestore.

## Features

- **Data Grid with Virtual Scrolling**: Efficiently display 15,611+ facilities with infinite scroll
- **Search & Filtering**: Full-text search and filters by facility type, enrichment status, and state
- **Map View**: Interactive Google Maps integration with facility markers
- **Detail View**: Comprehensive facility information modal
- **Real-time Statistics**: Dashboard showing total facilities, enriched count, and type breakdown

## Project Structure

```
app/
├── backend/          # FastAPI backend
│   ├── main.py      # API endpoints
│   └── requirements.txt
├── frontend/        # Next.js frontend
│   ├── app/         # Next.js app directory
│   ├── components/  # React components
│   ├── lib/         # Utilities and API client
│   └── types/       # TypeScript types
└── WEB_APP_PROMPT.md
```

## Prerequisites

- Python 3.11+
- Node.js 18+
- Google Cloud SDK (for Firestore authentication)
- Google Cloud Project: `aquamap-488903`

## Quick Start (Run Both Servers)

The easiest way to run both backend and frontend together:

```bash
npm run dev
```

This will start both servers in the same terminal. See [README-SCRIPTS.md](./README-SCRIPTS.md) for other options.

## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up Google Cloud authentication:
```bash
gcloud auth application-default login
gcloud auth application-default set-quota-project aquamap-488903
```

5. Create a `.env` file (optional, defaults are set):
```env
GOOGLE_CLOUD_PROJECT_ID=aquamap-488903
FIRESTORE_COLLECTION=facility
API_HOST=localhost
API_PORT=8000
CORS_ORIGINS=http://localhost:3000
```

6. Run the backend server:
```bash
python main.py
# Or: uvicorn main:app --reload --host localhost --port 8000
```

The API will be available at `http://localhost:8000`

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Running Both Servers

See [README-SCRIPTS.md](./README-SCRIPTS.md) for detailed information about running both servers together.

## API Endpoints

### GET /api/facilities
List facilities with pagination, filtering, and search.

**Query Parameters:**
- `limit` (required): Number of records per page (default: 50, max: 100)
- `cursor` (optional): Cursor for cursor-based pagination
- `page` (optional): Page number for offset-based pagination
- `search` (optional): Full-text search query
- `facility_type` (optional): Filter by facility type
- `state` (optional): Filter by state abbreviation (e.g., "CA", "NY")
- `is_enriched` (optional): Filter by enrichment status (0 or 1)

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "has_next_page": true,
    "next_cursor": "last_osm_id",
    "current_page": 1,
    "per_page": 50
  }
}
```

### GET /api/facilities/{osm_id}
Get a single facility by OSM ID.

### GET /api/facilities/stats
Get statistics about facilities.

**Response:**
```json
{
  "total_count": 15611,
  "enriched_count": 5000,
  "not_enriched_count": 10611,
  "drinking_water_count": 8000,
  "wastewater_count": 7611
}
```

## Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **google-cloud-firestore**: Firestore client library
- **Pydantic**: Data validation
- **Uvicorn**: ASGI server

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety
- **TanStack Query**: Data fetching and caching
- **TanStack Table**: Data grid functionality
- **TanStack Virtual**: Virtual scrolling for performance
- **Tailwind CSS**: Styling
- **Google Maps JavaScript API**: Map integration

## Firestore Collection Structure

**Collection:** `facility`

**Document Fields (22 total):**
- Primary: `osm_id`, `osm_type`, `facility_type`
- Basic Info: `name`, `operator`, `address`, `phone`, `website`, `capacity`, `description`
- Location: `latitude`, `longitude`, `coordinates_from_polygon`, `polygon_wkt`, `osm_url`
- Google Maps: `place_id`, `google_maps_url`, `types`, `business_status`, `distance_from_osm`, `matched_keywords`, `is_enriched`

## Development Notes

- The backend uses cursor-based pagination for efficient infinite scroll
- Frontend implements virtual scrolling to render only visible rows
- Search is implemented client-side (consider Algolia for advanced search)
- State extraction from addresses is done client-side
- Google Maps API key is optional but required for map view

## Deployment

### Backend
Deploy to Google Cloud Run, Heroku, or similar platform. Ensure:
- Service account with Firestore access
- Environment variables configured
- CORS origins updated

### Frontend
Deploy to Vercel, Netlify, or similar platform. Ensure:
- `NEXT_PUBLIC_API_URL` points to deployed backend
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is configured

## License

MIT
