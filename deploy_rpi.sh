#!/bin/bash

# Configuration
REMOTE_USER="barber"
REMOTE_HOST="192.168.1.81"
REMOTE_DIR="challengefit"

echo "🚀 Deploying Fitness Quest to Raspberry Pi ($REMOTE_HOST)..."

# 1. Ensure remote directory exists
ssh $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_DIR"

# 2. Transfer .env file (assuming it exists locally in the project root or server dir)
if [ -f "server/.env" ]; then
    echo "📦 Transferring server/.env..."
    scp server/.env $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/server/.env
else
    echo "⚠️  server/.env not found! Skipping transfer."
fi

# 3. Pull latest changes (assuming git is used and set up on RPi)
# Alternatively, we could rsync the whole project, but git is cleaner if set up.
# For now, let's assume the RPi pulls from the remote origin.
# ssh $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_DIR && git pull origin main"

# 4. Build and restart containers on the RPi
ssh $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_DIR && docker-compose up -d --build"

echo "✅ Deployment complete. Server running on port 8443."
