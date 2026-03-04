# Domain Mapping Script for wfms.quest
# Run this after frontend is deployed

Write-Host "Mapping domain wfms.quest to Cloud Run service..." -ForegroundColor Green

gcloud run domain-mappings create `
  --service wfms-frontend `
  --domain wfms.quest `
  --region us-central1

Write-Host "Domain mapping created!" -ForegroundColor Green
Write-Host "Add the DNS records shown above to Porkbun DNS settings" -ForegroundColor Yellow
Write-Host "Wait 5-30 minutes for DNS propagation" -ForegroundColor Yellow
