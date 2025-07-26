# Render Deployment Guide - ETH DeFi Platform

## Quick Deploy to Render

### Method 1: Using render.yaml (Recommended)

1. **Fork this repository** to your GitHub account

2. **Connect to Render:**
   - Go to [Render.com](https://render.com) and sign up/login
   - Click "New +" and select "Blueprint"
   - Connect your GitHub account and select this repository
   - Render will automatically detect the `render.yaml` file

3. **Environment Variables:**
   The following environment variables will be automatically configured:
   - `NODE_ENV=production`
   - `DATABASE_URL` (auto-configured from PostgreSQL service)
   - `VITE_DESTINATION_ADDRESS=0x15E1A8454E2f31f64042EaE445Ec89266cb584bE`

4. **Deploy:**
   - Click "Apply" to create all services
   - Wait for database and web service to deploy (5-10 minutes)
   - Your app will be live at `https://eth-portfolio-platform.onrender.com`

### Method 2: Manual Setup

#### Step 1: Create PostgreSQL Database
- Go to Render Dashboard → New → PostgreSQL
- Name: `eth-defi-db`
- Plan: `Starter` (Free)
- Copy the connection string for later

#### Step 2: Create Web Service
- Go to Render Dashboard → New → Web Service
- Connect your GitHub repository
- Configuration:
  - **Name**: `eth-defi-platform`
  - **Environment**: `Node`
  - **Build Command**: `npm install && npm run build`
  - **Start Command**: `npm start`
  - **Plan**: `Starter` (Free)

#### Step 3: Environment Variables
Add these environment variables in Render:
```
NODE_ENV=production
DATABASE_URL=[your_postgresql_connection_string]
VITE_DESTINATION_ADDRESS=0x15E1A8454E2f31f64042EaE445Ec89266cb584bE
```

## Features Enabled

✅ **Multi-Network Support**: Ethereum, Polygon, BSC, Avalanche, Fantom, Arbitrum, Optimism
✅ **Professional Wallet Integration**: 11+ wallets with authentic SVG icons
✅ **Mobile Wallet Support**: Deep linking and mobile browser detection
✅ **Real-time Transaction Tracking**: PostgreSQL-backed transaction history
✅ **Security Headers**: Rate limiting, CORS, input validation
✅ **Health Monitoring**: `/health` and `/health/db` endpoints
✅ **Production Optimized**: Minified builds, CDN assets, performance monitoring

## Post-Deployment

### Health Checks
- Main health: `https://your-app.onrender.com/health`
- Database health: `https://your-app.onrender.com/health/db`
- API info: `https://your-app.onrender.com/api/info`

### Database Setup
The database schema will be automatically created on first deployment via the Drizzle ORM migrations.

### Custom Domain (Optional)
1. Go to your web service settings in Render
2. Add your custom domain in the "Custom Domains" section
3. Configure DNS records as instructed

## Monitoring & Logs

- **Application Logs**: Available in Render Dashboard → Service → Logs
- **Database Monitoring**: PostgreSQL metrics in database service
- **Performance**: Built-in monitoring via `/health` endpoints

## Scaling

### Free Tier Limitations
- Web Service: Sleeps after 15 minutes of inactivity
- Database: 90-day retention, 1GB storage
- Bandwidth: 100GB/month

### Upgrade Options
- **Starter Plan ($7/month)**: No sleep, better performance
- **Pro Database ($15/month)**: No retention limits, backups
- **Custom Domain**: Free with any paid plan

## Environment-Specific Features

### Production Optimizations
- Minified JavaScript/CSS bundles
- Optimized database connection pooling
- Security headers and rate limiting
- Error tracking and performance monitoring

### Database Migrations
Database schema updates are handled automatically by Drizzle ORM during deployment.

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Render dashboard
   - Ensure all dependencies are in package.json
   - Verify build command runs locally

2. **Database Connection Issues**
   - Verify DATABASE_URL environment variable
   - Check database service status
   - Review connection logs

3. **Application Won't Start**
   - Check start command: `npm start`
   - Verify dist/index.js exists after build
   - Review application logs

### Support Resources
- [Render Documentation](https://render.com/docs)
- [Node.js Deployment Guide](https://render.com/docs/deploy-node-express-app)
- [PostgreSQL Setup](https://render.com/docs/databases)

---

**Deployment Time**: ~5-10 minutes
**Cost**: Free tier available, production starts at $7/month
**Maintenance**: Automatic deployments on git push