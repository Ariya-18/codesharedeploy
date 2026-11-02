# CodeShare Deployment Guide

## Overview
CodeShare is deployed across three services:
- **Frontend**: Vercel (React + Vite)
- **Backend**: Render (Node.js + Express)
- **Database**: MongoDB Atlas

---

## Prerequisites
1. GitHub account with repo push access
2. Vercel account (https://vercel.com)
3. Render account (https://render.com)
4. MongoDB Atlas account (https://www.mongodb.com/cloud/atlas)
5. RapidAPI account with Judge0 API subscription (https://rapidapi.com/judge0-official/api/judge0-ce)
6. Gmail account with App Password for email notifications

---

## Step 1: Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (M0 free tier is sufficient)
3. Create a database user with username and password
4. Whitelist your IP addresses (and 0.0.0.0/0 for all)
5. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/codeshare?retryWrites=true&w=majority`
6. Update `.env` with `MONGO_URI`

---

## Step 2: Deploy Backend to Render

### Backend Setup
```bash
cd backend
npm install
```

### Create Render Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Configure:
   - **Name**: `codeshare-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run dev` (development) or `node server.js` (production)
   - **Region**: Choose closest to your users

### Add Environment Variables in Render

```
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://[user]:[password]@cluster.mongodb.net/codeshare
JWT_SECRET=<generate_with_: openssl rand -base64 32>
CLIENT_URL=https://codeshare.vercel.app
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=<your_rapidapi_key>
JUDGE0_API_HOST=judge0-ce.p.rapidapi.com
EMAIL_USER=<gmail_account>
EMAIL_PASS=<gmail_app_password>
EMAIL_FROM=CodeShare <your_email@gmail.com>
```

### Deploy
1. Click "Create Web Service"
2. Render will automatically deploy from GitHub
3. Wait for "Your service is live" message
4. Copy your service URL (e.g., `https://codeshare-api.onrender.com`)

---

## Step 3: Deploy Frontend to Vercel

### Frontend Setup
```bash
cd Frontend
npm install
```

### Create .env.production.local
```
VITE_API_URL=https://codeshare-api.onrender.com/api
VITE_SOCKET_URL=https://codeshare-api.onrender.com
```

### Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repo
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./Frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables:
   ```
   VITE_API_URL=https://codeshare-api.onrender.com/api
   VITE_SOCKET_URL=https://codeshare-api.onrender.com
   ```
6. Click "Deploy"

---

## Step 4: Configure External Services

### RapidAPI - Judge0

1. Go to [RapidAPI Judge0 API](https://rapidapi.com/judge0-official/api/judge0-ce)
2. Subscribe to the free tier
3. Copy your API Key
4. Add to backend environment variables:
   ```
   JUDGE0_API_KEY=<your_key>
   ```

### Gmail App Password

1. Enable 2-Factor Authentication on your Google Account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an app password for "Mail"
4. Use this password in `.env`:
   ```
   EMAIL_PASS=<16-character_password>
   ```

---

## Step 5: Post-Deployment Testing

### Test Backend
```bash
curl https://codeshare-api.onrender.com/api/auth/profile \
  -H "Authorization: Bearer <token>"
```

### Test Frontend
1. Visit `https://codeshare.vercel.app`
2. Sign up and create a test room
3. Test code execution with Judge0
4. Test real-time collaboration in two browser windows
5. Check console for Socket.io connection success

### Verify Logs
- **Backend**: Render Dashboard → Logs tab
- **Frontend**: Vercel Dashboard → Logs tab

---

## Step 6: Production Optimization

### Backend Optimizations
- [ ] Set `NODE_ENV=production`
- [ ] Increase rate limits if needed in `rateLimitMiddleware.js`
- [ ] Enable HTTPS everywhere
- [ ] Add CORS for your Vercel domain
- [ ] Monitor MongoDB connection limits

### Frontend Optimizations
- [ ] Run `npm run build` and verify no errors
- [ ] Check bundle size with `vite preview`
- [ ] Enable compression in Vercel
- [ ] Configure custom domain

### Database Optimizations
- [ ] Create MongoDB indexes for frequently queried fields
- [ ] Enable backups in MongoDB Atlas
- [ ] Set up automated snapshots

---

## Monitoring & Maintenance

### Daily Checks
- [ ] Monitor Render and Vercel dashboards for errors
- [ ] Check MongoDB Atlas for connection issues
- [ ] Review application logs for warnings

### Weekly Tasks
- [ ] Backup production database
- [ ] Review error logs and fix bugs
- [ ] Update dependencies if security patches available

### Monthly Tasks
- [ ] Performance audit
- [ ] Security review
- [ ] Scale resources if needed

---

## Troubleshooting

### Backend Won't Start
1. Check all environment variables are set
2. Verify MongoDB connection string
3. Check logs: Render Dashboard → Logs
4. Ensure all dependencies installed: `npm install`

### Frontend Blank Page
1. Check browser console for errors (F12)
2. Verify `VITE_API_URL` is correct
3. Check Socket.io connection in Network tab
4. Clear browser cache and hard refresh (Ctrl+Shift+R)

### Code Execution Failing
1. Verify Judge0 API key is valid
2. Check RapidAPI subscription is active
3. Review backend logs for Judge0 errors
4. Test with simple code first: `console.log("test")`

### Real-time Collaboration Not Working
1. Verify Socket.io is connected (Network → WS)
2. Check backend logs for socket errors
3. Ensure same room ID in both windows
4. Try refreshing both windows

### Email Not Sending
1. Verify Gmail App Password is correct
2. Check email account isn't blocked
3. Verify sender email matches `EMAIL_FROM`
4. Check logs for SMTP errors

---

## Rollback Plan

If deployment fails:

1. **Frontend**: Vercel auto-rolls back on build failure
2. **Backend**: 
   ```bash
   git revert <commit-hash>
   git push origin main
   # Render auto-deploys new commit
   ```
3. **Database**: Use MongoDB Atlas snapshots to restore

---

## Domain Setup

### Custom Domain on Vercel
1. Vercel Dashboard → Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### Custom Domain on Render
1. Render Dashboard → Settings → Custom Domain
2. Add your domain
3. Update DNS records as instructed

---

## Scaling Guide

As traffic grows:

1. **Database**: Upgrade MongoDB tier (M1, M2, etc.)
2. **Backend**: Upgrade Render instance size
3. **Frontend**: Vercel scales automatically
4. **CDN**: Enable CloudFlare for additional caching

---

## Security Checklist

- [ ] All environment variables hidden in `.env`
- [ ] Never commit `.env` to Git
- [ ] JWT secret is strong (32+ characters)
- [ ] SSL/TLS certificates updated
- [ ] Rate limiting enabled on all auth endpoints
- [ ] CORS configured for specific domains only
- [ ] Database backups enabled
- [ ] No secrets in source code or logs

---

## Support & Documentation

- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)
- [Judge0 API Docs](https://ce.judge0.com/docs)
- [Express.js Docs](https://expressjs.com)
- [React Docs](https://react.dev)

---

**Last Updated**: October 30, 2026
**Status**: Ready for Production
