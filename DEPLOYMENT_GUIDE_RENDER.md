# Render.com Deployment Guide for Orbitra Itinerary

## Overview
This guide will help you deploy your Orbitra Itinerary application to Render.com successfully.

## Issues Fixed

### 1. **Port Binding Issue**
- **Problem**: Server was not binding to the correct port assigned by Render
- **Solution**: Updated `server/index.js` to use `process.env.PORT` and bind to `0.0.0.0` when running on Render

### 2. **MongoDB Connection Timeout**
- **Problem**: MongoDB connection was failing with `ECONNREFUSED` errors
- **Solution**: 
  - Updated `server/config/db.js` with better timeout configurations
  - Increased connection timeout values for cloud environments
  - Added proper error handling

### 3. **CORS Issues**
- **Problem**: CORS was not allowing requests from Render domains
- **Solution**: Added `isRenderOrigin()` function to allow `*.onrender.com` domains

## Deployment Steps

### Option 1: Using render.yaml (Recommended)

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Fix Render deployment issues"
   git push origin main
   ```

2. **Connect to Render**:
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

3. **Configure Environment Variables**:
   - In the Render dashboard, go to your service
   - Navigate to "Environment" tab
   - Add the following environment variables (mark sensitive ones as "Encrypt"):
   
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   JWT_SECRET=<your-jwt-secret>
   FRONTEND_URL=https://your-frontend-domain.com (or your Render frontend URL)
   CLOUDINARY_CLOUD_NAME=<your-cloudinary-name>
   CLOUDINARY_API_KEY=<your-cloudinary-key>
   CLOUDINARY_API_SECRET=<your-cloudinary-secret>
   GOOGLE_GENERATIVE_AI_API_KEY=<your-google-ai-key>
   ```

4. **Deploy**:
   - Click "Apply" to start the deployment
   - Monitor the deployment logs in the Render dashboard

### Option 2: Manual Deployment

1. **Create a new Web Service** on Render:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Build & Start**:
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your deployment branch)

3. **Set Environment Variables** (same as above)

4. **Advanced Settings**:
   - Set **Port** to `10000`
   - Enable **Auto-Deploy**

5. **Deploy**

## MongoDB Atlas Configuration

Make sure your MongoDB Atlas cluster is configured correctly:

1. **Whitelist IP Addresses**:
   - Go to MongoDB Atlas → Network Access
   - Add IP address `0.0.0.0/0` (allow access from anywhere) for development
   - Or add Render's IP addresses for production

2. **Database User**:
   - Ensure the database user has read/write permissions
   - Verify the password is correct in the connection string

3. **Connection String**:
   - Your connection string should look like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/orbitra-itinerary?retryWrites=true&w=majority
   ```

## Testing the Deployment

1. **Check Health Endpoint**:
   - Visit `https://your-app.onrender.com/`
   - You should see the API welcome message

2. **Test API Endpoints**:
   ```bash
   # Test registration
   curl -X POST https://your-app.onrender.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
   
   # Test login
   curl -X POST https://your-app.onrender.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   ```

3. **Check Logs**:
   - In Render dashboard, go to "Logs" tab
   - Look for any errors or connection issues

## Troubleshooting

### Issue: "MongoDB connection failed"
**Solutions**:
1. Verify MongoDB Atlas connection string is correct
2. Check MongoDB Atlas network access (IP whitelist)
3. Ensure database user has correct permissions
4. Wait a few minutes - sometimes MongoDB Atlas takes time to propagate changes

### Issue: "Port not detected" or "No open ports"
**Solutions**:
1. Ensure `PORT` environment variable is set to `10000`
2. Check that server is listening on `0.0.0.0` (already fixed in code)
3. Verify build and start commands are correct

### Issue: "CORS error"
**Solutions**:
1. Add your Render frontend URL to `FRONTEND_URL` environment variable
2. Ensure the URL includes `https://` and no trailing slash
3. Check browser console for specific CORS errors

### Issue: Application crashes on startup
**Solutions**:
1. Check all required environment variables are set
2. Verify `JWT_SECRET` is a strong, random string
3. Check logs for specific error messages

## Frontend Deployment (Optional)

If you want to host the frontend on Render as well:

1. **Uncomment the frontend service** in `render.yaml`
2. **Set frontend environment variables**:
   - Create a `.env.production` file in the `client` folder
   - Set `VITE_API_BASE_URL=https://your-api.onrender.com`
3. **Deploy frontend** as a separate static site service

## Cost Optimization

- **Free Tier**: Render offers a free tier with limitations
- **Auto-Sleep**: Free services sleep after 15 minutes of inactivity
- **Wake-up Time**: First request after sleep takes 30-60 seconds
- **Upgrade**: Consider upgrading to paid plan for production apps

## Monitoring

1. **Render Dashboard**: Monitor logs and metrics
2. **Uptime Monitoring**: Use services like UptimeRobot to monitor your API
3. **Error Tracking**: Consider integrating Sentry for error tracking

## Support

If you continue experiencing issues:
1. Check Render's documentation: https://render.com/docs
2. Review your application logs in the Render dashboard
3. Test MongoDB connection locally with the same connection string
4. Ensure all dependencies are installed correctly

## Summary of Changes Made

1. ✅ **server/index.js**: Fixed port binding and added Render origin support
2. ✅ **server/config/db.js**: Improved MongoDB connection with better timeout settings
3. ✅ **render.yaml**: Created deployment configuration file
4. ✅ **.gitignore**: Verified .env files are excluded from version control

Your application should now deploy successfully to Render!