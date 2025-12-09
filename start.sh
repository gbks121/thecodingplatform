#!/bin/sh

# Start nginx in background
nginx -c /etc/nginx/conf.d/default.conf &

# Wait a moment for nginx to start
sleep 2

# Start backend server
cd /app/backend
NODE_ENV=production PORT=3001 node index.js