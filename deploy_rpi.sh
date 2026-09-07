#!/bin/bash

# Configuration
REMOTE_USER="barber"
REMOTE_HOST="192.168.1.81"
REMOTE_DIR="challengefit"

echo "🚀 Deploying Challenge Fit to Raspberry Pi ($REMOTE_HOST)..."

# 1. Ensure remote directories exist
ssh $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_DIR/server"

# 2. Transfer essential configuration files
echo "📦 Transferring docker-compose.yml..."
scp docker-compose.yml $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/docker-compose.yml

if [ -f "server/.env" ]; then
    echo "📦 Transferring server/.env..."
    scp server/.env $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/server/.env
else
    echo "⚠️  server/.env not found! Skipping transfer."
fi

# 3. Transfer the source code (Assuming no git on RPi, we transfer the server folder)
echo "📦 Transferring server source code..."
rsync -avz --exclude 'node_modules' --exclude 'data' --exclude 'prisma/migrations' ./server/ $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/server/

# 4. Build and restart containers on the RPi
ssh $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_DIR && docker compose up -d --build"

echo "✅ Deployment complete. Server running on port 3001."
