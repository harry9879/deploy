# 🚀 Simple Deployment Guide

## Part 1: Deploy Backend on Render (Do This First!)

### Step 1: Go to Render
1. Open: https://render.com
2. Click **"Sign Up"** (or "Log In" if you have account)
3. Sign up with GitHub (easiest option)

### Step 2: Create New Web Service
1. Click **"New +"** button (top-right)
2. Select **"Web Service"**

### Step 3: Connect Your Repository
1. Click **"Connect account"** under GitHub
2. Authorize Render to access your GitHub
3. Find and select **"priyans11/Scalable"** repository
4. Click **"Connect"**

### Step 4: Configure Service
Fill in these details:

**Basic Info:**
- **Name**: `file-sharing-backend` (or any name you like)
- **Region**: Select closest to you (Oregon, Frankfurt, Singapore, etc.)
- **Branch**: `main`
- **Root Directory**: `SERVER` ⚠️ IMPORTANT!

**Build & Deploy:**
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Instance Type:**
- Select **"Free"** ($0/month)

### Step 5: Add Environment Variables
Scroll down to **"Environment Variables"** section.
Click **"Add Environment Variable"** and add these ONE BY ONE:

```
Key: NODE_ENV
Value: production

Key: PORT  
Value: 10000

Key: MONGODB_URI
Value: mongodb+srv://FS:priyanshu@fs.u3q9nsv.mongodb.net/file-sharing-app?retryWrites=true&w=majority

Key: JWT_SECRET
Value: your_super_secret_jwt_key_change_this_in_production_12345

Key: JWT_EXPIRE
Value: 3d

Key: ADMIN_REGISTRATION_CODE
Value: ADMIN2025SECRET

Key: EMAIL_HOST
Value: smtp.gmail.com

Key: EMAIL_PORT
Value: 587

Key: EMAIL_SECURE
Value: false

Key: EMAIL_USER
Value: nodexe59@gmail.com

Key: EMAIL_PASSWORD
Value: Nodemailer@2002

Key: EMAIL_FROM
Value: File Sharing App <nodexe59@gmail.com>

Key: FRONTEND_URL
Value: http://localhost:5173

Key: MAX_FILE_SIZE
Value: 209715200

Key: MAX_USER_STORAGE
Value: 524288000

Key: MAX_GLOBAL_STORAGE
Value: 10737418240

Key: CLEANUP_CRON_SCHEDULE
Value: 0 2 * * *
```

**Note**: We'll update `FRONTEND_URL` after deploying frontend

### Step 6: Deploy!
1. Click **"Create Web Service"** button at bottom
2. Wait 2-3 minutes for deployment
3. Watch the logs - should see "Server running on port 10000"
4. When done, you'll see "Your service is live 🎉"

### Step 7: Get Your Backend URL
- Copy the URL from the top (looks like: `https://file-sharing-backend-xxxx.onrender.com`)
- **SAVE THIS URL** - you'll need it for frontend!

### Step 8: Test Your Backend
Open in browser or use curl:
```
https://your-backend-url.onrender.com/health
```
Should return: `{"success":true,"message":"Server is running"}`

✅ **Backend is DONE!**

---

## Part 2: Deploy Frontend on Vercel

### Step 1: Go to Vercel
1. Open: https://vercel.com
2. Click **"Sign Up"** (or "Log In")
3. Choose **"Continue with GitHub"**

### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Find **"priyans11/Scalable"** in the list
3. Click **"Import"**

### Step 3: Configure Project
**Framework Preset:** Select **"Vite"** (should auto-detect)

**Root Directory:** 
- Click **"Edit"** next to Root Directory
- Enter: `CLIENT` ⚠️ IMPORTANT!
- Click **"Continue"**

**Build Settings:** (Should be auto-filled, but verify)
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Step 4: Add Environment Variable
Click **"Environment Variables"** section
Add this ONE variable:

```
Key: VITE_API_URL
Value: https://your-backend-url.onrender.com/api
```

⚠️ **IMPORTANT**: Replace `your-backend-url.onrender.com` with the actual Render URL from Part 1 Step 7!

Example: `https://file-sharing-backend-xxxx.onrender.com/api`

### Step 5: Deploy!
1. Click **"Deploy"** button
2. Wait 1-2 minutes for build
3. Watch the build logs
4. When done: "Congratulations! 🎉"

### Step 6: Get Your Frontend URL
- Copy the URL (looks like: `https://your-project.vercel.app`)
- Click "Visit" to open your app

✅ **Frontend is DONE!**

---

## Part 3: Connect Frontend & Backend

### Update Backend's FRONTEND_URL
1. Go back to **Render Dashboard**
2. Click on your **backend service**
3. Click **"Environment"** tab in left sidebar
4. Find **FRONTEND_URL**
5. Click **"Edit"**
6. Change from `http://localhost:5173` to your Vercel URL:
   ```
   https://your-project.vercel.app
   ```
7. Click **"Save Changes"**
8. Wait for automatic redeploy (1-2 minutes)

✅ **Everything is CONNECTED!**

---

## 🧪 Test Your Deployed App

1. **Open your Vercel URL** in browser
2. **Register a new user**
3. **Check email** for verification
4. **Click verification link**
5. **Log in**
6. **Try uploading a file**
7. **Share the download link**
8. **Test downloading**

---

## 🎉 You're Live!

Share your Vercel URL with anyone to use your file-sharing app!

**Your URLs:**
- Frontend: `https://your-project.vercel.app`
- Backend: `https://your-backend.onrender.com`

---

## ⚠️ Important Notes

### Render Free Tier
- Spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds to wake up
- 750 free hours per month

### If Something Goes Wrong

**Backend not working?**
1. Check Render logs: Dashboard → Your Service → Logs
2. Verify all environment variables are set
3. Check MongoDB Atlas allows connections (Network Access → 0.0.0.0/0)

**Frontend not working?**
1. Check Vercel deployment logs
2. Verify `VITE_API_URL` is correct (with `/api` at the end)
3. Open browser console (F12) to see errors

**CORS errors?**
1. Make sure `FRONTEND_URL` in Render matches Vercel URL exactly
2. No trailing slash in either URL

---

## 🔄 How to Update Your App

### Update Backend:
```bash
cd /Users/priyanshu/Desktop/FreeLance/Gaurav
# Make changes to SERVER files
git add .
git commit -m "Update backend"
git push origin main
# Render auto-deploys in 2-3 minutes
```

### Update Frontend:
```bash
cd /Users/priyanshu/Desktop/FreeLance/Gaurav
# Make changes to CLIENT files
git add .
git commit -m "Update frontend"
git push origin main
# Vercel auto-deploys in 1-2 minutes
```

---

## 📞 Need Help?

Check deployment logs:
- **Render**: https://dashboard.render.com → Select your service → Logs tab
- **Vercel**: https://vercel.com/dashboard → Select your project → Deployments → Click latest → View Function Logs
