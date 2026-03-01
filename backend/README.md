# AquaMap Backend API

FastAPI backend for the AquaMap water treatment facilities application.

## Project Structure

```
backend/
├── __init__.py           # Package initialization
├── main.py               # FastAPI application and routes
├── config.py             # Configuration constants
├── models.py             # Pydantic models
├── utils.py              # Utility functions
├── firestore_service.py  # Firestore database service
├── requirements.txt      # Python dependencies
└── README.md             # This file
```

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up Google Cloud authentication:
```bash
gcloud auth application-default login
gcloud auth application-default set-quota-project aquamap-488903
```

4. Create a `.env` file (optional):
```env
GOOGLE_CLOUD_PROJECT_ID=aquamap-488903
FIRESTORE_COLLECTION=facility
API_HOST=localhost
API_PORT=8000
CORS_ORIGINS=http://localhost:3000
```

5. Run the server:
```bash
python main.py
# Or: uvicorn main:app --reload --host localhost --port 8000
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Endpoints

- `GET /api/facilities` - List facilities with pagination and filtering
- `GET /api/facilities/{osm_id}` - Get single facility
- `GET /api/facilities/stats` - Get statistics

## Architecture

### `main.py`
- FastAPI application setup
- API route handlers
- Request/response handling

### `config.py`
- Environment variables
- Configuration constants
- Default values

### `models.py`
- Pydantic models for request/response validation
- `Facility`, `FacilitiesResponse`, `StatsResponse`, `PaginationInfo`

### `utils.py`
- Utility functions (state extraction, search matching)
- Helper functions for data processing

### `firestore_service.py`
- `FirestoreService` class for all database operations
- Query building and execution
- Pagination logic
- Statistics calculation

## Development

The API uses:
- FastAPI for the web framework
- Google Cloud Firestore for data storage
- Pydantic for data validation
- CORS middleware for frontend integration
