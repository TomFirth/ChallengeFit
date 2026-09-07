#!/bin/bash

# Configuration
REMOTE_USER="barber"
REMOTE_HOST="192.168.1.81"
REMOTE_DIR="challengefit"

echo "🚀 Deploying Challenge Fit to Raspberry Pi ($REMOTE_HOST)..."

# 1. Transfer everything in a single rsync command
# This handles directory creation, docker-compose.yml, .env, and source code.
# It only prompts for the password ONCE.
echo "📦 Transferring configuration and source code..."
rsync -avz --mkpath \
    --exclude 'node_modules' \
    --exclude 'client' \
    --exclude '.git' \
    --exclude '.idea' \
    --exclude 'data' \
    --exclude 'server/prisma/migrations' \
    ./ $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/

# 2. Build and restart containers on the RPi (prompts for password a second time)
echo "🏗️  Starting containers on RPi..."
ssh $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_DIR && docker compose up -d --build"

echo "✅ Deployment complete. Server running on port 3001."

echo "------------------------------------------------------------"
echo "💡 TIP: To avoid passwords entirely, run this once:"
echo "ssh-copy-id $REMOTE_USER@$REMOTE_HOST"
echo "------------------------------------------------------------"
