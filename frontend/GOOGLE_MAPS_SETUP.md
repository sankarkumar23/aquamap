# Google Maps Setup Guide

## Step 1: Get Your Google Maps API Key

1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/google/maps-apis/credentials)
2. Select your project: `aquamap-488903`
3. Click "Create Credentials" → "API Key"
4. Copy your API key

## Step 2: Enable Maps JavaScript API

1. Go to [Google Cloud Console - APIs](https://console.cloud.google.com/apis/library)
2. Search for "Maps JavaScript API"
3. Click on it and click "Enable"

## Step 3: Create .env.local File

Create a file named `.env.local` in the `frontend/` directory with the following content:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

Replace `your_actual_api_key_here` with your actual API key from Step 1.

## Step 4: Run Locally

```bash
cd frontend
npm run dev
```

The application will now use Google Maps instead of OpenStreetMap!

## Security Note

- The `.env.local` file is already in `.gitignore` and won't be committed
- Never commit your API key to version control
- Consider restricting your API key to specific domains/IPs in Google Cloud Console
