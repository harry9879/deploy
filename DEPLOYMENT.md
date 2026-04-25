# Deployment Guide

## 📦 Backend Deployment (Render)

### Prerequisites
- GitHub account
- Render account (https://render.com)
- MongoDB Atlas connection string

### Steps:

#### 1. Push Your Code to GitHub
```bash
cd /Users/priyanshu/Desktop/FreeLance/Gaurav
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### 2. Deploy on Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. **Connect GitHub Repository**:
   - Click "Connect account" if first time
   - Select your repository: `priyans11/Scalable`
   - Click "Connect"

4. **Configure the Service**:
   - **Name**: `file-sharing-backend` (or any name you prefer)
   - **Region**: Choose closest to you (e.g., Oregon, Frankfurt)
   - **Branch**: `main`
   - **Root Directory**: `SERVER`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (for now)

5. **Add Environment Variables**:
   Click "Advanced" → "Add Environment Variable" and add these:

   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://FS:priyanshu@fs.u3q9nsv.mongodb.net/file-sharing-app?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
   JWT_EXPIRE=3d
   ADMIN_REGISTRATION_CODE=ADMIN2025SECRET
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=nodexe59@gmail.com
   EMAIL_PASSWORD=Nodemailer@2002
   EMAIL_FROM=File Sharing App <nodexe59@gmail.com>
   FRONTEND_URL=https://your-app.vercel.app
   MAX_FILE_SIZE=209715200
   MAX_USER_STORAGE=524288000
   MAX_GLOBAL_STORAGE=10737418240
   CLEANUP_CRON_SCHEDULE=0 2 * * *
   ```

   **Important**: 
   - Replace `FRONTEND_URL` with your actual Vercel URL after deploying frontend
   - For production, change `JWT_SECRET` to a strong random string

6. **Click "Create Web Service"**
   - Render will start building and deploying
   - Wait 2-3 minutes for deployment to complete
   - You'll get a URL like: `https://file-sharing-backend.onrender.com`

7. **Test Your Backend**:
   ```bash
   curl https://file-sharing-backend.onrender.com/health
   ```
   Should return: `{"success":true,"message":"Server is running",...}`

---

## 🌐 Frontend Deployment (Vercel)

### Prerequisites
- Vercel account (https://vercel.com)
- Backend deployed on Render (from above)

### Steps:

#### 1. Update Frontend API URL

Before deploying, you need to set the correct backend URL.

**Option A: Use Vercel Environment Variables (Recommended)**
1. Deploy first (see below)
2. Then add environment variable in Vercel dashboard

**Option B: Update .env file**
```bash
# In CLIENT/.env
VITE_API_URL=https://file-sharing-backend.onrender.com/api
```

#### 2. Deploy on Vercel

**Method 1: Using Vercel CLI (Easiest)**

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to CLIENT directory
cd /Users/priyanshu/Desktop/FreeLance/Gaurav/CLIENT

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Choose your account
- Link to existing project? **N**
- What's your project's name? `file-sharing-app` (or any name)
- In which directory is your code located? `./`
- Want to override settings? **N**

**Method 2: Using Vercel Dashboard**

1. **Go to Vercel**: https://vercel.com
2. Click **"Add New..."** → **"Project"**
3. **Import Git Repository**:
   - Click "Import" next to your GitHub repo
   - If not connected, click "Add GitHub Account"
   
4. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `CLIENT`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

5. **Environment Variables**:
   Click "Environment Variables" and add:
   ```
   VITE_API_URL=https://file-sharing-backend.onrender.com/api
   ```
   (Replace with your actual Render backend URL)

6. **Click "Deploy"**
   - Vercel will build and deploy
   - Wait 1-2 minutes
   - You'll get a URL like: `https://file-sharing-app.vercel.app`

#### 3. Update Backend CORS

After deploying frontend, update your backend's `FRONTEND_URL`:

1. Go to Render Dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Update `FRONTEND_URL` to your Vercel URL: `https://file-sharing-app.vercel.app`
5. ⚠️ **CRITICAL**: NO trailing slash! Must be exact origin (e.g., `https://sendit25.vercel.app` NOT `https://sendit25.vercel.app/`)
6. Save changes (this will redeploy your backend)

**Why No Trailing Slash?**
Browsers send CORS origin headers without trailing slashes. If your backend's `FRONTEND_URL` has a trailing slash, CORS will fail with:
```
The 'Access-Control-Allow-Origin' header has a value 'https://sendit25.vercel.app/' 
that is not equal to the supplied origin.
```

### Production URLs (example)

- Frontend (Vercel): https://sendit25.vercel.app
- Backend API (Render): https://scalable-2.onrender.com/api

⚠️ **CRITICAL CORS CONFIGURATION**:

**On Render** (Service > Environment):
- `FRONTEND_URL=https://sendit25.vercel.app` ← **NO trailing slash!**
  - ❌ WRONG: `https://sendit25.vercel.app/` (will cause CORS errors)
  - ✅ CORRECT: `https://sendit25.vercel.app`

**On Vercel** (Project > Settings > Environment Variables):
- `VITE_API_URL=https://scalable-2.onrender.com/api`
  - Set this in **Production** environment
  - After adding, **redeploy** your Vercel project (Deployments tab → Redeploy)

After updating environment variables:
1. Render will auto-redeploy when you save
2. Vercel requires manual redeploy (Deployments → Three dots → Redeploy)

---

## 🔐 Post-Deployment Security

### 1. MongoDB Atlas - Restrict IP Access
Currently set to "Allow from Anywhere" (0.0.0.0/0)

For better security:
1. Go to MongoDB Atlas → Network Access
2. Remove 0.0.0.0/0
3. Add specific IPs:
   - Get Render outbound IPs from: https://render.com/docs/static-outbound-ip-addresses
   - Add each IP to Atlas whitelist

### 2. Update JWT Secret
Generate a strong secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Update `JWT_SECRET` in Render environment variables.

### 3. Environment Variables Checklist
Make sure these are set in Render:
- ✅ MONGODB_URI (Atlas connection string)
- ✅ JWT_SECRET (strong secret)
- ✅ FRONTEND_URL (Vercel URL)
- ✅ EMAIL_* (Gmail credentials)
- ✅ All other env vars from .env.example

---

## 🧪 Testing Deployment

### Backend Health Check
```bash
curl https://your-backend.onrender.com/health
```

### Frontend
1. Open your Vercel URL in browser
2. Try registering a user
3. Check email for verification
4. Try uploading a file
5. Test file download

---

## 🐛 Troubleshooting

### Backend Issues

**Issue**: "Application failed to respond"
- Check Render logs: Dashboard → Your Service → Logs
- Verify all environment variables are set
- Check MongoDB connection

**Issue**: CORS errors
- Verify `FRONTEND_URL` is set correctly in Render
- Make sure it matches your Vercel URL exactly (no trailing slash)

**Issue**: MongoDB connection failed
- Check MongoDB Atlas IP whitelist
- Verify connection string is correct
- Test connection locally first

### Frontend Issues

**Issue**: API calls failing
- Verify `VITE_API_URL` is set in Vercel
- Check backend URL is correct (with `/api` at the end)
- Open browser console for errors

**Issue**: Build failed
- Check Vercel build logs
- Verify all dependencies are in package.json
- Make sure TypeScript has no errors

### Email Issues
- Gmail may block "less secure apps"
- Use App Password instead: https://myaccount.google.com/apppasswords
- Update `EMAIL_PASSWORD` with the App Password

---

## 📊 Monitoring

### Render
- View logs: Dashboard → Service → Logs tab
- View metrics: Dashboard → Service → Metrics tab
- Free tier: 750 hours/month, spins down after 15 min inactivity

### Vercel
- View deployments: Dashboard → Project → Deployments
- View analytics: Dashboard → Project → Analytics
- View logs: Click on deployment → Functions tab

---

## 🔄 Continuous Deployment

Both Vercel and Render auto-deploy when you push to GitHub:

1. Make changes locally
2. Commit and push:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. Vercel and Render will automatically redeploy

---

## 💰 Cost Estimates

### Free Tiers
- **MongoDB Atlas**: 512MB free forever
- **Render**: 750 hours/month free (one service always on)
- **Vercel**: Unlimited hobby projects

### When to Upgrade
- **MongoDB**: When you exceed 512MB storage
- **Render**: When you need 24/7 uptime or more resources
- **Vercel**: When you need custom domains or team features

---

## 📝 Quick Deploy Commands

```bash
# Push to GitHub
git add .
git commit -m "Deploy updates"
git push origin main

# Deploy frontend (if using CLI)
cd CLIENT
vercel --prod

# View Render logs
# Go to: https://dashboard.render.com → Your Service → Logs
```

---

## 🎉 You're Done!

Your app should now be live at:
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-backend.onrender.com

Share your frontend URL with users to start file sharing! 📦
