# EstiMetric Beta Release Guide

## Beta Release v1.0.0-beta.1

### Release Information
- **App Name**: EstiMetric
- **Version**: 1.0.0-beta.1
- **Version Code**: 1
- **Release Type**: Beta
- **Build Status**: Ready for distribution
- **Signing**: Signed with release keystore
- **Minification**: Enabled (ProGuard)

---

## Building the APK

### Option 1: Automated Build Script

**Windows:**
```powershell
.\build-release-apk.bat
```

**Linux/macOS:**
```bash
chmod +x build-release-apk.sh
./build-release-apk.sh
```

### Option 2: Manual Gradle Build

**Prerequisites:**
- JDK 17 or higher installed
- Android SDK configured
- ANDROID_HOME environment variable set

**Build command:**
```bash
# Set environment variables
export KEYSTORE_PATH="app/release.keystore"
export KEYSTORE_PASSWORD="estimetric123"
export KEY_ALIAS="estimetric"
export KEY_PASSWORD="estimetric123"

# Build release APK
./gradlew assembleRelease --stacktrace
```

**Windows PowerShell:**
```powershell
$env:KEYSTORE_PATH = "app/release.keystore"
$env:KEYSTORE_PASSWORD = "estimetric123"
$env:KEY_ALIAS = "estimetric"
$env:KEY_PASSWORD = "estimetric123"

.\gradlew.bat assembleRelease --stacktrace
```

### Option 3: GitHub Actions CI/CD

Push to `main` or `develop` branch to trigger automated build:

```bash
git push origin main
```

Monitor at: https://github.com/crazyrob425/EstiMetric/actions

---

## APK Output Location

After successful build, APKs are available at:

```
app/build/outputs/apk/
├── debug/
│   ├── app-debug.apk              # Debug APK (for testing)
│   └── app-debug.aab              # Debug App Bundle
└── release/
    ├── app-release.apk            # Release APK (for beta distribution)
    └── app-release.aab            # Release App Bundle
```

---

## Beta Distribution Methods

### 1. Google Play Console (Recommended)

**Steps:**
1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app
3. Navigate to **Releases** → **Testing** → **Internal Testing**
4. Create new release
5. Upload `app/build/outputs/apk/release/app-release.apk`
6. Set version name to `1.0.0-beta.1`
7. Add release notes
8. Start rollout

**Beta Testers:** Share the internal testing link with testers

### 2. Firebase App Distribution

**Steps:**
1. Set up Firebase project
2. Run: `firebase appdistribution:distribute app/build/outputs/apk/release/app-release.apk --app <APP_ID>`
3. Add tester emails
4. Testers receive invite via email

### 3. Direct APK Distribution

**For development/testing only:**
```bash
adb install app/build/outputs/apk/release/app-release.apk
```

**File transfer:**
- Share APK via file transfer
- Testers download and install manually
- Enable "Unknown Sources" in Android settings

### 4. GitHub Releases

**Steps:**
1. Create GitHub release: https://github.com/crazyrob425/EstiMetric/releases/new
2. Tag: `v1.0.0-beta.1`
3. Upload `app-release.apk` as artifact
4. Share download link with testers

---

## Beta Testing Checklist

### Pre-Release
- [ ] All tests pass: `./gradlew test`
- [ ] Lint checks pass: `./gradlew lint`
- [ ] APK builds without warnings
- [ ] APK is signed
- [ ] APK is minified/obfuscated
- [ ] Version numbers updated
- [ ] Release notes prepared

### Testing
- [ ] Install on multiple Android versions (API 24+)
- [ ] Test all core features
- [ ] Verify permissions work correctly
- [ ] Check network requests
- [ ] Test offline functionality
- [ ] Verify UI/UX on different screen sizes
- [ ] Check battery and memory usage
- [ ] Monitor crash reports

