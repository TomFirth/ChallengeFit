#!/bin/bash

# Configuration
PROJECT_ROOT=$(pwd)
CLIENT_DIR="$PROJECT_ROOT/client"
ANDROID_DIR="$CLIENT_DIR/android"
APP_JSON="$CLIENT_DIR/app.json"
BUILD_TYPE=${1:-aab} # Default to aab if no parameter provided

echo "🤖 Starting Challenge Fit Android Build ($BUILD_TYPE)..."

# 1. Check if we are in the right directory
if [ ! -d "$CLIENT_DIR" ]; then
    echo "❌ Error: Could not find 'client' directory. Please run this script from the project root."
    exit 1
fi

# 2. Extract version from app.json
if [ -f "$APP_JSON" ]; then
    VERSION=$(grep '"version":' "$APP_JSON" | head -1 | awk -F '"' '{print $4}')
    echo "📦 Detected version: $VERSION"
else
    VERSION="unknown"
    echo "⚠️  Warning: Could not find app.json to detect version."
fi

# 3. Check for node_modules
if [ ! -d "$CLIENT_DIR/node_modules" ]; then
    echo "📦 node_modules not found. Running npm install..."
    cd "$CLIENT_DIR" && npm install
    cd "$PROJECT_ROOT"
fi

# 4. Check for empty assets
echo "🔍 Checking assets..."
for f in "$CLIENT_DIR/assets/icon.png" "$CLIENT_DIR/assets/splash.png" "$CLIENT_DIR/assets/adaptive-icon.png"; do
    if [ ! -s "$f" ]; then
        echo "⚠️  Warning: $f is empty or missing. Prebuild will likely fail."
        echo "Please replace it with a valid PNG before continuing."
        exit 1
    fi
done

# 5. Generate Android folder (Prebuild)
echo "⚙️  Generating Android native project..."
cd "$CLIENT_DIR"
npx expo prebuild --platform android --no-install

if [ $? -ne 0 ]; then
    echo "❌ Error: Expo prebuild failed."
    exit 1
fi

# 6. Build the package
cd "$ANDROID_DIR"
if [ "$BUILD_TYPE" == "apk" ]; then
    echo "🏗️  Building APK (Release)..."
    ./gradlew assembleRelease

    if [ $? -eq 0 ]; then
        SOURCE_FILE="$ANDROID_DIR/app/build/outputs/apk/release/app-release.apk"
        DEST_DIR="$PROJECT_ROOT/builds"
        DEST_FILE="$DEST_DIR/$VERSION.apk"

        mkdir -p "$DEST_DIR"
        cp "$SOURCE_FILE" "$DEST_FILE"
        echo "✅ APK Build Successful!"
        echo "📍 APK Location: $DEST_FILE"
    else
        echo "❌ Error: Gradle build failed."
        exit 1
    fi
else
    echo "🏗️  Building App Bundle (Release)..."
    ./gradlew bundleRelease

    if [ $? -eq 0 ]; then
        SOURCE_FILE="$ANDROID_DIR/app/build/outputs/bundle/release/app-release.aab"
        DEST_DIR="$PROJECT_ROOT/builds"
        DEST_FILE="$DEST_DIR/$VERSION.aab"

        mkdir -p "$DEST_DIR"
        cp "$SOURCE_FILE" "$DEST_FILE"
        echo "✅ AAB Build Successful!"
        echo "📍 Bundle Location: $DEST_FILE"
    else
        echo "❌ Error: Gradle build failed."
        exit 1
    fi
fi
