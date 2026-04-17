@echo off
REM GitHub Secrets Setup Script for EstiMetric (Windows)
REM This script adds the required keystore secrets to your GitHub repository

echo === EstiMetric GitHub Secrets Setup ===
echo.

REM Check if gh CLI is installed
where gh >nul 2>nul
if %errorlevel% neq 0 (
    echo. GitHub CLI (gh) is not installed.
    echo Install it from: https://cli.github.com
    exit /b 1
)

REM Check if authenticated
gh auth status >nul 2>nul
if %errorlevel% neq 0 (
    echo. Not authenticated with GitHub CLI
    echo Run: gh auth login
    exit /b 1
)

echo. GitHub CLI authenticated
echo.
echo Adding secrets...
echo.

REM Add secrets
gh secret set ANDROID_KEYSTORE_BASE64 --body "8nyc7easYdnRrnL+R19winXT+q15/RyrLutLBPWdIKmoZD1cB3ffogMZyfuzjaFpVnh2TrJnlU8suuAPOP/NJ/PutPZuIdLXa0x6BWP58B86O9Qq95SODhNQkbe7FwIybWo83rUAny8kr2xxZqa9qhgoLURgQqeXfaVJiylVDTZ/RX5Uc+rbBjFAESIaCZowEGjPwfGCAcJZj5KQxzODWGJdJeOgyBTpC8B7hkGWgcbsG+/MUT/KRuK5zjW/dLaA+Ay8w+G+mLGJhCZIHRI0k1dDyz6emVIIOW8jFjf8uKRTW+Rem7Cj54gr5cXc6IXV2sSMHt0V0PQKh01lWtZK2A=="
gh secret set ANDROID_KEYSTORE_PASSWORD --body "estimetric123"
gh secret set ANDROID_KEY_ALIAS --body "estimetric"
gh secret set ANDROID_KEY_PASSWORD --body "estimetric123"

echo.
echo. All secrets added successfully!
echo.
echo Verifying secrets...
gh secret list
