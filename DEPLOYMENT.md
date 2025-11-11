# Vercel Deployment Guide for PrepMint

## Quick Deployment (3 Methods)

### Method 1: GitHub Integration (Recommended - Easiest)

1. **Push your code to GitHub** (if not already done):
   ```bash
   git push origin claude/common-analytics-page-011CUzX7ccTupgdTNRw2k6Ui
   # Or push to main branch
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository: `PrepMintAI/prepmint-frontend`
   - Select the branch to deploy (main or your feature branch)

3. **Configure Environment Variables** in Vercel Dashboard:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   FIREBASE_ADMIN_PROJECT_ID=your-admin-project-id
   FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

4. **Click Deploy** - Vercel will automatically:
   - Detect Next.js framework
   - Install dependencies
   - Build the project
   - Deploy to production

5. **Set up automatic deployments**:
   - Every push to main will auto-deploy
   - Pull requests get preview deployments

---

### Method 2: Vercel CLI (Manual)

1. **Install Vercel CLI** (already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```
   Follow the email verification link.

3. **Deploy to preview**:
   ```bash
   vercel
   ```
   Answer the prompts:
   - Set up and deploy? **Yes**
   - Which scope? Select your account
   - Link to existing project? **No** (first time) or **Yes** (subsequent)
   - Project name: **prepmint-frontend**
   - Directory: **./  (current directory)**

4. **Deploy to production**:
   ```bash
   vercel --prod
   ```

5. **Configure environment variables**:
   ```bash
   # Option A: Via CLI
   vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
   vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
   # ... repeat for all variables

   # Option B: Via dashboard (easier)
   # Go to project settings > Environment Variables
   ```

---

### Method 3: Manual Upload

1. **Build locally**:
   ```bash
   npm run build
   ```

2. **Deploy build folder**:
   ```bash
   vercel --prebuilt
   ```

---

## Environment Variables Reference

### Required Firebase Client Variables (Public)
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Required Firebase Admin Variables (Secret)
```
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

**Important**: When setting `FIREBASE_ADMIN_PRIVATE_KEY` in Vercel:
- Wrap the entire key in double quotes
- Keep the `\n` characters (don't replace with actual newlines)
- Example: `"-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"`

### Optional Variables
```
NEXT_PUBLIC_SENTRY_DSN=          # For error tracking (if Sentry configured)
SENTRY_AUTH_TOKEN=               # For Sentry source maps
```

---

## Vercel Configuration Files (Already Created)

### `vercel.json`
- ✅ Framework: Next.js detected
- ✅ Build command: `next build`
- ✅ Security headers configured (X-Frame-Options, CSP, etc.)
- ✅ Environment variable mapping

### `.vercelignore`
- ✅ Excludes node_modules, .next, .env files
- ✅ Excludes development files
- ✅ Keeps README.md for documentation

---

## Post-Deployment Checklist

### 1. Verify Deployment
- [ ] Visit your Vercel URL (e.g., `prepmint-frontend.vercel.app`)
- [ ] Check all routes load correctly
- [ ] Test authentication (login/signup)
- [ ] Verify Firebase connection

### 2. Configure Custom Domain (Optional)
1. Go to Project Settings > Domains
2. Add your custom domain (e.g., `app.prepmint.com`)
3. Update DNS records as instructed
4. Wait for SSL certificate provisioning (automatic)

### 3. Set up Vercel Analytics (Optional)
1. Enable Web Analytics in project settings
2. Add `@vercel/analytics` package if needed
3. Track Core Web Vitals and user metrics

### 4. Configure Deployment Protection (Recommended)
- **Production**: Password protection optional
- **Preview**: Password protect for security
- **Environment**: Set to "Production" for main branch

---

## Troubleshooting

### Build Fails with "Module not found"
**Solution**: Ensure all dependencies are in `package.json`
```bash
npm install
git add package.json package-lock.json
git commit -m "fix: update dependencies"
git push
```

### Build Fails with Google Fonts Error
**Solution**: This is a network issue in sandboxed builds. It will work fine on Vercel.
```
Error: Failed to fetch font `Geist` from Google Fonts
```
This error only occurs in restricted environments. Vercel has full network access.

### Environment Variables Not Working
**Solution**: Check variable names and values
- Ensure `NEXT_PUBLIC_` prefix for client-side variables
- Verify no extra spaces in variable values
- Check FIREBASE_ADMIN_PRIVATE_KEY formatting (must include `\n`)

### 404 on Dynamic Routes
**Solution**: Ensure Next.js App Router is properly configured
- Check `src/app/` structure
- Verify `middleware.ts` redirects
- Review `next.config.ts` settings

### Firebase Connection Issues
**Solution**: Verify Firebase project is active
- Check Firebase project ID matches
- Ensure Firestore is enabled
- Verify authentication methods are enabled
- Check security rules are deployed

---

## Security Recommendations

### Production Environment
- ✅ Enable "Vercel Authentication" for staging deployments
- ✅ Use environment variables (never commit secrets)
- ✅ Enable "Deployment Protection" for preview branches
- ✅ Set up "Secure Compute" for serverless functions (if needed)

### Monitoring
- ✅ Enable Vercel Analytics
- ✅ Set up Sentry error tracking (already configured)
- ✅ Monitor build times and bundle sizes
- ✅ Set up uptime monitoring (UptimeRobot, Pingdom, etc.)

---

## Continuous Deployment

Once connected to GitHub:
- **Main branch** → Automatic production deployment
- **Feature branches** → Preview deployments
- **Pull requests** → Preview deployments with unique URLs

You can view deployment logs and analytics in the Vercel dashboard.

---

## Cost Estimation (Vercel Free Tier)

**Included Free**:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ SSL certificates (auto-renewed)
- ✅ Global CDN
- ✅ DDoS protection
- ✅ Preview deployments
- ✅ Web Analytics (100k events/month)

**Paid Features** (if needed):
- Additional bandwidth: $20/100GB
- Vercel Pro: $20/month/user (team collaboration, more analytics)
- Vercel Enterprise: Custom pricing (SLA, advanced security)

For PrepMint's expected traffic, **free tier should be sufficient** for MVP launch.

---

## Support

If you encounter issues:
1. Check Vercel build logs in dashboard
2. Review error messages in deployment details
3. Contact Vercel support: [vercel.com/support](https://vercel.com/support)
4. PrepMint support: teja.kg@prepmint.in

---

**Last Updated**: November 10, 2025
**Status**: Ready for deployment
**Estimated deployment time**: 5-10 minutes (first time)
