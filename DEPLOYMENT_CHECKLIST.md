# Render.com Deployment Checklist

Simple checklist for deploying to Render.com.

## Before Deployment

- [ ] **Code Built**: `npm run build` passes without errors
- [ ] **No Vulnerabilities**: `npm audit` shows zero vulnerabilities
- [ ] **Git Repository**: Code pushed to GitHub
- [ ] **Render Account**: Created and ready

## Render Dashboard Setup

- [ ] **GitHub Connected**: GitHub account linked to Render
- [ ] **Repository Selected**: Your repository chosen
- [ ] **Service Name**: Set to `poe-forum-api` or your desired name
- [ ] **Branch**: Set to `main`
- [ ] **Build Command**: `npm install && npm run build`
- [ ] **Start Command**: `npm start`

## Environment Variables

Set these in Render dashboard:

- [ ] `NODE_ENV` = `production`
- [ ] `CORS_ORIGIN` = `https://your-frontend-domain.com`
- [ ] `LOG_LEVEL` = `info`
- [ ] Optional: `RATE_LIMIT_MAX` = `100`
- [ ] Optional: `API_URL` = `https://poe-forum-api.onrender.com`

## Health Check Configuration

- [ ] **Path**: `/health`
- [ ] **Interval**: 30 seconds
- [ ] **Timeout**: 5 seconds

## Deployment

- [ ] **Service Created**: Click "Create Web Service" button
- [ ] **Build Started**: Watch deployment progress in logs
- [ ] **Build Complete**: Takes 2-5 minutes typically
- [ ] **Service Running**: Status shows "Live"

## Testing

- [ ] **Health Check**: `curl https://your-service.onrender.com/health` returns OK
- [ ] **API Works**: `curl https://your-service.onrender.com/api/categories` returns data
- [ ] **Logs Clean**: Check dashboard logs for errors
- [ ] **No Red Flags**: Monitor health checks for 5 minutes

## Done!

- ✅ API is live and running on Render
- ✅ Automatic deployments enabled (push to main = auto-deploy)
- ✅ High availability with Render's infrastructure
- [ ] Spot-check API responses

### First Day
- [ ] Monitor uptime continuously
- [ ] Check for performance degradation
- [ ] Review error logs for patterns
- [ ] Verify rate limiting works

### First Week
- [ ] Monitor trending metrics
- [ ] Check for memory leaks
- [ ] Review high-error endpoints
- [ ] Collect performance baselines

## Maintenance Schedule

- [ ] **Weekly**: Review logs, check for errors
- [ ] **Weekly**: Verify backup systems working
- [ ] **Monthly**: Update dependencies, security patches
- [ ] **Monthly**: Review and adjust rate limits if needed
- [ ] **Quarterly**: Full security audit
- [ ] **Quarterly**: Disaster recovery drill

## Communication

- [ ] **Notify Team**: Deployment completed
- [ ] **Release Notes**: Document changes made
- [ ] **Stakeholders Informed**: Communicate to users if needed
- [ ] **Status Page**: Update if applicable

## Success Criteria

- ✅ All health checks passing
- ✅ Response times at baseline
- ✅ No critical errors in logs
- ✅ Rate limiting working
- ✅ SSL/TLS properly configured
- ✅ CORS headers present
- ✅ API responding to requests
- ✅ Monitoring and alerting active

---

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Version**: _______________  
**Notes**: _______________
