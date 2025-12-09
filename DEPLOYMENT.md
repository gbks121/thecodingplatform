# Deployment Guide for The Coding Platform

This guide covers the containerization and deployment setup for The Coding Platform using Docker, GitHub Actions, and Render.

## 🐳 Docker Setup

### Local Development with Docker

1. **Build and run the container:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - Frontend: http://localhost
   - Backend API: http://localhost/api
   - Health Check: http://localhost/health

3. **Stop the container:**
   ```bash
   docker-compose down
   ```

### Manual Docker Build

```bash
# Build the image
docker build -t thecodingplatform .

# Run the container
docker run -p 80:80 thecodingplatform

# Run with custom environment variables
docker run -p 80:80 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  thecodingplatform
```

## 🚀 GitHub Actions CI/CD

The GitHub Actions workflow (`.github/workflows/ci-cd.yml`) automatically:

1. **Test Phase:**
   - Runs linting and tests
   - Generates coverage reports
   - Uploads coverage to Codecov

2. **Build Phase:**
   - Builds multi-platform Docker images (AMD64 & ARM64)
   - Pushes to GitHub Container Registry (ghcr.io)
   - Caches layers for faster builds

3. **Deploy Phase:**
   - Deploys to Render automatically
   - Sends deployment notifications

4. **Security Phase:**
   - Scans for vulnerabilities with Trivy
   - Uploads security reports

### Required GitHub Secrets

Add these secrets to your GitHub repository:

- `RENDER_API_KEY` - Your Render API key
- `RENDER_SERVICE_ID` - Your Render service ID
- `SLACK_WEBHOOK` (optional) - For deployment notifications

## 🌐 Render Deployment

### Setup Steps

1. **Create Render Account:**
   - Sign up at https://render.com
   - Connect your GitHub account

2. **Create Web Service:**
   - Use the `render.yaml` blueprint file
   - Select the EU (Frankfurt) region
   - Choose the free plan

3. **Configure Environment Variables:**
   - `NODE_ENV=production`
   - `PORT=3001`

4. **Set Health Check:**
   - Path: `/health`
   - Interval: 30 seconds

### Manual Deployment (Alternative)

If not using the blueprint, manually create a web service with:
- **Runtime:** Docker
- **Dockerfile Path:** `./Dockerfile`
- **Docker Context:** `.`
- **Port:** 80
- **Health Check:** `/health`

## 🔧 Container Architecture

The container uses a multi-stage build process:

```
┌─────────────────────────────────────┐
│        Alpine Linux Container       │
│                                     │
│  ┌─────────────┐    ┌─────────────┐ │
│  │   Nginx     │    │  Node.js    │ │
│  │  (port 80)  │    │  (port 3001)│ │
│  │  Frontend   │    │   Backend   │ │
│  │  Static     │    │  WebSocket  │ │
│  │  Files      │    │   Server    │ │
│  └─────────────┘    └─────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

### Key Features:
- **Alpine Linux:** Minimal footprint (~50MB base)
- **Multi-stage build:** Optimized for production
- **Non-root user:** Security best practices
- **Health checks:** Automatic container health monitoring
- **Signal handling:** Proper shutdown handling with dumb-init
- **Caching:** Layer caching for faster builds

## 📊 Monitoring & Logging

### Container Logs
```bash
# View logs
docker logs <container-id>

# Follow logs
docker logs -f <container-id>
```

### Health Monitoring
- Container health checks every 30 seconds
- Render dashboard monitoring
- GitHub Actions deployment status

## 🔒 Security

### Container Security
- Non-root user execution
- Minimal Alpine Linux base
- Vulnerability scanning with Trivy
- No unnecessary packages

### Network Security
- CORS enabled for cross-origin requests
- WebSocket connections handled securely
- Health check endpoint exposed

## 🔄 Updates & Rollbacks

### Updating the Application
1. Push changes to `main` branch
2. GitHub Actions automatically builds and deploys
3. Render performs zero-downtime deployment

### Rollback Process
1. Revert changes in Git
2. Push revert commit
3. Automatic redeployment of previous version

## 🐛 Troubleshooting

### Common Issues

1. **Container won't start:**
   ```bash
   docker logs <container-id>
   ```

2. **Build failures:**
   - Check `.dockerignore` file
   - Verify all dependencies are included
   - Check build logs in GitHub Actions

3. **Deployment failures:**
   - Check Render dashboard logs
   - Verify environment variables
   - Check health check endpoint

4. **WebSocket connection issues:**
   - Ensure proper proxy configuration
   - Check CORS settings
   - Verify port mappings

### Debug Mode
```bash
# Run with debug logging
docker run -p 80:80 \
  -e NODE_ENV=development \
  -e DEBUG=* \
  thecodingplatform
```

## 📞 Support

For issues related to:
- **Docker:** Check container logs and build output
- **GitHub Actions:** Review workflow runs in Actions tab
- **Render:** Check service logs in Render dashboard
- **Application:** Review application logs and error messages

## 🎯 Next Steps

1. Set up GitHub secrets for deployment
2. Test the container locally
3. Push to main branch to trigger deployment
4. Monitor deployment in Render dashboard
5. Configure custom domain (optional)
6. Set up monitoring alerts (optional)