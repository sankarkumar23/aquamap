# Domain Verification Steps for wfms.quest

## Quick Start: Verify Domain for Google Services

### Step 1: Google Search Console Verification (Recommended)

1. **Go to Google Search Console**
   - Visit: https://search.google.com/search-console
   - Sign in with your Google account

2. **Add Property**
   - Click "Add Property" button
   - Select "Domain" option (not URL prefix)
   - Enter: `wfms.quest`
   - Click "Continue"

3. **Choose DNS Verification Method**
   - Google will show you a TXT record to add
   - Format: `google-site-verification=XXXXXXXXXXXXX`
   - Copy this entire value

4. **Add TXT Record in Porkbun**
   - Log in to Porkbun: https://porkbun.com/account/login
   - Go to your domain: `wfms.quest`
   - Click on "DNS" or "DNS Records"
   - Click "Add Record" or "+" button
   - Fill in:
     - **Type**: `TXT`
     - **Host**: `@` (or leave blank for root domain)
     - **Answer**: `google-site-verification=XXXXXXXXXXXXX` (paste the full value from Google)
     - **TTL**: `3600` (or leave default)
   - Click "Add" or "Save"

5. **Wait for DNS Propagation**
   - DNS changes can take 5 minutes to 48 hours
   - Usually takes 5-30 minutes
   - Check propagation: https://dnschecker.org/#TXT/wfms.quest

6. **Verify in Google Search Console**
   - Go back to Google Search Console
   - Click "Verify" button
   - If successful, you'll see a success message
   - Your domain is now verified!

### Step 2: Verify Domain for Google Cloud Platform

After Search Console verification, your domain is verified for most Google services. For GCP specifically:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com
   - Select your project: `aquamap-488903` (or create new one)

2. **Domain Verification (if required)**
   - Some GCP services may require additional verification
   - Usually, Search Console verification is sufficient
   - If prompted, use the same TXT record method

### Alternative: HTML File Verification

If DNS verification doesn't work, you can use HTML file method:

1. **Download Verification File**
   - In Google Search Console, choose "HTML file" method
   - Download the file (e.g., `google1234567890abcdef.html`)

2. **Upload to Your Website**
   - Once your site is deployed, upload this file to the root directory
   - File should be accessible at: `https://wfms.quest/google1234567890abcdef.html`

3. **Verify**
   - Click "Verify" in Google Search Console

## Verification Checklist

- [ ] Added TXT record in Porkbun DNS settings
- [ ] Waited for DNS propagation (checked with dnschecker.org)
- [ ] Clicked "Verify" in Google Search Console
- [ ] Received verification success message
- [ ] Domain shows as verified in Google Search Console

## Troubleshooting

### DNS Not Propagating
- Wait longer (up to 48 hours)
- Check TXT record is correct (no extra spaces)
- Verify record is added to root domain (`@`) not subdomain
- Use `dig TXT wfms.quest` or `nslookup -type=TXT wfms.quest` to check

### Verification Fails
- Double-check the TXT record value matches exactly
- Ensure no extra spaces or quotes
- Try removing and re-adding the record
- Wait 30 minutes and try again

### Need Help?
- Google Search Console Help: https://support.google.com/webmasters
- Porkbun Support: https://porkbun.com/support

## Next Steps After Verification

Once verified, you can:
1. Deploy your application to GCP
2. Map your domain to Cloud Run services
3. Set up SSL certificates (automatic with Cloud Run)
4. Configure monitoring and analytics
