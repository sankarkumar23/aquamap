# Frontend Deployment Script for wfms.quest
# Run this after backend is deployed

param(
    [Parameter(Mandatory=$true)]
    [string]$BackendUrl
)

Write-Host "Deploying Frontend to Cloud Run..." -ForegroundColor Green

# Create .env.production file
$envContent = "NEXT_PUBLIC_API_URL=$BackendUrl"
Set-Content -Path "frontend\.env.production" -Value $envContent
Write-Host "Created .env.production with API URL: $BackendUrl" -ForegroundColor Cyan

# Navigate to frontend directory
Set-Location frontend

# Deploy to Cloud Run
gcloud run deploy wfms-frontend `
  --source . `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --port 3000 `
  --memory 512Mi `
  --cpu 1 `
  --timeout 300 `
  --max-instances 10

Write-Host "Frontend deployment complete!" -ForegroundColor Green
Write-Host "Note the service URL above" -ForegroundColor Yellow

Set-Location ..
