# Deploy Frontend to Cloud Storage (Static Hosting)
# This is much cheaper than Cloud Run!

Write-Host "Building static site..." -ForegroundColor Green
cd frontend
npm run build

Write-Host "
Deploying to Cloud Storage..." -ForegroundColor Green
cd ..

# Create bucket if it doesn't exist
$bucketName = "wfms-frontend-static"
$region = "us-central1"

Write-Host "Creating bucket (if needed)..." -ForegroundColor Yellow
gsutil mb -p aquamap-488903 -c STANDARD -l $region gs://$bucketName 2>&1 | Out-Null

Write-Host "Uploading files..." -ForegroundColor Yellow
gsutil -m rsync -r -d frontend/out gs://$bucketName

Write-Host "
Setting bucket for web hosting..." -ForegroundColor Yellow
gsutil web set -m index.html -e index.html gs://$bucketName

Write-Host "
Setting public access..." -ForegroundColor Yellow
gsutil iam ch allUsers:objectViewer gs://$bucketName

Write-Host "
✅ Deployment complete!" -ForegroundColor Green
Write-Host "
Your site is available at:" -ForegroundColor Cyan
Write-Host "https://storage.googleapis.com/$bucketName/index.html" -ForegroundColor White
Write-Host "
To use custom domain (wfms.quest), you'll need to:" -ForegroundColor Yellow
Write-Host "1. Set up Cloud Load Balancer with Cloud Storage backend" -ForegroundColor White
Write-Host "2. Or use Firebase Hosting (simpler for custom domains)" -ForegroundColor White
