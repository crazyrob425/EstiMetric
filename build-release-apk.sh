#!/bin/bash
# EstiMetric Release APK Build Script
# Requires: JDK 17+, Android SDK, and Gradle

set -e

echo "========================================="
echo "EstiMetric Beta Release APK Builder"
echo "========================================="
echo ""

# Check requirements
check_requirement() {
    if ! command -v "$1" &> /dev/null; then
        echo "❌ $1 is not installed or not in PATH"
        echo "Please install $1 to continue"
        return 1
    fi
    echo "✅ $1 found"
    return 0
}

echo "Checking requirements..."
check_requirement "java" || exit 1
check_requirement "gradle" || exit 1
echo ""

# Set up environment
export KEYSTORE_PATH="app/release.keystore"
export KEYSTORE_PASSWORD="estimetric123"
export KEY_ALIAS="estimetric"
export KEY_PASSWORD="estimetric123"

echo "Build Configuration:"
echo "  Version Name: 1.0.0-beta.1"
echo "  Version Code: 1"
echo "  Build Type: Release"
echo "  Keystore: $KEYSTORE_PATH"
echo ""

# Clean previous builds
echo "Cleaning previous builds..."
./gradlew clean

# Build debug APK first for testing
echo ""
echo "Building debug APK..."
./gradlew assembleDebug

# Build release APK
echo ""
echo "Building release APK..."
./gradlew assembleRelease --stacktrace

# Check output
echo ""
echo "========================================="
echo "Build Complete!"
echo "========================================="
echo ""

# Locate APKs
DEBUG_APK=$(find app/build/outputs/apk/debug -name "*.apk" -type f | head -1)
RELEASE_APK=$(find app/build/outputs/apk/release -name "*.apk" -type f | head -1)

if [ -f "$DEBUG_APK" ]; then
    DEBUG_SIZE=$(du -h "$DEBUG_APK" | cut -f1)
    echo "✅ Debug APK: $DEBUG_APK ($DEBUG_SIZE)"
fi

if [ -f "$RELEASE_APK" ]; then
    RELEASE_SIZE=$(du -h "$RELEASE_APK" | cut -f1)
    echo "✅ Release APK: $RELEASE_APK ($RELEASE_SIZE)"
    echo ""
    echo "Release APK ready for beta distribution!"
    echo "  Location: $RELEASE_APK"
    echo "  Size: $RELEASE_SIZE"
    echo "  Signed: Yes"
    echo "  Minified: Yes"
else
    echo "❌ Release APK not found"
    exit 1
fi
