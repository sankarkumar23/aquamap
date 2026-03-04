# Quick Deployment Guide

## ⚠️ CRITICAL: Enable Billing First

Your project has a billing account linked but billing is not enabled. You must enable it:

1. **Go to GCP Console**
   - Visit: https://console.cloud.google.com/billing?project=aquamap-488423
   - Or: https://console.cloud.google.com/billing

2. **Enable Billing**
   - Find project `aquamap-488423`
   - Click "Enable Billing" or "Link Billing Account"
   - Your billing account: `01A4D0-137941-B4E9BF`
   - Complete the process

3. **Verify**
   ```bash
   gcloud billing projects describe aquamap-488423
   ```
   Should show: `billingEnabled: true`

## Once Billing is Enabled - Run These Commands:

### 1. Enable APIs
```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

### 2. Deploy Backend
```bash
cd backend
gcloud run deploy wfms-backend --source . --platform managed --region us-central1 --allow-unauthenticated --set-env-vars="GOOGLE_CLOUD_PROJECT_ID=aquamap-488423,FIRESTORE_COLLECTION=facility,CORS_ORIGINS=https://wfms.quest,http://localhost:3000" --port 8080
```

**Save the backend URL** (e.g., `https://wfms-backend-xxxxx-uc.a.run.app`)

### 3. Create Frontend .env.production
Create `frontend/.env.production`:
```
NEXT_PUBLIC_API_URL=<YOUR_BACKEND_URL>
```

### 4. Deploy Frontend
```bash
cd frontend
gcloud run deploy wfms-frontend --source . --platform managed --region us-central1 --allow-unauthenticated --port 3000
```

**Save the frontend URL**

### 5. Map Domain
```bash
gcloud run domain-mappings create --service wfms-frontend --domain wfms.quest --region us-central1
```

### 6. Add DNS Records in Porkbun
- Copy the A and AAAA records from the command output
- Add them in Porkbun DNS settings
- Wait 5-30 minutes

## Alternative: Use Vercel for Frontend (Recommended - Easier)

If Cloud Run is too complex, deploy frontend to Vercel:

```bash
cd frontend
npm i -g vercel
vercel --prod
```

Then in Vercel dashboard:
- Add domain: `wfms.quest`
- Set environment variable: `NEXT_PUBLIC_API_URL` = your backend URL
- Follow DNS instructions
