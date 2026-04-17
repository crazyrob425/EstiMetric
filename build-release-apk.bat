@echo off
REM EstiMetric Release APK Build Script (Windows)
REM Requires: JDK 17+, Android SDK, and Gradle

setlocal enabledelayedexpansion

echo =========================================
echo EstiMetric Beta Release APK Builder
echo =========================================
echo.

REM Check Java
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo. Java is not installed or not in PATH
    echo Please install Java 17 from: https://www.oracle.com/java/technologies/downloads/
    exit /b 1
)
echo. Java found

REM Check Gradle
gradlew --version >nul 2>&1
if %errorlevel% neq 0 (
    echo. Gradle not found
    exit /b 1
)
echo. Gradle found
echo.

echo Build Configuration:
echo   Version Name: 1.0.0-beta.1
echo   Version Code: 1
echo   Build Type: Release
echo   Keystore: app\release.keystore
echo.

REM Set environment variables
set KEYSTORE_PATH=app\release.keystore
set KEYSTORE_PASSWORD=estimetric123
set KEY_ALIAS=estimetric
set KEY_PASSWORD=estimetric123

REM Clean
echo Cleaning previous builds...
call gradlew.bat clean
if %errorlevel% neq 0 exit /b 1

REM Build debug
echo.
echo Building debug APK...
call gradlew.bat assembleDebug
if %errorlevel% neq 0 exit /b 1

REM Build release
echo.
echo Building release APK...
call gradlew.bat assembleRelease --stacktrace
if %errorlevel% neq 0 exit /b 1

REM Check output
echo.
echo =========================================
echo Build Complete!
echo =========================================
echo.

if exist "app\build\outputs\apk\release\app-release.apk" (
    for %%F in ("app\build\outputs\apk\release\app-release.apk") do set SIZE=%%~zF
    echo. Release APK: app\build\outputs\apk\release\app-release.apk
    echo   Size: !SIZE! bytes
    echo   Status: Ready for beta distribution
    echo   Signed: Yes
    echo   Minified: Yes
) else (
    echo. Release APK not found
    exit /b 1
)

pause
