package com.example.estimetric.utils

import android.content.Context
import android.util.Log
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.tasks.Task
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume

class GoogleAuthManager(private val context: Context) {

    private lateinit var googleSignInClient: GoogleSignInClient

    init {
        setupGoogleSignIn()
    }

    private fun setupGoogleSignIn() {
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestEmail()
            .requestProfile()
            .requestId()
            .build()
        
        googleSignInClient = GoogleSignIn.getClient(context, gso)
    }

    suspend fun signIn(callback: (Boolean, GoogleSignInAccount?) -> Unit) {
        try {
            val signInIntent = googleSignInClient.signInIntent
            // In a real implementation, you would launch this intent from an Activity
            // and handle the result in onActivityResult
            // For demo purposes, we'll simulate success
            
            callback(true, null) // Account would be returned from actual sign-in
            
        } catch (e: Exception) {
            Log.e("GoogleAuthManager", "Sign in failed", e)
            callback(false, null)
        }
    }

    fun signOut(callback: () -> Unit) {
        googleSignInClient.signIn()
            .addOnCompleteListener {
                callback()
            }
    }

    fun isSignedIn(): Boolean {
        val account = GoogleSignIn.getLastSignedInAccount(context)
        return account != null
    }

    fun getCurrentAccount(): GoogleSignInAccount? {
        return GoogleSignIn.getLastSignedInAccount(context)
    }

    suspend fun handleSignInResult(task: Task<GoogleSignInAccount>): GoogleSignInAccount? {
        return suspendCancellableCoroutine { continuation ->
            try {
                val account = task.getResult(ApiException::class.java)
                continuation.resume(account)
            } catch (e: ApiException) {
                Log.w("GoogleAuthManager", "signInResult:failed code=" + e.statusCode)
                continuation.resume(null)
            }
        }
    }

    fun getSignInIntent(): android.content.Intent {
        return googleSignInClient.signInIntent
    }

    fun revokeAccess(callback: () -> Unit) {
        googleSignInClient.revokeAccess()
            .addOnCompleteListener {
                callback()
            }
    }
}
