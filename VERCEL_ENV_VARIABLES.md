# Vercel Environment Variables Setup

## Required Environment Variables for Your Sehaty Project

### Firebase Configuration
Since Firebase auto-initialization is failing, you can optionally set these:
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB7aylOS5nxZPr5_jnPKvI79NLXxBkKOw8
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-1747612531-4566b.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-1747612531-4566b
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studio-1747612531-4566b.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=904250354189
NEXT_PUBLIC_FIREBASE_APP_ID=1:904250354189:web:2ee6ff2af93fb21c100344
```

### Airtable Integration
```
NEXT_PUBLIC_AIRTABLE_TOKEN=your_airtable_personal_access_token
NEXT_PUBLIC_AIRTABLE_BASE_ID=your_airtable_base_id
```

### Kashier Payment Gateway
```
KASHIER_MERCHANT_ID=MID-31202-773
KASHIER_API_KEY=your_kashier_api_key
KASHIER_SECRET_KEY=your_kashier_secret_key
KASHIER_CURRENCY=EGP
KASHIER_MODE=live
KASHIER_WEBHOOK_URL=https://your-domain.vercel.app/api/kashier/webhook
```

### Firebase Admin (for server-side operations)
```
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"studio-1747612531-4566b",...}
```

## How to Add These in Vercel:

1. Go to your project in Vercel dashboard
2. Navigate to: **Settings** → **Environment Variables**
3. Add each variable with its value
4. Set environment to: **Production, Preview, Development**
5. Click **Save**
6. **Redeploy** your project

## Notes:
- Firebase variables are optional since we have hardcoded config
- Kashier variables are required for payment functionality
- Replace `your-domain.vercel.app` with your actual Vercel domain
- The Firebase error you saw is just a warning - the app will work fine