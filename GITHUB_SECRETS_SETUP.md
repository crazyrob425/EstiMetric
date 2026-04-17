# GitHub Secrets Setup - EstiMetric

## Quick Setup (Web UI)

Go to your GitHub repository settings and add these 4 secrets:

### GitHub URL
https://github.com/crazyrob425/EstiMetric/settings/secrets/actions

### Step-by-Step

1. Go to the URL above
2. Click **"New repository secret"**
3. Add each secret below (copy-paste the exact values)

---

## Secrets to Add

### 1. ANDROID_KEYSTORE_BASE64
**Name:** `ANDROID_KEYSTORE_BASE64`

**Value:**
```
8nyc7easYdnRrnL+R19winXT+q15/RyrLutLBPWdIKmoZD1cB3ffogMZyfuzjaFpVnh2TrJnlU8suuAPOP/NJ/PutPZuIdLXa0x6BWP58B86O9Qq95SODhNQkbe7FwIybWo83rUAny8kr2xxZqa9qhgoLURgQqeXfaVJiylVDTZ/RX5Uc+rbBjFAESIaCZowEGjPwfGCAcJZj5KQxzODWGJdJeOgyBTpC8B7hkGWgcbsG+/MUT/KRuK5zjW/dLaA+Ay8w+G+mLGJhCZIHRI0k1dDyz6emVIIOW8jFjf8uKRTW+Rem7Cj54gr5cXc6IXV2sSMHt0V0PQKh01lWtZK2A==
```

### 2. ANDROID_KEYSTORE_PASSWORD
**Name:** `ANDROID_KEYSTORE_PASSWORD`

**Value:**
```
estimetric123
```

### 3. ANDROID_KEY_ALIAS
**Name:** `ANDROID_KEY_ALIAS`

**Value:**
```
estimetric
```

### 4. ANDROID_KEY_PASSWORD
**Name:** `ANDROID_KEY_PASSWORD`

**Value:**
```
estimetric123
```

---

## After Adding Secrets

1. Your GitHub Actions workflow will automatically decode the keystore
2. Release APKs will be signed and built on every push to `main` or `develop`
3. Check the **Actions** tab to see workflow runs

---

## If You Have GitHub CLI Installed

Run in terminal (from project root):

```bash
gh secret set ANDROID_KEYSTORE_BASE64 --body "8nyc7easYdnRrnL+R19winXT+q15/RyrLutLBPWdIKmoZD1cB3ffogMZyfuzjaFpVnh2TrJnlU8suuAPOP/NJ/PutPZuIdLXa0x6BWP58B86O9Qq95SODhNQkbe7FwIybWo83rUAny8kr2xxZqa9qhgoLURgQqeXfaVJiylVDTZ/RX5Uc+rbBjFAESIaCZowEGjPwfGCAcJZj5KQxzODWGJdJeOgyBTpC8B7hkGWgcbsG+/MUT/KRuK5zjW/dLaA+Ay8w+G+mLGJhCZIHRI0k1dDyz6emVIIOW8jFjf8uKRTW+Rem7Cj54gr5cXc6IXV2sSMHt0V0PQKh01lWtZK2A=="
gh secret set ANDROID_KEYSTORE_PASSWORD --body "estimetric123"
gh secret set ANDROID_KEY_ALIAS --body "estimetric"
gh secret set ANDROID_KEY_PASSWORD --body "estimetric123"
gh secret list
```

Or with your own token:

```bash
$env:GH_TOKEN = "your_github_token"
# Then run the commands above
```
