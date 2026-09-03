#!/bin/bash

PROJECT_ROOT=$(pwd)
CLIENT_DIR="$PROJECT_ROOT/client"
ANDROID_DIR="$CLIENT_DIR/android"
APP_JSON="$CLIENT_DIR/app.json"

echo "🤖 Starting Challenge Fit Android Build..."

if [ ! -d "$CLIENT_DIR" ]; then
    echo "❌ Error: Could not find 'client' directory. Please run this script from the project root."
    exit 1
fi

if [ -f "$APP_JSON" ]; then
    VERSION=$(grep '"version":' "$APP_JSON" | head -1 | awk -F '"' '{print $4}')
    echo "📦 Detected version: $VERSION"
else
    VERSION="unknown"
    echo "⚠️ Warning: Could not find app.json to detect version."
fi

if [ ! -d "$CLIENT_DIR/node_modules" ]; then
    echo "📦 node_modules not found. Running npm install..."
    cd "$CLIENT_DIR" && npm install
    cd "$PROJECT_ROOT"
fi

echo "🔍 Checking assets..."
for f in "$CLIENT_DIR/assets/icon.png" "$CLIENT_DIR/assets/splash.png" "$CLIENT_DIR/assets/adaptive-icon.png"; do
    if [ ! -s "$f" ]; then
        echo "⚠️ Warning: $f is empty or missing."
        exit 1
    fi
done

echo "🏗️ Building App Bundle (Release)..."
cd "$ANDROID_DIR"
./gradlew bundleRelease

if [ $? -eq 0 ]; then
    SOURCE_AAB="$ANDROID_DIR/app/build/outputs/bundle/release/app-release.aab"
    DEST_DIR="$PROJECT_ROOT/builds"
    DEST_AAB="$DEST_DIR/$VERSION.aab"

    mkdir -p "$DEST_DIR"
    cp "$SOURCE_AAB" "$DEST_AAB"

    echo "✅ Build Successful!"
    echo "📍 Bundle Location: $DEST_AAB"
else
    echo "❌ Error: Gradle build failed."
    exit 1
fi