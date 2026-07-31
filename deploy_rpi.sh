#!/bin/bash

# Simple deploy script for Raspberry Pi
echo "🚀 Deploying Fitness Quest to Raspberry Pi..."

# 1. Pull latest changes (assuming git is used)
# git pull origin main

# 2. Build and restart containers
docker-compose up -d --build

echo "✅ Deployment complete. Server running on port 8443."
