package com.example.estimetric.utils

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.browser.customtabs.CustomTabsIntent
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume

class OAuthManager(private val context: Context) {

    // OAuth endpoints (these would be actual endpoints in production)
    companion object {
        private const val GEMINI_AUTH_URL = "https://accounts.google.com/oauth/authorize"
        private const val CLAUDE_AUTH_URL = "https://api.anthropic.com/oauth/authorize"
        private const val KILO_AUTH_URL = "https://kilo.ai/oauth/authorize"
        private const val ANTIGRAVITY_AUTH_URL = "https://antigravity.io/oauth/authorize"
        
        private const val REDIRECT_URI = "estimetric://oauth_callback"
        private const val CLIENT_ID = "your_client_id" // This would be your actual client ID
    }

    private val sharedPreferences = context.getSharedPreferences("oauth_tokens", Context.MODE_PRIVATE)

    suspend fun initiateGeminiOAuth(callback: (Boolean) -> Unit) {
        if (isGeminiConnected()) {
            // Disconnect
            sharedPreferences.edit().remove("gemini_token").apply()
            callback(true)
            return
        }

        val authUrl = buildAuthUrl(GEMINI_AUTH_URL, "gemini")
        openOAuthFlow(authUrl) { success, token ->
            if (success && token != null) {
                sharedPreferences.edit().putString("gemini_token", token).apply()
            }
            callback(success)
        }
    }

    suspend fun initiateClaudeOAuth(callback: (Boolean) -> Unit) {
        if (isClaudeConnected()) {
            // Disconnect
            sharedPreferences.edit().remove("claude_token").apply()
            callback(true)
            return
        }

        val authUrl = buildAuthUrl(CLAUDE_AUTH_URL, "claude")
        openOAuthFlow(authUrl) { success, token ->
            if (success && token != null) {
                sharedPreferences.edit().putString("claude_token", token).apply()
            }
            callback(success)
        }
    }

    suspend fun initiateKiloOAuth(callback: (Boolean) -> Unit) {
        if (isKiloConnected()) {
            // Disconnect
            sharedPreferences.edit().remove("kilo_token").apply()
            callback(true)
            return
        }

        val authUrl = buildAuthUrl(KILO_AUTH_URL, "kilo")
        openOAuthFlow(authUrl) { success, token ->
            if (success && token != null) {
                sharedPreferences.edit().putString("kilo_token", token).apply()
            }
            callback(success)
        }
    }

    suspend fun initiateAntigravityOAuth(callback: (Boolean) -> Unit) {
        if (isAntigravityConnected()) {
            // Disconnect
            sharedPreferences.edit().remove("antigravity_token").apply()
            callback(true)
            return
        }

        val authUrl = buildAuthUrl(ANTIGRAVITY_AUTH_URL, "antigravity")
        openOAuthFlow(authUrl) { success, token ->
            if (success && token != null) {
                sharedPreferences.edit().putString("antigravity_token", token).apply()
            }
            callback(success)
        }
    }

    private fun buildAuthUrl(baseUrl: String, provider: String): String {
        return Uri.parse(baseUrl)
            .buildUpon()
            .appendQueryParameter("client_id", CLIENT_ID)
            .appendQueryParameter("redirect_uri", REDIRECT_URI)
            .appendQueryParameter("response_type", "code")
            .appendQueryParameter("scope", getScopeForProvider(provider))
            .appendQueryParameter("state", generateState())
            .build()
            .toString()
    }

    private fun getScopeForProvider(provider: String): String {
        return when (provider) {
            "gemini" -> "https://www.googleapis.com/auth/generative-language"
            "claude" -> "api:read api:write"
            "kilo" -> "read write"
            "antigravity" -> "api_access"
            else -> "read"
        }
    }

    private fun generateState(): String {
        return "state_${System.currentTimeMillis()}_${(1000..9999).random()}"
    }

    private suspend fun openOAuthFlow(authUrl: String, callback: (Boolean, String?) -> Unit) {
        return suspendCancellableCoroutine { continuation ->
            val customTabsIntent = CustomTabsIntent.Builder()
                .setShowTitle(true)
                .build()

            try {
                customTabsIntent.launchUrl(context, Uri.parse(authUrl))
                
                // In a real implementation, you would set up a deep link handler
                // to catch the redirect and extract the authorization code
                
                // For demo purposes, we'll simulate success after a delay
                continuation.resume(Unit)
                
                // Simulate OAuth flow completion
                callback(true, "mock_token_${System.currentTimeMillis()}")
                
            } catch (e: Exception) {
                callback(false, null)
                continuation.resume(Unit)
            }
        }
    }

    fun isGeminiConnected(): Boolean {
        return sharedPreferences.contains("gemini_token") && 
               sharedPreferences.getString("gemini_token", "")?.isNotEmpty() == true
    }

    fun isClaudeConnected(): Boolean {
        return sharedPreferences.contains("claude_token") && 
               sharedPreferences.getString("claude_token", "")?.isNotEmpty() == true
    }

    fun isKiloConnected(): Boolean {
        return sharedPreferences.contains("kilo_token") && 
               sharedPreferences.getString("kilo_token", "")?.isNotEmpty() == true
    }

    fun isAntigravityConnected(): Boolean {
        return sharedPreferences.contains("antigravity_token") && 
               sharedPreferences.getString("antigravity_token", "")?.isNotEmpty() == true
    }

    fun getGeminiToken(): String? {
        return sharedPreferences.getString("gemini_token", null)
    }

    fun getClaudeToken(): String? {
        return sharedPreferences.getString("claude_token", null)
    }

    fun getKiloToken(): String? {
        return sharedPreferences.getString("kilo_token", null)
    }

    fun getAntigravityToken(): String? {
        return sharedPreferences.getString("antigravity_token", null)
    }

    fun disconnectAll() {
        sharedPreferences.edit()
            .remove("gemini_token")
            .remove("claude_token")
            .remove("kilo_token")
            .remove("antigravity_token")
            .apply()
    }
}
