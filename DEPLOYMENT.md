# SmartMatch Deployment Guide

This guide walks you through deploying the SmartMatch application with:
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Supabase (already set up)

---

## Prerequisites

- [x] GitHub account with your code pushed
- [ ] Vercel account (sign up at vercel.com)
- [ ] Render account (sign up at render.com)
- [ ] GitHub OAuth app configured
- [ ] Supabase project running

---

## Part 1: Deploy Backend to Render

### Step 1: Create New Web Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your `smartmatch` repository

### Step 2: Configure Web Service
- **Name**: `smartmatch-backend` (or your choice)
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: Free (or paid as needed)

### Step 3: Add Environment Variables
In the "Environment" section, add these variables:

```
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-app-name.vercel.app
SUPABASE_URL=https://aragskdvigfecrovnchn.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
SUPABASE_ANON_KEY=<your-anon-key>
```

**Note**: You'll update `FRONTEND_URL` after deploying the frontend in Part 2.

### Step 4: Deploy
1. Click **"Create Web Service"**
2. Wait for deployment to complete (~2-3 minutes)
3. **Copy your backend URL** (e.g., `https://smartmatch-backend.onrender.com`)

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Import Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import your `smartmatch` GitHub repository
4. Vercel will auto-detect it's a Next.js app

### Step 2: Configure Project Settings
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (leave as root)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)

### Step 3: Add Environment Variables
Click **"Environment Variables"** and add these:

```
GITHUB_CLIENT_ID=<your-github-oauth-client-id>
GITHUB_CLIENT_SECRET=<your-github-oauth-client-secret>
NEXTAUTH_SECRET=S0/F9KWckqDEFY4TkLYNoTUCGWWf/EWHQ9QhbWilwnA=
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_API_URL=https://smartmatch-backend.onrender.com/api
SUPABASE_URL=https://aragskdvigfecrovnchn.supabase.co
SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

**Important**: Replace placeholders with actual values:
- `NEXTAUTH_URL`: Your Vercel app URL (shown after deployment)
- `NEXT_PUBLIC_API_URL`: Your Render backend URL from Part 1

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. **Copy your frontend URL** (e.g., `https://smartmatch.vercel.app`)

---

## Part 3: Update Configuration

### Step 3.1: Update Backend CORS
1. Go back to Render dashboard
2. Open your `smartmatch-backend` service
3. Go to **Environment** tab
4. Update `FRONTEND_URL` to your Vercel URL: `https://smartmatch.vercel.app`
5. Click **"Save Changes"** (this will redeploy)

### Step 3.2: Update GitHub OAuth Callback
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Open your OAuth App
3. Update **Authorization callback URL** to:
   ```
   https://smartmatch.vercel.app/api/auth/callback/github
   ```
4. Add **Homepage URL**: `https://smartmatch.vercel.app`
5. Click **"Update application"**

### Step 3.3: Update Frontend Environment (if needed)
1. Go to Vercel dashboard → Your project → Settings → Environment Variables
2. Verify `NEXTAUTH_URL` matches your actual Vercel URL
3. If you changed it, redeploy from the Deployments tab

---

## Part 4: Verify Deployment

### Test Checklist
- [ ] Frontend loads at your Vercel URL
- [ ] GitHub OAuth login works
- [ ] Services page loads data from backend
- [ ] User sync works (check Supabase `users` table)
- [ ] Create a test booking
- [ ] Check provider dashboard

### Common Issues

**Frontend can't connect to backend**
- Check `NEXT_PUBLIC_API_URL` in Vercel environment variables
- Verify backend is running on Render
- Check browser console for CORS errors

**GitHub OAuth fails**
- Verify callback URL in GitHub OAuth app settings
- Check `NEXTAUTH_URL` matches your Vercel domain
- Ensure `NEXTAUTH_SECRET` is set

**Backend returns errors**
- Check Render logs (Dashboard → Service → Logs)
- Verify all environment variables are set correctly
- Check Supabase connection

---

## Environment Variables Quick Reference

### Frontend (Vercel)
```bash
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://your-app.vercel.app
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

### Backend (Render)
```bash
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
```

---

## Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
