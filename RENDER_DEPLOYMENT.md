# Render.com Deployment Guide

Simple deployment guide for deploying to Render.com.

## Prerequisites

- Render.com account (free tier available)
- Git repository pushed to GitHub

## Step 1: Create New Web Service on Render

1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account and select the repository
4. Fill in the form:
   - **Name**: `poe-forum-api`
   - **Branch**: `main`
   - **Root Directory**: `.` (leave empty)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

## Step 2: Configure Environment Variables

In the Render dashboard:

1. Go to your web service settings
2. Click on **"Environment"**
3. Add these environment variables:

```
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=info
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=1 minute
API_URL=https://your-service-name.onrender.com
API_TITLE=PoE Forum Mobile API
API_DESCRIPTION=API for browsing Path of Exile forum on mobile
API_VERSION=1.0.0
```

**Important**: Update `CORS_ORIGIN` to your frontend domain and `API_URL` to your Render service URL.

## Step 3: Configure Health Check

1. In service settings, go to **"Health Check"**
2. Set:
   - **Path**: `/health`
   - **Check Interval**: `30` seconds
   - **Timeout**: `5` seconds

## Step 4: Deploy

Click **"Create Web Service"** and Render will:
1. Clone your repository
2. Install dependencies: `npm install`
3. Build: `npm run build`
4. Start: `npm start`

Deployment typically takes 2-5 minutes.

## Step 5: Test Deployment

Once deployed, test your API:

```bash
# Replace YOUR_SERVICE_NAME with your actual service name
curl https://your-service-name.onrender.com/health
curl https://your-service-name.onrender.com/api/categories
```

## Logs

View logs in Render dashboard:
- Click on your service
- Click **"Logs"** tab
- Real-time streaming logs

## Common Issues

### Service keeps restarting
- Check logs for error messages
- Verify environment variables are set correctly
- Ensure `npm start` can find `dist/server/index.js`

### CORS errors
- Verify `CORS_ORIGIN` matches your frontend domain exactly (including https://)
- Frontend and API must be on different domains for CORS to apply

### Build fails
- Check build command output in logs
- Run locally: `npm run build` to verify
- Ensure `dist/` folder is created

## Updating Your App

After pushing changes to main branch:

1. Render automatically triggers a rebuild
2. Service restarts with new code
3. Old instance gracefully shuts down

No manual intervention needed!

## Service Plans

- **Free**: Great for testing, sleeps after 15 minutes of inactivity (paid tier needed for production)
- **Paid**: Always running, better performance

## Memory & Performance

- Free tier: ~512MB RAM (sufficient for this API)
- Paid tier: Configurable resources
- Default timeout: 30 minutes (sufficient for most requests)

## Next Steps

1. Note your Render service URL (e.g., `https://poe-forum-api.onrender.com`)
2. Update your frontend's API base URL to point to Render
3. Test core endpoints work
4. Monitor logs for errors

That's it! Your API is now live on Render. 🚀
