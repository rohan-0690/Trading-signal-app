# 🚀 Vercel Deployment Guide

## Quick Deploy (2 Minutes)

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Go to Vercel:**
   - Visit: https://vercel.com/new
   - Sign in with GitHub

2. **Import Repository:**
   - Click "Import Project"
   - Select: `rohan-0690/Trading-signal-app`
   - Click "Import"

3. **Configure Project:**
   - Framework Preset: **Other**
   - Root Directory: `./` (leave as is)
   - Build Command: `npm run vercel-build`
   - Output Directory: `client/build`
   - Install Command: `npm install`

4. **Add Environment Variables:**
   Click "Environment Variables" and add:
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   BINANCE_API_KEY=your_binance_api_key
   ALPHA_VANTAGE_KEY=your_alpha_vantage_key
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live!

---

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: trading-signal-app
# - Directory: ./
# - Override settings? No

# Deploy to production
vercel --prod
```

---

## ⚠️ Important Notes

### MongoDB Connection
Vercel needs a cloud MongoDB instance. Get one free at:
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- Create cluster → Get connection string
- Add to Vercel environment variables

### WebSocket Limitations
Vercel serverless functions have limitations with WebSockets:
- WebSocket connections may not persist
- Consider using Vercel's Edge Functions or deploy backend separately

### Alternative: Split Deployment

For better WebSocket support, deploy separately:

**Frontend on Vercel:**
```bash
cd client
vercel
```

**Backend on Railway/Render:**
- Deploy `server/` folder to Railway or Render
- Update frontend API calls to point to backend URL

---

## 🔧 Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/trading
BINANCE_API_KEY=your_key_here
BINANCE_SECRET_KEY=your_secret_here
ALPHA_VANTAGE_KEY=your_key_here
```

---

## 🌐 Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. SSL certificate auto-configured

---

## 🔄 Auto-Deploy

Vercel automatically deploys when you push to GitHub:
```bash
git add .
git commit -m "Update"
git push origin main
```

Vercel will detect the push and redeploy automatically!

---

## 📊 Monitoring

- **Logs:** Vercel Dashboard → Your Project → Deployments → View Logs
- **Analytics:** Vercel Dashboard → Analytics
- **Performance:** Built-in performance monitoring

---

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Vercel Dashboard
- Verify all dependencies are in package.json
- Ensure build command is correct

### API Routes Not Working
- Verify `vercel.json` routes configuration
- Check API endpoints start with `/api/`
- Review function logs

### MongoDB Connection Error
- Verify connection string format
- Check IP whitelist (allow 0.0.0.0/0)
- Confirm database user credentials

---

## ✅ Post-Deployment Checklist

- [ ] App loads successfully
- [ ] API endpoints respond
- [ ] MongoDB connection works
- [ ] Environment variables set
- [ ] Custom domain configured (optional)
- [ ] Auto-deploy enabled

---

## 🎉 Your App is Live!

After deployment, you'll get a URL like:
```
https://trading-signal-app.vercel.app
```

Share it, test it, and start trading! 📈💰

---

## 💡 Pro Tips

1. **Preview Deployments:** Every branch push creates a preview URL
2. **Rollback:** Instantly rollback to previous deployments
3. **Edge Network:** Your app is served from 70+ global locations
4. **Zero Config:** Vercel auto-detects and optimizes your app

---

## 📞 Need Help?

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Check logs in Vercel Dashboard

**Happy deploying!** 🚀
