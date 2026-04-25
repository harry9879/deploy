# 🔧 Troubleshooting Guide

## Common Deployment Issues

### ❌ CORS Error: "Access-Control-Allow-Origin header has a value that is not equal to the supplied origin"

**Error Message:**
```
Access to XMLHttpRequest at 'https://scalable-2.onrender.com/api/auth/login' 
from origin 'https://sendit25.vercel.app' has been blocked by CORS policy: 
The 'Access-Control-Allow-Origin' header has a value 'https://sendit25.vercel.app/' 
that is not equal to the supplied origin.
```

**Cause:** Backend's `FRONTEND_URL` has a trailing slash.

**Solution:**
1. Go to https://dashboard.render.com
2. Select your backend service
3. Go to **Environment** tab
4. Find `FRONTEND_URL`
5. Remove the trailing slash:
   - ❌ WRONG: `https://sendit25.vercel.app/`
   - ✅ CORRECT: `https://sendit25.vercel.app`
6. Save (service will auto-redeploy)
7. Wait 2-3 minutes for redeploy
8. Test your frontend again

---

### ❌ Frontend Still Calling Localhost

**Symptoms:**
- Network tab shows requests to `http://localhost:5000/api`
- Or requests to `https://sendit25.vercel.app/api` (wrong, should be Render URL)

**Cause:** `VITE_API_URL` not set in Vercel dashboard.

**Solution:**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://scalable-2.onrender.com/api`
   - **Environment:** Check "Production" (and optionally Preview/Development)
5. Click **Save**
6. Go to **Deployments** tab
7. Click three dots on latest deployment → **Redeploy**
8. Wait for build to complete (~1-2 minutes)

**Why?** Vite injects `import.meta.env.*` at build time from Vercel's environment variables. Local `.env` files are gitignored and not used by Vercel.

---

### ❌ 401 Unauthorized After Login

**Symptoms:**
- Login appears to work but immediately redirected to login page
- Console shows 401 errors

**Possible Causes:**
1. **JWT_SECRET mismatch** between local and production
2. **Token not being stored** in localStorage
3. **CORS preventing credentials**

**Solutions:**
1. Check browser DevTools → Application → Local Storage
   - Should see `token` and `user` after login
2. Check Network tab → Response Headers:
   - `Access-Control-Allow-Credentials: true`
3. Verify JWT_SECRET is set in Render environment variables

---

### ❌ Email Verification Not Working

**Symptoms:**
- Users register but don't receive verification emails
- Emails go to spam
- SendGrid errors in logs

**Solutions:**

1. **Verify SendGrid API Key:**
   ```bash
   # Test SendGrid (in SERVER directory)
   node test-sendgrid.js
   ```
   Should return: `Status: 202` and a message ID

2. **Check Sender Verification:**
   - Go to https://app.sendgrid.com/settings/sender_auth
   - Ensure sender email is verified
   - Check "Sender Identity" status

3. **Check Render Logs:**
   ```bash
   # In Render dashboard → Logs
   # Look for SendGrid errors
   ```

4. **Verify EMAIL_FROM matches verified sender:**
   ```bash
   # In Render environment variables
   EMAIL_FROM=File Sharing App <your-verified-email@domain.com>
   SENDGRID_API_KEY=SG.your_actual_key_here
   ```

---

### ❌ Files Not Uploading

**Symptoms:**
- Upload progress bar stuck
- "Network Error" or timeout
- Files don't appear in dashboard

**Possible Causes:**
1. **File too large** (max 200MB per file)
2. **Storage quota exceeded** (500MB per user)
3. **MongoDB connection issue**
4. **Render cold start** (first request after inactivity)

**Solutions:**

1. **Check file size:**
   - Each file must be ≤ 200MB
   - Total user storage ≤ 500MB

2. **Check browser console:**
   - Look for specific error messages
   - Network tab → Failed request → Response

3. **Check Render logs:**
   - Go to Render dashboard → Logs
   - Look for MongoDB connection errors
   - Look for "ECONNREFUSED" or timeout errors

4. **Warm up Render (if cold start):**
   ```bash
   curl https://scalable-2.onrender.com/health
   ```
   Wait 30 seconds, then try upload again

5. **Verify MongoDB connection:**
   - Go to MongoDB Atlas
   - Check "Network Access" allows Render IPs
   - Check "Database Access" user has read/write permissions

---

### ❌ "Unchecked runtime.lastError: The message port closed before a response was received"

**Error Location:** Browser console (not your app)

**Cause:** Browser extension error (NOT your application error)

**Solution:**
- Ignore this error - it's from a Chrome extension
- Or disable extensions and test again
- This does NOT affect your application

---

## 🧪 Testing Checklist

After deployment, test these scenarios:

### Frontend (Vercel)
- [ ] Homepage loads
- [ ] Can navigate to /login, /register
- [ ] Can see upload page
- [ ] Network tab shows API calls to `https://scalable-2.onrender.com/api/*`
- [ ] No CORS errors in console

### Backend (Render)
- [ ] Health check responds: `curl https://scalable-2.onrender.com/health`
- [ ] CORS headers present: `curl -I -X OPTIONS -H "Origin: https://sendit25.vercel.app" https://scalable-2.onrender.com/api/auth/login`
- [ ] Returns: `Access-Control-Allow-Origin: https://sendit25.vercel.app`

### Full Flow
- [ ] Register new user
- [ ] Receive verification email
- [ ] Click verification link
- [ ] Login works
- [ ] Upload file (< 200MB)
- [ ] Copy share link
- [ ] Open share link in incognito window
- [ ] Can download file
- [ ] File appears in dashboard
- [ ] Can delete file
- [ ] Logout works

---

## 🆘 Still Having Issues?

1. **Check Render Logs:**
   - Render Dashboard → Service → Logs tab
   - Look for errors during requests

2. **Check Vercel Build Logs:**
   - Vercel Dashboard → Deployments → Click deployment → View Build Logs
   - Look for build errors or warnings

3. **Check Browser Console:**
   - F12 → Console tab
   - Look for errors (ignore extension errors)

4. **Check Network Tab:**
   - F12 → Network tab
   - Click failed request → Headers → Request/Response Headers
   - Click failed request → Preview → See error message

5. **Verify Environment Variables:**
   - **Render:** Service → Environment → Check all variables present
   - **Vercel:** Project → Settings → Environment Variables → Check `VITE_API_URL` set for Production

6. **Force Redeploy:**
   - **Render:** Environment → Save any variable (triggers redeploy)
   - **Vercel:** Deployments → Three dots → Redeploy

---

## 📞 Getting Help

If you're still stuck:

1. **Collect Information:**
   - Exact error message (copy from console)
   - Steps to reproduce
   - Screenshots of error
   - Render logs (copy relevant section)
   - Vercel build logs (if build failed)

2. **Check URLs:**
   - Frontend URL: `https://sendit25.vercel.app`
   - Backend URL: `https://scalable-2.onrender.com`
   - Are these correct and accessible?

3. **Verify Environment:**
   - All environment variables set?
   - MongoDB connection string correct?
   - SendGrid API key valid?

Most common issues are:
- ❌ Trailing slash in `FRONTEND_URL`
- ❌ Missing `VITE_API_URL` in Vercel
- ❌ Forgot to redeploy after changing env vars
