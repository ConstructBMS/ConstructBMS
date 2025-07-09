# Archer Business Management System - Production Deployment Guide

## Overview

This guide covers the production deployment of the Archer Business Management System, including setup, configuration, monitoring, and maintenance.

## Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **CPU**: 2+ cores
- **RAM**: 4GB+ (8GB recommended)
- **Storage**: 20GB+ available space
- **Network**: Stable internet connection

### Software Requirements
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Node.js**: 18+ (for build process)
- **Git**: Latest version
- **Nginx**: 1.18+ (optional, for reverse proxy)

### Domain & SSL
- **Domain**: Registered domain name
- **SSL Certificate**: Let's Encrypt or commercial certificate
- **DNS**: Proper DNS configuration

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/your-org/archer-business-management.git
cd archer-business-management
```

### 2. Environment Setup
```bash
# Copy environment template
cp env.production.example .env.local

# Edit environment variables
nano .env.local
```

### 3. Supabase Setup
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key
3. Update `.env.local` with your Supabase credentials
4. Run the database schema:
   ```bash
   # Connect to your Supabase SQL editor and run:
   cat supabase/schema.sql
   ```

### 4. Build & Deploy
```bash
# Install dependencies
npm install

# Build for production
npm run build:production

# Deploy with Docker
docker-compose -f docker-compose.production.yml up -d
```

### 5. Verify Deployment
```bash
# Check application health
curl http://localhost:3000/api/health

# Check application status
docker-compose -f docker-compose.production.yml ps
```

## Detailed Configuration

### Environment Variables

#### Required Variables
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Application Configuration
VITE_APP_NAME=Archer Business Management
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production
```

#### Optional Variables
```bash
# Security
VITE_CSP_ENABLED=true
VITE_HSTS_ENABLED=true

# Performance
VITE_CACHE_ENABLED=true
VITE_COMPRESSION_ENABLED=true

# Monitoring
VITE_ERROR_TRACKING_ENABLED=true
VITE_PERFORMANCE_MONITORING=true

# File Upload
VITE_MAX_FILE_SIZE=10485760
VITE_STORAGE_BUCKET=archer-files
```

### Docker Configuration

#### Production Dockerfile
The production Dockerfile uses multi-stage builds for optimization:
- **Builder stage**: Compiles the application
- **Production stage**: Runs the optimized application

#### Docker Compose Services
- **archer-app**: Main application container
- **nginx**: Reverse proxy (optional)
- **redis**: Caching (optional)
- **postgres**: Database (if not using Supabase)
- **prometheus**: Monitoring (optional)
- **grafana**: Visualization (optional)

### Nginx Configuration

#### SSL Configuration
```bash
# Generate SSL certificate with Let's Encrypt
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates to Nginx
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem
```

#### Security Headers
The Nginx configuration includes:
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection

## Deployment Options

### Option 1: Docker Compose (Recommended)
```bash
# Deploy all services
docker-compose -f docker-compose.production.yml up -d

# Deploy with specific profiles
docker-compose -f docker-compose.production.yml --profile nginx --profile monitoring up -d
```

### Option 2: Manual Deployment
```bash
# Build application
npm run build:production

# Start production server
NODE_ENV=production node server/index-production.cjs
```

### Option 3: Cloud Deployment

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Netlify
```bash
# Build application
npm run build:production

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

#### AWS
```bash
# Deploy to AWS ECS
aws ecs create-service --cluster archer-cluster --service-name archer-service --task-definition archer-task
```

## Monitoring & Maintenance

### Health Checks
```bash
# Application health
curl http://localhost:3000/api/health

# Database health
curl http://localhost:3000/api/health/db

# Metrics
curl http://localhost:3000/api/metrics
```

### Logs
```bash
# Application logs
docker-compose -f docker-compose.production.yml logs archer-app

# Nginx logs
docker-compose -f docker-compose.production.yml logs nginx

# All logs
docker-compose -f docker-compose.production.yml logs -f
```

### Performance Monitoring

#### Prometheus & Grafana
```bash
# Start monitoring stack
docker-compose -f docker-compose.production.yml --profile monitoring up -d

# Access Grafana
open http://localhost:3001
# Default credentials: admin/admin
```

#### Lighthouse Performance
```bash
# Run performance audit
npm run performance:test

# View performance report
npm run performance:report
```

### Backup & Recovery

#### Database Backup
```bash
# Supabase backup (automatic)
# Manual backup via Supabase dashboard

# Local PostgreSQL backup
docker exec archer-postgres pg_dump -U archer archer > backup.sql
```

#### Application Backup
```bash
# Backup application data
tar -czf archer-backup-$(date +%Y%m%d).tar.gz dist/ public/ server/

# Backup Docker volumes
docker run --rm -v archer_postgres-data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz -C /data .
```

## Security Hardening

### SSL/TLS Configuration
- Use TLS 1.2+ only
- Enable HSTS
- Configure secure cipher suites
- Regular certificate renewal

### Access Control
- Implement rate limiting
- Use strong passwords
- Enable 2FA for admin accounts
- Regular security audits

### Network Security
- Configure firewall rules
- Use VPN for admin access
- Monitor network traffic
- Regular security updates

## Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check logs
docker-compose -f docker-compose.production.yml logs archer-app

# Check environment variables
docker-compose -f docker-compose.production.yml config

# Restart application
docker-compose -f docker-compose.production.yml restart archer-app
```

#### Database Connection Issues
```bash
# Check Supabase status
curl https://status.supabase.com

# Verify credentials
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Test connection
curl -H "apikey: $VITE_SUPABASE_ANON_KEY" "$VITE_SUPABASE_URL/rest/v1/"
```

#### Performance Issues
```bash
# Check resource usage
docker stats

# Monitor application metrics
curl http://localhost:3000/api/metrics

# Check database performance
# Use Supabase dashboard for query analysis
```

### Performance Optimization

#### Application Level
- Enable gzip compression
- Optimize bundle size
- Use CDN for static assets
- Implement caching strategies

#### Database Level
- Optimize queries
- Use indexes effectively
- Monitor query performance
- Regular maintenance

#### Infrastructure Level
- Use load balancers
- Implement auto-scaling
- Monitor resource usage
- Regular backups

## Maintenance Schedule

### Daily
- Check application health
- Monitor error logs
- Verify backup completion

### Weekly
- Review performance metrics
- Update dependencies
- Security audit
- Performance testing

### Monthly
- Full system backup
- SSL certificate renewal
- Security updates
- Performance optimization

### Quarterly
- Infrastructure review
- Capacity planning
- Disaster recovery test
- Security assessment

## Support & Resources

### Documentation
- [Supabase Documentation](https://supabase.com/docs)
- [Docker Documentation](https://docs.docker.com)
- [Nginx Documentation](https://nginx.org/en/docs/)

### Monitoring Tools
- [Prometheus](https://prometheus.io/)
- [Grafana](https://grafana.com/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Security Tools
- [OWASP ZAP](https://owasp.org/www-project-zap/)
- [Nmap](https://nmap.org/)
- [Let's Encrypt](https://letsencrypt.org/)

## Contact & Support

For deployment support:
- **Email**: support@archer-bms.com
- **Documentation**: https://docs.archer-bms.com
- **Issues**: https://github.com/your-org/archer-business-management/issues

---

**Note**: This deployment guide is for production environments. For development setup, see the main README.md file. 