#!/bin/bash

# GitHub Secrets Setup Script for EstiMetric
# This script adds the required keystore secrets to your GitHub repository

echo "=== EstiMetric GitHub Secrets Setup ==="
echo ""

# Get repository info
REPO_OWNER=$(git config --get remote.origin.url | sed -E 's/.*[:/]([^/]+)\/.*/\1/')
REPO_NAME=$(git config --get remote.origin.url | sed -E 's/.*\/([^/]+)(\.git)?$/\1/')

echo "Repository: $REPO_OWNER/$REPO_NAME"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "Install it from: https://cli.github.com"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI"
    echo "Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI authenticated"
echo ""
echo "Adding secrets..."
echo ""

# Add secrets
gh secret set ANDROID_KEYSTORE_BASE64 --body "8nyc7easYdnRrnL+R19winXT+q15/RyrLutLBPWdIKmoZD1cB3ffogMZyfuzjaFpVnh2TrJnlU8suuAPOP/NJ/PutPZuIdLXa0x6BWP58B86O9Qq95SODhNQkbe7FwIybWo83rUAny8kr2xxZqa9qhgoLURgQqeXfaVJiylVDTZ/RX5Uc+rbBjFAESIaCZowEGjPwfGCAcJZj5KQxzODWGJdJeOgyBTpC8B7hkGWgcbsG+/MUT/KRuK5zjW/dLaA+Ay8w+G+mLGJhCZIHRI0k1dDyz6emVIIOW8jFjf8uKRTW+Rem7Cj54gr5cXc6IXV2sSMHt0V0PQKh01lWtZK2A==" -R "$REPO_OWNER/$REPO_NAME"
gh secret set ANDROID_KEYSTORE_PASSWORD --body "estimetric123" -R "$REPO_OWNER/$REPO_NAME"
gh secret set ANDROID_KEY_ALIAS --body "estimetric" -R "$REPO_OWNER/$REPO_NAME"
gh secret set ANDROID_KEY_PASSWORD --body "estimetric123" -R "$REPO_OWNER/$REPO_NAME"

echo ""
echo "✅ All secrets added successfully!"
echo ""
echo "Verifying secrets..."
gh secret list -R "$REPO_OWNER/$REPO_NAME"
