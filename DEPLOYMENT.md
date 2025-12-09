# Deployment Guide for The Coding Platform

## Overview
This guide explains how to deploy The Coding Platform to production using Render, with CI/CD via GitHub Actions.

## Architecture

### Local Development (Docker Compose)
- Frontend: Available at `http://localhost:8080`
- Backend API: Available at `http://localhost:3001`
- Both ports exposed for development convenience

### Production (Render)
- Single entry point: `https://your-service.onrender.com`
- Nginx reverse proxy handles all requests internally
- Backend service (port 3001) is NOT directly exposed to the outside world
- Nginx proxies `/api` and `/health` requests to the backend internally

## Deployment to Render

### Prerequisites
- A Render account
- GitHub repository with the project code

### Steps

1. **Prepare Render Configuration**:
   - The `render.yaml` file configures the deployment
   - Service runs as a Docker web service
   - Region set to Frankfurt (EU) for better latency
   - Free tier plan selected

2. **Connect GitHub Repository**:
   - Go to Render dashboard
   - Create new Web Service
   - Connect to your GitHub repository
   - Render will automatically use the `render.yaml` configuration

3. **Environment Variables**:
   - `NODE_ENV`: production
   - `PORT`: 3001 (for the backend service inside the container)

4. **Health Check**:
   - Render monitors `/health` endpoint
   - Nginx proxies this to the backend service

## CI/CD Pipeline

### GitHub Actions Workflow
- Builds and tests on every push to main branch
- Creates Docker image and pushes to GitHub Container Registry
- Triggers Render deployment via webhook

### Secrets Required
- `RENDER_API_KEY`: Your Render API key
- `RENDER_SERVICE_ID`: Your Render service ID

## Security Considerations

### Port Exposure
- In production, only the main service port is exposed to the internet
- Backend service (port 3001) is accessible only internally within the container
- Nginx acts as a reverse proxy, forwarding requests as needed
- This provides an additional security layer

### Network Isolation
- Backend service cannot be directly accessed from outside
- All traffic goes through nginx, which can implement additional security measures

## Scaling
- Free tier supports 1 instance with 512MB RAM
- Service will sleep after 15 minutes of inactivity
- First request will wake up the service (cold start)

## Monitoring
- Health check endpoint: `/health`
- Logs available in Render dashboard
- Error tracking through application logs

## Troubleshooting

### Common Issues
1. **Service not starting**: Check logs in Render dashboard
2. **Health check failing**: Verify backend service is responding
3. **Build failures**: Check GitHub Actions workflow logs
4. **Cold start delays**: Consider upgrading to paid plan for always-on service

### Debugging
- Check container logs in Render dashboard
- Verify environment variables are set correctly
- Test locally with `docker-compose` before deploying