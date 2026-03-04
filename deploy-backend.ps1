# Backend Deployment Script for wfms.quest
# Run this after enabling billing in GCP Console

Write-Host "Deploying Backend to Cloud Run..." -ForegroundColor Green

# Navigate to backend directory
Set-Location backend

# Deploy to Cloud Run
gcloud run deploy wfms-backend `
  --source . `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --set-env-vars="GOOGLE_CLOUD_PROJECT_ID=aquamap-488423,FIRESTORE_COLLECTION=facility,CORS_ORIGINS=https://wfms.quest,http://localhost:3000" `
  --port 8080 `
  --memory 512Mi `
  --cpu 1 `
  --timeout 300 `
  --max-instances 10

Write-Host "Backend deployment complete!" -ForegroundColor Green
Write-Host "Note the service URL above - you'll need it for frontend deployment" -ForegroundColor Yellow

Set-Location ..
