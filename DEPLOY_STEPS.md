# Deployment Steps for wfms.quest

## ⚠️ IMPORTANT: Enable Billing First

Before deploying, you need to enable billing for your GCP project:

1. **Go to GCP Console Billing**
   - Visit: https://console.cloud.google.com/billing
   - Select your project: `aquamap-488423`

2. **Link a Billing Account**
   - Click "Link a billing account"
   - Create a new billing account or link an existing one
   - Add a payment method (credit card)
   - Note: Cloud Run has a free tier, so you may not be charged initially

3. **Verify Billing is Enabled**
   ```bash
   gcloud billing projects describe aquamap-488423
   ```

## Step 1: Enable Required APIs

Once billing is enabled, run:

```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

## Step 2: Deploy Backend to Cloud Run

```bash
cd backend

gcloud run deploy wfms-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="GOOGLE_CLOUD_PROJECT_ID=aquamap-488423,FIRESTORE_COLLECTION=facility,CORS_ORIGINS=https://wfms.quest,http://localhost:3000" \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10
```

**Note the service UR L** (e.g., `https://wfms-backend-xxxxx-uc.a.run.app`)

## Step 3: Update Frontend Environment Variable

Update `frontend/.env.production` or create it:

```env
NEXT_PUBLIC_API_URL=https://wfms-backend-xxxxx-uc.a.run.app
```

Replace `xxxxx` with your actual backend URL.

## Step 4: Deploy Frontend to Cloud Run

```bash
cd frontend

gcloud run deploy wfms-frontend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10
```

**Note the service URL** (e.g., `https://wfms-frontend-xxxxx-uc.a.run.app`)

## Step 5: Map Custom Domain to Frontend

```bash
gcloud run domain-mappings create \
  --service wfms-frontend \
  --domain wfms.quest \
  --region us-central1
```

This will provide DNS records to add in Porkbun.

## Step 6: Add DNS Records in Porkbun

After running the domain mapping command, GCP will show DNS records. Add them in Porkbun:

1. Log in to Porkbun
2. Go to DNS settings for `wfms.quest`
3. Add the A and AAAA records provided by GCP
4. Wait 5-30 minutes for DNS propagation

## Step 7: Verify Deployment

1. Check backend: `https://wfms-backend-xxxxx-uc.a.run.app/api/facilities/stats`
2. Check frontend: `https://wfms.quest` (after DNS propagates)

## Alternative: Deploy Frontend to Vercel (Easier)

If Cloud Run deployment is complex, use Vercel:

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   cd frontend
   vercel --prod
   ```

3. **Add Domain in Vercel Dashboard**
   - Go to: https://vercel.com/dashboard
   - Select your project
   - Settings > Domains
   - Add `wfms.quest` and `www.wfms.quest`
   - Follow DNS instructions

4. **Update Environment Variable**
   - In Vercel Dashboard > Settings > Environment Variables
   - Add: `NEXT_PUBLIC_API_URL` = your backend Cloud Run URL
