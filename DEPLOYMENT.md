# Deployment Guide - Water Facility Management System

## Domain: wfms.quest

This guide covers deploying the application to Google Cloud Platform (GCP) with custom domain `wfms.quest`.

## Step 1: Domain Verification for Google Services

### Option A: Google Search Console Verification

1. **Go to Google Search Console**
   - Visit: https://search.google.com/search-console
   - Sign in with your Google account

2. **Add Property**
   - Click "Add Property"
   - Select "Domain" option
   - Enter: `wfms.quest`
   - Click "Continue"

3. **Choose Verification Method**
   - **Recommended: DNS Verification**
     - Copy the TXT record provided by Google
     - Format: `google-site-verification=XXXXXXXXXXXXX`

4. **Add TXT Record in Porkbun**
   - Log in to Porkbun: https://porkbun.com
   - Go to DNS settings for `wfms.quest`
   - Add a new TXT record:
     - **Type**: TXT
     - **Host**: `@` (or leave blank for root domain)
     - **Answer**: `google-site-verification=XXXXXXXXXXXXX` (the value from Google)
     - **TTL**: 3600 (or default)
   - Save the record

5. **Verify in Google Search Console**
   - Wait 5-10 minutes for DNS propagation
   - Click "Verify" in Google Search Console
   - If successful, you'll see a success message

### Option B: HTML File Verification

1. **Download Verification File**
   - In Google Search Console, choose "HTML file" method
   - Download the HTML file (e.g., `google1234567890abcdef.html`)

2. **Upload to Your Site**
   - Upload the file to your website's root directory
   - Accessible at: `https://wfms.quest/google1234567890abcdef.html`

3. **Verify**
   - Click "Verify" in Google Search Console

## Step 2: GCP Project Setup

### 2.1 Create/Select GCP Project

```bash
# Install Google Cloud SDK if not already installed
# Download from: https://cloud.google.com/sdk/docs/install

# Login to GCP
gcloud auth login

# Set your project (or create new one)
gcloud config set project aquamap-488903

# Or create a new project
gcloud projects create wfms-quest --name="Water Facility Management System"
gcloud config set project wfms-quest
```

### 2.2 Enable Required APIs

```bash
# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Cloud Build API
gcloud services enable cloudbuild.googleapis.com

# Enable Artifact Registry API
gcloud services enable artifactregistry.googleapis.com

# Enable Firestore API (if not already enabled)
gcloud services enable firestore.googleapis.com

# Enable Cloud Storage API (for static hosting if needed)
gcloud services enable storage-component.googleapis.com
```

## Step 3: Backend Deployment (Cloud Run)

### 3.1 Prepare Backend for Deployment

1. **Create Dockerfile for Backend**

Create `backend/Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8080

# Run the application
CMD exec uvicorn main:app --host 0.0.0.0 --port 8080
```

2. **Update main.py for Cloud Run**

The backend should already work, but ensure it uses `PORT` environment variable:
```python
import os
API_PORT = int(os.getenv("PORT", 8000))
```

### 3.2 Deploy Backend to Cloud Run

```bash
cd backend

# Build and deploy
gcloud run deploy wfms-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="GOOGLE_CLOUD_PROJECT_ID=aquamap-488903,FIRESTORE_COLLECTION=facility" \
  --port 8080

# Note the service URL (e.g., https://wfms-backend-xxxxx-uc.a.run.app)
```

### 3.3 Update CORS Settings

Update `backend/config.py` or set environment variable:
```python
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "https://wfms.quest,http://localhost:3000").split(",")
```

Redeploy after updating CORS.

## Step 4: Frontend Deployment

### Option A: Deploy to Cloud Run (Recommended)

1. **Create Dockerfile for Frontend**

Create `frontend/Dockerfile`:
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["npm", "start"]
```

2. **Update next.config.ts**

```typescript
const nextConfig: NextConfig = {
  output: 'standalone', // For Cloud Run
  // Or use 'export' for static export
};
```

3. **Create .env.production**

```env
NEXT_PUBLIC_API_URL=https://wfms-backend-xxxxx-uc.a.run.app
```

4. **Deploy to Cloud Run**

```bash
cd frontend

gcloud run deploy wfms-frontend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000
```

### Option B: Deploy to Vercel (Easier Alternative)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
cd frontend
vercel --prod
```

3. **Configure Domain in Vercel**
- Go to Vercel Dashboard
- Select your project
- Go to Settings > Domains
- Add `wfms.quest` and `www.wfms.quest`
- Follow DNS instructions

## Step 5: Domain Configuration

### 5.1 Map Domain to Cloud Run (if using Cloud Run for frontend)

1. **Get Cloud Run Service URL**
   - Note your Cloud Run service URL

2. **Add Custom Domain in GCP**
   ```bash
   # Map domain to Cloud Run service
   gcloud run domain-mappings create \
     --service wfms-frontend \
     --domain wfms.quest \
     --region us-central1
   ```

3. **Get DNS Records from GCP**
   - GCP will provide DNS records to add
   - Usually includes A and AAAA records

4. **Add DNS Records in Porkbun**
   - Log in to Porkbun
   - Go to DNS settings for `wfms.quest`
   - Add the A and AAAA records provided by GCP
   - Wait for DNS propagation (5-30 minutes)

### 5.2 DNS Records in Porkbun

If using Cloud Run, you'll typically need:

**A Record:**
- Type: A
- Host: `@`
- Answer: (IP from GCP domain mapping)
- TTL: 3600

**AAAA Record:**
- Type: AAAA
- Host: `@`
- Answer: (IPv6 from GCP domain mapping)
- TTL: 3600

**CNAME (if using subdomain):**
- Type: CNAME
- Host: `www`
- Answer: `wfms.quest.` (with trailing dot)
- TTL: 3600

## Step 6: SSL Certificate

GCP Cloud Run automatically provisions SSL certificates for custom domains. Once DNS is configured correctly, SSL will be enabled automatically.

## Step 7: Update Environment Variables

### Backend Environment Variables
- `GOOGLE_CLOUD_PROJECT_ID`: aquamap-488903
- `FIRESTORE_COLLECTION`: facility
- `CORS_ORIGINS`: https://wfms.quest
- `PORT`: 8080 (Cloud Run default)

### Frontend Environment Variables
- `NEXT_PUBLIC_API_URL`: https://wfms-backend-xxxxx-uc.a.run.app (your backend URL)

## Step 8: Verify Deployment

1. **Check Backend**
   - Visit: `https://wfms-backend-xxxxx-uc.a.run.app/api/facilities/stats`
   - Should return JSON with stats

2. **Check Frontend**
   - Visit: `https://wfms.quest`
   - Should load the application

3. **Test Functionality**
   - Search facilities
   - Filter by state
   - View facility details

## Troubleshooting

### DNS Issues
- Use `dig wfms.quest` or `nslookup wfms.quest` to check DNS propagation
- Wait up to 48 hours for full DNS propagation

### CORS Errors
- Ensure `CORS_ORIGINS` includes your domain
- Check backend logs: `gcloud run services logs read wfms-backend`

### 404 Errors
- Verify domain mapping is active
- Check Cloud Run service is running
- Verify DNS records are correct

## Cost Estimation

- **Cloud Run**: Pay per request, very cost-effective for low-medium traffic
- **Firestore**: Pay per read/write operation
- **Domain**: Already purchased from Porkbun
- **Estimated monthly cost**: $5-20 for low-medium traffic

## Next Steps

1. Set up monitoring with Cloud Monitoring
2. Configure Cloud Logging
3. Set up CI/CD with Cloud Build
4. Configure backup strategies
5. Set up custom error pages
