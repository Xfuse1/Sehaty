# Sehaty - Healthcare Platform

## Environment Variables for Vercel Deployment

When deploying to Vercel, you need to set the following environment variables in your Vercel dashboard:

### Required Environment Variables:

1. **Firebase Configuration:**
   - No additional env vars needed (config is in src/firebase/config.ts)

2. **Airtable Integration:**
   - `NEXT_PUBLIC_AIRTABLE_TOKEN` - Your Airtable API token
   - `NEXT_PUBLIC_AIRTABLE_BASE_ID` - Your Airtable base ID

3. **Kashier Payment Gateway:**
   - `KASHIER_MERCHANT_ID` - Your Kashier merchant ID
   - `KASHIER_API_KEY` - Your Kashier API key
   - `KASHIER_SECRET_KEY` - Your Kashier secret key for webhooks
   - `KASHIER_CURRENCY` - Currency code (e.g., "EGP", "SAR")
   - `KASHIER_WEBHOOK_URL` - Your webhook URL (will be https://yourdomain.vercel.app/api/kashier/webhook)
   - `KASHIER_MODE` - "test" or "live"

4. **Firebase Admin (if needed):**
   - `FIREBASE_SERVICE_ACCOUNT_KEY` - Your Firebase service account JSON as a string

## Deployment Steps:

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables:**
   Go to your Vercel dashboard → Project → Settings → Environment Variables
   Add all the variables listed above.

5. **Redeploy after setting env vars:**
   ```bash
   vercel --prod
   ```

## Important Notes:

- Your Firebase config is already public (in config.ts) which is fine for client-side
- Make sure to set KASHIER_WEBHOOK_URL to your actual Vercel domain
- Test payment integration after deployment
- Consider setting up custom domain in Vercel dashboard

## Build Settings:
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next` (automatic)
- Install Command: `npm install`