# File Sharing App - Backend

A secure file sharing application backend built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication**: JWT-based authentication with email verification
- **File Upload**: Support for single and multiple file uploads (up to 200MB per file)
- **Auto-Zipping**: Automatically zips multiple files for easy sharing
- **Unique Links**: UUID-based shareable download links
- **PIN Protection**: Optional 4-digit PIN protection for files
- **Expiry Management**: Customizable file expiry (5 minutes to 24 hours)
- **Download Tracking**: Comprehensive download logs with IP and user agent
- **Storage Quotas**: Per-user (500MB) and global (10GB) storage limits
- **Admin Dashboard**: Analytics, user management, and system monitoring
- **Email Notifications**: HTML email templates for file sharing and verification
- **Automatic Cleanup**: Daily cron job to remove expired files
- **Streaming Support**: Range requests for video/audio streaming and resume capability

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- SendGrid account for email delivery

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment variables:**
   - Copy `.env.example` to `.env`
   - Update the values in `.env`

3. **MongoDB Setup:**

   **Option A: Local MongoDB (MongoDB Compass)**
   - Install MongoDB Compass: https://www.mongodb.com/try/download/compass
   - Open MongoDB Compass
   - Connect to: `mongodb://localhost:27017`
   - The database `file-sharing-app` will be created automatically

   **Option B: MongoDB Atlas (Production)**
   - Go to https://cloud.mongodb.com
   - Create a free cluster
   - Get your connection string
   - Update `MONGODB_URI` in `.env`:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/file-sharing-app?retryWrites=true&w=majority
     ```

## 📧 Email Configuration

The app uses SendGrid when `SENDGRID_API_KEY` is set. Update these in `.env`:

```env
EMAIL_USER=deepsinghharman8877@gmail.com
EMAIL_FROM=deepsinghharman8877@gmail.com
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

`EMAIL_USER` is mainly used by the local SMTP fallback and the test script. `EMAIL_FROM` should be a verified sender in SendGrid.

## 🎯 Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/file-sharing-app

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=3d

# Admin
ADMIN_REGISTRATION_CODE=ADMIN2025SECRET

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=deepsinghharman8877@gmail.com
EMAIL_PASSWORD=
EMAIL_FROM=deepsinghharman8877@gmail.com
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Frontend
FRONTEND_URL=http://localhost:5173

# Storage Limits (in bytes)
MAX_FILE_SIZE=209715200          # 200 MB
MAX_USER_STORAGE=524288000       # 500 MB
MAX_GLOBAL_STORAGE=10737418240   # 10 GB

# Cleanup (runs daily at 2 AM)
CLEANUP_CRON_SCHEDULE=0 2 * * *
```

## 🚀 Running the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/verify-email/:token` - Verify email
- `POST /api/auth/resend-verification` - Resend verification email

### Files
- `POST /api/files/upload` - Upload files (requires auth & email verification)
- `GET /api/files/:uuid` - Get file metadata
- `POST /api/files/:uuid/verify-pin` - Verify PIN
- `GET /api/files/:uuid/download` - Download file
- `GET /api/files/:uuid/stream` - Stream file (for preview)

### Dashboard
- `GET /api/dashboard/uploads` - Get user's uploads
- `GET /api/dashboard/analytics` - Get user analytics
- `POST /api/dashboard/files/:id/extend` - Extend file expiry
- `DELETE /api/dashboard/files/:id` - Delete file
- `GET /api/dashboard/files/:id/logs` - Get download logs

### Admin (requires admin privileges)
- `GET /api/admin/analytics` - Get global analytics
- `GET /api/admin/users` - Get all users
- `POST /api/admin/clear-cache` - Clear analytics cache

## 🔐 Admin Access

To create an admin account, use the admin registration code during signup:

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "your_password",
  "adminCode": "ADMIN2025SECRET"
}
```

## 📦 File Upload Example

```javascript
const formData = new FormData();
formData.append('files', file1);
formData.append('files', file2);
formData.append('expiryHours', '24');
formData.append('maxDownloads', '10');
formData.append('receiverEmails', 'user1@example.com,user2@example.com');
formData.append('message', 'Check out these files!');
formData.append('pin', '1234');

fetch('http://localhost:5000/api/files/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: formData
});
```

## 🗄️ Database Collections

### users
- User accounts with authentication and storage tracking

### files
- File metadata, expiry, downloads, and protection settings

### download_logs
- Download history with automatic 10-day retention (TTL index)

## 🧹 Cleanup Job

The cleanup job runs daily at 2 AM (configurable) and:
- Deletes expired files from disk
- Removes database records
- Updates user storage quotas
- Logs cleanup statistics

## 🚢 Deployment

### Deploying to Render.com

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables from `.env`
6. Deploy!

### MongoDB Atlas Setup for Production

1. Go to https://cloud.mongodb.com
2. Create a free cluster
3. Add IP whitelist: `0.0.0.0/0` (allow all) or specific IPs
4. Create database user
5. Get connection string and update `MONGODB_URI`

## 📊 Storage Limits

- **Per File**: 200 MB max
- **Per User**: 500 MB total
- **Global**: 10 GB total
- **Warnings**: Users get warnings at 80-90% capacity

## 🔒 Security Features

- JWT authentication with 3-day expiry
- Bcrypt password hashing
- PIN protection with 9 attempts / 15-minute lockout
- Helmet for HTTP headers
- CORS protection
- Input validation
- Rate limiting ready

## 📝 Notes

- Files are stored in `uploads/` directory
- Multiple files are automatically zipped
- Download logs expire after 10 days
- Email verification required for uploads
- Admin analytics cached for 5 minutes

## 🐛 Troubleshooting

**MongoDB Connection Error:**
- Check if MongoDB is running
- Verify connection string in `.env`

**Email Not Sending:**
- Verify `SENDGRID_API_KEY` is set correctly
- Confirm `EMAIL_FROM` is a verified sender in SendGrid
- If using SMTP fallback, check the SMTP credentials

**File Upload Fails:**
- Check storage quotas
- Verify file size limits
- Ensure user email is verified

## 📄 License

MIT

## 👨‍💻 Author

Your Name

---

**Need help?** Check the logs or create an issue on GitHub.
