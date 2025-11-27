# 🚀 Deployment Guide

This guide covers deploying your Trading Signal App to various platforms.

## 📋 Pre-Deployment Checklist

- [x] Git repository initialized
- [x] Environment variables configured
- [x] Production build tested locally
- [x] Database connection string ready
- [x] API keys secured

## 🌐 Deployment Options

### 1. Heroku (Easiest)

#### Prerequisites
- Heroku account (free tier available)
- Heroku CLI installed

#### Steps

```bash
# Login to Heroku
heroku login

# Create new app
heroku create your-app-name

# Add MongoDB addon (free tier)
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set BINANCE_API_KEY=your_key
heroku config:set ALPHA_VANTAGE_KEY=your_key

# Deploy
git push heroku main

# Open app
heroku open
```

#### Auto-Deploy from GitHub
1. Go to Heroku Dashboard
2. Connect your GitHub repository
3. Enable automatic deploys from main branch

---

### 2. Render (Recommended)

#### Prerequisites
- Render account (free tier available)
- GitHub repository

#### Steps

1. **Create Web Service**
   - Go to render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Configure:
     - Name: trading-signal-app
     - Environment: Node
     - Build Command: `npm install && cd client && npm install && npm run build`
     - Start Command: `npm start`

2. **Add Environment Variables**
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   BINANCE_API_KEY=your_key
   ALPHA_VANTAGE_KEY=your_key
   ```

3. **Create MongoDB Database**
   - Click "New +" → "MongoDB"
   - Copy connection string
   - Add to MONGODB_URI variable

4. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete

---

### 3. Railway

#### Prerequisites
- Railway account
- GitHub repository

#### Steps

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to GitHub repo
railway link

# Add MongoDB
railway add

# Set environment variables
railway variables set NODE_ENV=production
railway variables set MONGODB_URI=your_connection_string

# Deploy
railway up
```

---

### 4. DigitalOcean / AWS / VPS

#### Prerequisites
- VPS with Ubuntu 20.04+
- Domain name (optional)
- SSH access

#### Steps

```bash
# SSH into your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-5.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod

# Install PM2
npm install -g pm2

# Clone repository
git clone https://github.com/yourusername/trading-signal-app.git
cd trading-signal-app

# Install dependencies
npm run install-all

# Create .env file
nano .env
# Add your environment variables

# Build client
cd client && npm run build && cd ..

# Start with PM2
pm2 start server/index.js --name trading-app
pm2 save
pm2 startup

# Setup Nginx (optional)
apt install -y nginx
nano /etc/nginx/sites-available/trading-app
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/trading-app /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Setup SSL with Let's Encrypt
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

---

### 5. Docker Deployment

#### Prerequisites
- Docker installed
- Docker Compose installed

#### Steps

```bash
# Build image
docker build -t trading-signal-app .

# Run with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop
docker-compose down
```

#### Deploy to Docker Hub
```bash
# Tag image
docker tag trading-signal-app yourusername/trading-signal-app:latest

# Push to Docker Hub
docker push yourusername/trading-signal-app:latest

# Pull and run on any server
docker pull yourusername/trading-signal-app:latest
docker run -d -p 5000:5000 --env-file .env yourusername/trading-signal-app
```

---

### 6. Vercel (Frontend Only)

For deploying just the React frontend:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd client
vercel

# Set environment variables in Vercel dashboard
# Point API calls to your backend URL
```

---

## 🔐 Environment Variables

Required for all deployments:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://username:password@host:port/database
BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET_KEY=your_binance_secret_key
ALPHA_VANTAGE_KEY=your_alpha_vantage_key
```

---

## 🗄️ Database Options

### MongoDB Atlas (Recommended - Free Tier)
1. Go to mongodb.com/cloud/atlas
2. Create free cluster
3. Create database user
4. Whitelist IP (0.0.0.0/0 for all)
5. Get connection string
6. Replace `<password>` with your password

### Self-Hosted MongoDB
```bash
# Install MongoDB
# Ubuntu/Debian
apt install -y mongodb-org

# Start service
systemctl start mongod
systemctl enable mongod

# Connection string
mongodb://localhost:27017/trading-signals
```

---

## 🧪 Testing Production Build Locally

```bash
# Build client
cd client && npm run build && cd ..

# Set production environment
export NODE_ENV=production  # Linux/Mac
set NODE_ENV=production     # Windows

# Start server
npm start

# Test at http://localhost:5000
```

---

## 📊 Monitoring & Logs

### Heroku
```bash
heroku logs --tail
heroku ps
```

### PM2 (VPS)
```bash
pm2 logs trading-app
pm2 monit
pm2 status
```

### Docker
```bash
docker-compose logs -f
docker stats
```

---

## 🔄 CI/CD Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm run install-all
    
    - name: Build
      run: npm run build
    
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "your-app-name"
        heroku_email: "your-email@example.com"
```

---

## 🚨 Troubleshooting

### Build Fails
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### MongoDB Connection Error
- Check connection string format
- Verify IP whitelist
- Confirm database user credentials

### WebSocket Not Working
- Ensure WebSocket support on platform
- Check proxy/load balancer settings
- Verify CORS configuration

### Port Already in Use
```bash
# Find process
lsof -i :5000  # Linux/Mac
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>
```

---

## 📈 Performance Optimization

### Enable Compression
```javascript
const compression = require('compression');
app.use(compression());
```

### Add Caching
```javascript
app.use(express.static('client/build', {
  maxAge: '1d',
  etag: true
}));
```

### Use CDN
- Upload static assets to Cloudflare/AWS CloudFront
- Update asset URLs in build

---

## 🔒 Security Checklist

- [ ] Environment variables secured
- [ ] API keys not in code
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation added
- [ ] MongoDB authentication enabled
- [ ] Regular security updates

---

## 📞 Support

If you encounter issues:
1. Check logs first
2. Review environment variables
3. Test locally with production build
4. Check platform-specific documentation

---

## ✅ Post-Deployment

After successful deployment:
1. Test all features
2. Monitor logs for errors
3. Set up uptime monitoring (UptimeRobot, Pingdom)
4. Configure backups for database
5. Document your deployment process

---

**Your app is now live! 🎉**
