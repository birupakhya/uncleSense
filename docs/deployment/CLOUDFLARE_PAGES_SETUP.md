# UncleSense Cloudflare Pages Deployment Guide

## 🎉 Repository Successfully Pushed!

Your UncleSense code is now available at: [https://github.com/birupakhya/uncleSense.git](https://github.com/birupakhya/uncleSense.git)

## 🚀 Cloudflare Pages Setup Instructions

### Step 1: Connect GitHub Repository to Cloudflare Pages

1. **Go to Cloudflare Pages Dashboard:**
   - Visit: [https://dash.cloudflare.com/pages](https://dash.cloudflare.com/pages)

2. **Create New Project:**
   - Click "Create a project"
   - Choose "Connect to Git"

3. **Select Repository:**
   - Choose "GitHub" as your Git provider
   - Select the repository: `birupakhya/uncleSense`
   - Click "Begin setup"

### Step 2: Configure Build Settings

**Framework preset:** `Vite`

**Build command:** `npm run build`

**Build output directory:** `dist`

**Root directory:** `/` (leave empty)

### Step 3: Environment Variables

Add these environment variables in Cloudflare Pages:

```
VITE_API_BASE_URL=https://unclesense-api.ucancallmebiru.workers.dev
VITE_APP_NAME=UncleSense
VITE_APP_DESCRIPTION=Your Uncle's Got Your Back (and Your Budget)
```

### Step 4: Deploy

1. Click "Save and Deploy"
2. Cloudflare Pages will automatically build and deploy your frontend
3. Your app will be available at: `https://YOUR_PROJECT_NAME.pages.dev`

## 🔧 Additional Configuration

### Worker Environment Variables

Make sure your Cloudflare Worker has the correct environment variables:

1. **Go to Workers Dashboard:**
   - Visit: [https://dash.cloudflare.com/workers](https://dash.cloudflare.com/workers)
   - Find `unclesense-api` worker

2. **Add Environment Variables:**
   - `HUGGINGFACE_API_KEY`: Your HuggingFace API key
   - The worker should already have the D1 database binding

### Database Migration

If needed, run the database migration:

```bash
npm run db:migrate:prod
```

## 🧪 Testing Your Deployment

### 1. Test API Endpoints

```bash
# Health check
curl https://unclesense-api.ucancallmebiru.workers.dev/health

# Should return: {"status":"ok","timestamp":"..."}
```

### 2. Test Frontend

1. Visit your Cloudflare Pages URL
2. Upload the `sample-transactions.csv` file
3. Check if Uncle's analysis works
4. Test the chat interface

### 3. Sample Data

Use the included `sample-transactions.csv` file for testing:
- Contains realistic transaction data
- Perfect for testing all features
- Located in the repository root

## 📱 UncleSense Features

✅ **Multi-agent financial analysis**
✅ **Quirky Uncle personality responses**
✅ **Interactive chat interface**
✅ **File upload (CSV/Excel)**
✅ **Real-time insights dashboard**
✅ **Cloudflare hosting (free tier)**

## 🎯 API Endpoints

- `POST /upload` - File upload
- `POST /analyze` - Trigger analysis
- `POST /chat` - Chat with Uncle
- `GET /health` - Health check

## 🔗 Important URLs

- **Repository:** [https://github.com/birupakhya/uncleSense.git](https://github.com/birupakhya/uncleSense.git)
- **API:** [https://unclesense-api.ucancallmebiru.workers.dev](https://unclesense-api.ucancallmebiru.workers.dev)
- **Cloudflare Pages:** [https://dash.cloudflare.com/pages](https://dash.cloudflare.com/pages)
- **Workers Dashboard:** [https://dash.cloudflare.com/workers](https://dash.cloudflare.com/workers)

## 🎉 Congratulations!

Your UncleSense agentic finance app is ready to help users take control of their finances with a fun, uncle-like approach!

The app combines:
- **Multi-agent AI analysis** for comprehensive financial insights
- **Quirky Uncle personality** for engaging user experience
- **Cloudflare infrastructure** for reliable, scalable hosting
- **Free tier hosting** for cost-effective deployment

Happy coding! 🚀