### Distribution
- [ ] Upload to beta testing platform
- [ ] Notify testers
- [ ] Collect feedback
- [ ] Monitor crash analytics
- [ ] Prepare bug fixes

---

## Build Configuration

### Version Information
```gradle
defaultConfig {
    applicationId = "com.example.estimetric"
    minSdk = 24
    targetSdk = 34
    versionCode = 1
    versionName = "1.0.0-beta.1"
}
```

### Signing Configuration
```gradle
signingConfigs {
    create("release") {
        storeFile = file("app/release.keystore")
        storePassword = System.getenv("KEYSTORE_PASSWORD") ?: "estimetric123"
        keyAlias = System.getenv("KEY_ALIAS") ?: "estimetric"
        keyPassword = System.getenv("KEY_PASSWORD") ?: "estimetric123"
    }
}
```

### Release Build Type
```gradle
buildTypes {
    release {
        isMinifyEnabled = true  // ProGuard enabled
        signingConfig = signingConfigs.getByName("release")
        proguardFiles(
            getDefaultProguardFile("proguard-android-optimize.txt"),
            "proguard-rules.pro"
        )
    }
}
```

---

## APK Specifications

### File Information
- **Name**: `app-release.apk`
- **Type**: Android Application Package
- **Architecture**: ARM64-v8a, ARMv7, x86_64

### Signing Certificate
- **Alias**: `estimetric`
- **Algorithm**: RSA, 2048-bit
- **Validity**: 10,000 days
- **Keystore**: `app/release.keystore`

### Build Optimization
- **Minification**: Enabled (ProGuard)
- **Resource Shrinking**: Enabled
- **Code Optimization**: Enabled
- **Debug Symbols**: Included (for crash reporting)

---

## Troubleshooting

### Build Failures

**Problem**: `JAVA_HOME is not set`
```bash
# Solution: Set Java path
export JAVA_HOME=/path/to/jdk17
```

**Problem**: `Android SDK not found`
```bash
# Solution: Set Android SDK path
export ANDROID_HOME=$HOME/Android/Sdk
```

**Problem**: `Keystore not found`
```bash
# Solution: Verify keystore exists
ls -la app/release.keystore
```

**Problem**: `Signing failed`
```bash
# Solution: Verify credentials match
# Check KEYSTORE_PASSWORD, KEY_ALIAS, KEY_PASSWORD
```

### Installation Issues

**Problem**: `Installation failed: INSTALL_FAILED_NO_MATCHING_ABIS`
- Device architecture not supported
- Try different device or emulator

**Problem**: `INSTALL_FAILED_INSUFFICIENT_STORAGE`
- Device storage full
- Clear cache: `adb shell pm trim-caches 100M`

---

## Next Steps

1. **Build the APK**: Run `./build-release-apk.bat` or `./build-release-apk.sh`
2. **Verify Output**: Check `app/build/outputs/apk/release/`
3. **Test Installation**: Install on test device
4. **Upload to Beta Platform**: Google Play Console or Firebase
5. **Notify Testers**: Share testing link
6. **Collect Feedback**: Monitor crashes and feedback
7. **Iterate**: Fix bugs and prepare next release

---

## Resources

- [Android Developer Guide](https://developer.android.com/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Firebase App Distribution](https://firebase.google.com/docs/app-distribution)
- [EstiMetric GitHub](https://github.com/crazyrob425/EstiMetric)

---

## Release Checklist

```
[ ] Code complete and committed
[ ] All tests passing
[ ] Lint checks passing
[ ] Version updated to 1.0.0-beta.1
[ ] Release notes written
[ ] APK built successfully
[ ] APK signed and minified
[ ] APK tested on device
[ ] Beta testers identified
[ ] Distribution platform chosen
[ ] APK uploaded and distributed
[ ] Testers notified
[ ] Feedback collection started
[ ] Crash monitoring enabled
```

---

**Last Updated**: 2026-04-17  
**Maintained By**: EstiMetric Team
