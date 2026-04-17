# APK Build Instructions - EstiMetric

## Quick Start

Your project is ready for APK compilation. Choose one of the methods below:

---

## Method 1: Local Build (Recommended)

### Prerequisites
- **JDK 17+** - Download from [oracle.com](https://www.oracle.com/java/technologies/downloads/)
- **Android SDK** - Installed via Android Studio
- **Gradle** - Included (uses `./gradlew`)

### Steps

#### Windows (PowerShell)
```powershell
# Set environment variables
$env:KEYSTORE_PATH = "app/release.keystore"
$env:KEYSTORE_PASSWORD = "estimetric123"
$env:KEY_ALIAS = "estimetric"
$env:KEY_PASSWORD = "estimetric123"

# Build
.\build-release-apk.bat
```

#### Linux/macOS (Bash)
```bash
# Set environment variables
export KEYSTORE_PATH="app/release.keystore"
export KEYSTORE_PASSWORD="estimetric123"
export KEY_ALIAS="estimetric"
export KEY_PASSWORD="estimetric123"

# Build
chmod +x build-release-apk.sh
./build-release-apk.sh
```

### Output
```
✅ Debug APK: app/build/outputs/apk/debug/app-debug.apk
✅ Release APK: app/build/outputs/apk/release/app-release.apk
```

---

## Method 2: GitHub Actions (Automated - No Local Setup)

### Setup
1. Secrets already configured ✅
2. Workflow already enabled ✅

### Trigger Build
```bash
git push origin main
# or
git push origin develop
```

### Monitor Build
- Go to: https://github.com/crazyrob425/EstiMetric/actions
- Watch workflow: **Android CI with Docker**
- Download APK from artifacts when complete

### Time
- Build time: ~10-15 minutes
- APK available in: **Actions** → **Latest Run** → **Artifacts**

---

## Method 3: Docker Build (If Java Not Installed)

### Prerequisites
- Docker installed and running

### Build Command
```bash
docker build -f Dockerfile.build -t estimetric-builder:latest .
docker run --rm -v $(pwd)/app/build/outputs:/app/app/build/outputs estimetric-builder:latest
```

### Output
APK will be in: `./app/build/outputs/apk/release/app-release.apk`

---

## Build Files Reference

| File | Purpose |
|------|---------|
| `build.gradle.kts` | Root-level build config |
| `app/build.gradle.kts` | App module config (signing, dependencies) |
| `Dockerfile.build` | Docker build environment |
| `build-release-apk.bat` | Windows build script |
| `build-release-apk.sh` | Linux/macOS build script |
| `app/release.keystore` | Signing keystore (protected) |

---

## Expected Output

### Successful Build
```
BUILD SUCCESSFUL in 2m45s
24 actionable tasks: 24 executed

✅ Release APK: app/build/outputs/apk/release/app-release.apk
   Size: ~8-12 MB
   Signed: Yes ✓
   Minified: Yes ✓
```

### APK Properties
- **Application ID**: `com.example.estimetric`
- **Min SDK**: API 24 (Android 7.0)
- **Target SDK**: API 34 (Android 14)
- **Architecture**: arm64-v8a, armeabi-v7a, x86_64
- **Signature Algorithm**: SHA256withRSA

---

## Installation & Testing

### Install on Device
```bash
adb install app/build/outputs/apk/release/app-release.apk
```

### Install on Emulator
```bash
# Start emulator first
emulator -avd <avd_name> &

# Then install
adb install app/build/outputs/apk/release/app-release.apk
```

### Verify Installation
```bash
adb shell pm list packages | grep estimetric
```

---

## Beta Distribution

Once APK is built, distribute via:

1. **Google Play Console** (Internal Testing)
   - Upload to: https://play.google.com/console/u/0/developers

2. **Firebase App Distribution**
   ```bash
   firebase appdistribution:distribute app/build/outputs/apk/release/app-release.apk \
     --app <APP_ID> \
     --release-notes "EstiMetric v1.0.0-beta.1"
   ```

3. **GitHub Releases**
   - Create release at: https://github.com/crazyrob425/EstiMetric/releases
   - Upload APK file

4. **Direct APK Sharing**
   - Share file via email, file transfer, or cloud storage

---

## Troubleshooting

### No Java Found
```bash
# Windows: Install from
# https://www.oracle.com/java/technologies/downloads/

# macOS (with Homebrew):
brew install openjdk@17

# Linux (Ubuntu/Debian):
sudo apt-get install openjdk-17-jdk
```

### Build Timeout
- Increase timeout: `./gradlew assembleRelease --max-workers=1`
- Use GitHub Actions (no local resources needed)

### Signing Failed
- Verify credentials: `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`
- Check keystore: `keytool -list -v -keystore app/release.keystore`

### APK Not Found
- Check `app/build/outputs/apk/release/` directory
- Verify build succeeded without errors
- Check for build warnings

---

## Next Steps

1. ✅ **Install JDK 17** (if local build)
2. ✅ **Run build script** (local) or **push to main** (GitHub Actions)
3. ✅ **Locate APK** in output directory
4. ✅ **Test on device** (optional)
5. ✅ **Distribute to beta testers** via Google Play or Firebase
6. ✅ **Collect feedback** and iterate

---

## Support

- **Build Issues**: Check Gradle logs: `build/logs/`
- **APK Issues**: Check `BuildConfig.java` for version info
- **Distribution Issues**: See `BETA_RELEASE_GUIDE.md`
- **GitHub Issues**: https://github.com/crazyrob425/EstiMetric/issues

---

**Build System Ready for Distribution** ✅
