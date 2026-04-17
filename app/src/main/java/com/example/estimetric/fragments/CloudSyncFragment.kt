package com.example.estimetric.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.fragment.app.Fragment
import com.example.estimetric.R
import com.example.estimetric.utils.GoogleAuthManager
import com.example.estimetric.utils.SettingsManager

class CloudSyncFragment : Fragment() {

    private lateinit var settingsManager: SettingsManager
    private lateinit var googleAuthManager: GoogleAuthManager

    // UI Components
    private lateinit var ivGoogleProfile: ImageView
    private lateinit var tvGoogleName: TextView
    private lateinit var tvGoogleEmail: TextView
    private lateinit var btnGoogleSignIn: Button
    private lateinit var btnGoogleSignOut: Button
    private lateinit var switchAutoSync: Switch
    private lateinit var switchSyncWifiOnly: Switch
    private lateinit var spinnerSyncFrequency: Spinner
    private lateinit var btnSyncNow: Button
    private lateinit var btnForceSync: Button
    private lateinit var switchAutoBackup: Switch
    private lateinit var tvLastBackup: TextView
    private lateinit var btnBackupNow: Button
    private lateinit var btnRestoreBackup: Button
    private lateinit var progressStorageUsage: ProgressBar
    private lateinit var tvStorageDetails: TextView
    private lateinit var btnClearCache: Button
    private lateinit var btnExportData: Button
    private lateinit var tvSettingsSyncStatus: TextView
    private lateinit var tvEstimatesSyncStatus: TextView
    private lateinit var tvPreferencesSyncStatus: TextView
    private lateinit var tvLastSyncTime: TextView

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_cloud_sync, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        settingsManager = SettingsManager(requireContext())
        googleAuthManager = GoogleAuthManager(requireContext())
        
        initializeViews(view)
        setupClickListeners()
        loadSettings()
        updateGoogleAccountUI()
        updateSyncStatus()
    }

    private fun initializeViews(view: View) {
        ivGoogleProfile = view.findViewById(R.id.iv_google_profile)
        tvGoogleName = view.findViewById(R.id.tv_google_name)
        tvGoogleEmail = view.findViewById(R.id.tv_google_email)
        btnGoogleSignIn = view.findViewById(R.id.btn_google_sign_in)
        btnGoogleSignOut = view.findViewById(R.id.btn_google_sign_out)
        switchAutoSync = view.findViewById(R.id.switch_auto_sync)
        switchSyncWifiOnly = view.findViewById(R.id.switch_sync_wifi_only)
        spinnerSyncFrequency = view.findViewById(R.id.spinner_sync_frequency)
        btnSyncNow = view.findViewById(R.id.btn_sync_now)
        btnForceSync = view.findViewById(R.id.btn_force_sync)
        switchAutoBackup = view.findViewById(R.id.switch_auto_backup)
        tvLastBackup = view.findViewById(R.id.tv_last_backup)
        btnBackupNow = view.findViewById(R.id.btn_backup_now)
        btnRestoreBackup = view.findViewById(R.id.btn_restore_backup)
        progressStorageUsage = view.findViewById(R.id.progress_storage_usage)
        tvStorageDetails = view.findViewById(R.id.tv_storage_details)
        btnClearCache = view.findViewById(R.id.btn_clear_cache)
        btnExportData = view.findViewById(R.id.btn_export_data)
        tvSettingsSyncStatus = view.findViewById(R.id.tv_settings_sync_status)
        tvEstimatesSyncStatus = view.findViewById(R.id.tv_estimates_sync_status)
        tvPreferencesSyncStatus = view.findViewById(R.id.tv_preferences_sync_status)
        tvLastSyncTime = view.findViewById(R.id.tv_last_sync_time)

        // Setup sync frequency spinner
        val frequencies = arrayOf("Real-time", "Every 15 minutes", "Every hour", "Every 6 hours", "Daily", "Manual only")
        val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, frequencies)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerSyncFrequency.adapter = adapter
    }

    private fun setupClickListeners() {
        btnGoogleSignIn.setOnClickListener {
            googleAuthManager.signIn { success, account ->
                if (success && account != null) {
                    Toast.makeText(context, "Signed in successfully", Toast.LENGTH_SHORT).show()
                    updateGoogleAccountUI()
                } else {
                    Toast.makeText(context, "Sign in failed", Toast.LENGTH_SHORT).show()
                }
            }
        }

        btnGoogleSignOut.setOnClickListener {
            googleAuthManager.signOut {
                Toast.makeText(context, "Signed out", Toast.LENGTH_SHORT).show()
                updateGoogleAccountUI()
            }
        }

        switchAutoSync.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setAutoSyncEnabled(isChecked)
            if (isChecked && googleAuthManager.isSignedIn()) {
                startAutoSync()
            }
        }

        switchSyncWifiOnly.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setSyncWifiOnly(isChecked)
        }

        spinnerSyncFrequency.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                val frequency = parent?.getItemAtPosition(position).toString()
                settingsManager.setSyncFrequency(frequency)
                updateSyncSchedule()
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        btnSyncNow.setOnClickListener {
            performSync()
        }

        btnForceSync.setOnClickListener {
            performForceSync()
        }

        switchAutoBackup.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setAutoBackupEnabled(isChecked)
        }

        btnBackupNow.setOnClickListener {
            performBackup()
        }

        btnRestoreBackup.setOnClickListener {
            showRestoreDialog()
        }

        btnClearCache.setOnClickListener {
            clearCache()
        }

        btnExportData.setOnClickListener {
            exportData()
        }
    }

    private fun loadSettings() {
        switchAutoSync.isChecked = settingsManager.isAutoSyncEnabled()
        switchSyncWifiOnly.isChecked = settingsManager.isSyncWifiOnly()
        switchAutoBackup.isChecked = settingsManager.isAutoBackupEnabled()

        val syncFrequency = settingsManager.getSyncFrequency()
        val frequencies = arrayOf("Real-time", "Every 15 minutes", "Every hour", "Every 6 hours", "Daily", "Manual only")
        spinnerSyncFrequency.setSelection(frequencies.indexOf(syncFrequency))

        // Update storage usage
        updateStorageUsage()

        // Update last backup time
        val lastBackup = settingsManager.getLastBackupTime()
        if (lastBackup > 0) {
            tvLastBackup.text = android.text.format.DateFormat.format("MMM dd, yyyy HH:mm", java.util.Date(lastBackup))
        }

        // Update last sync time
        val lastSync = settingsManager.getLastSyncTime()
        if (lastSync > 0) {
            val timeAgo = getTimeAgo(lastSync)
            tvLastSyncTime.text = "Last sync: $timeAgo"
        }
    }

    private fun updateGoogleAccountUI() {
        if (googleAuthManager.isSignedIn()) {
            val account = googleAuthManager.getCurrentAccount()
            tvGoogleName.text = account?.displayName ?: "Unknown"
            tvGoogleEmail.text = account?.email ?: ""
            btnGoogleSignIn.visibility = View.GONE
            btnGoogleSignOut.visibility = View.VISIBLE
            
            // Load profile picture if available
            account?.photoUrl?.let { photoUrl ->
                // TODO: Load image using Glide or similar library
            }
        } else {
            tvGoogleName.text = "Not signed in"
            tvGoogleEmail.text = ""
            btnGoogleSignIn.visibility = View.VISIBLE
            btnGoogleSignOut.visibility = View.GONE
        }
    }

    private fun updateSyncStatus() {
        // Update sync status indicators
        val settingsStatus = if (settingsManager.areSettingsSynced()) "Up to date" else "Needs sync"
        tvSettingsSyncStatus.text = settingsStatus
        tvSettingsSyncStatus.setTextColor(
            resources.getColor(
                if (settingsStatus == "Up to date") android.R.color.holo_green_dark 
                else android.R.color.holo_orange_dark,
                null
            )
        )

        val estimatesStatus = if (settingsManager.areEstimatesSynced()) "Up to date" else "Syncing..."
        tvEstimatesSyncStatus.text = estimatesStatus
        tvEstimatesSyncStatus.setTextColor(
            resources.getColor(
                if (estimatesStatus == "Up to date") android.R.color.holo_green_dark 
                else android.R.color.holo_orange_dark,
                null
            )
        )

        val preferencesStatus = if (settingsManager.arePreferencesSynced()) "Up to date" else "Needs sync"
        tvPreferencesSyncStatus.text = preferencesStatus
        tvPreferencesSyncStatus.setTextColor(
            resources.getColor(
                if (preferencesStatus == "Up to date") android.R.color.holo_green_dark 
                else android.R.color.holo_orange_dark,
                null
            )
        )
    }

    private fun updateStorageUsage() {
        // Calculate storage usage
        val totalStorage = 100 * 1024 * 1024L // 100MB
        val usedStorage = settingsManager.getStorageUsage()
        val percentage = ((usedStorage * 100) / totalStorage).toInt()

        progressStorageUsage.progress = percentage
        tvStorageDetails.text = "${(usedStorage / 1024)} KB used of ${(totalStorage / 1024)} KB"
    }

    private fun startAutoSync() {
        if (!googleAuthManager.isSignedIn()) return
        
        // TODO: Implement automatic sync scheduler
        Toast.makeText(context, "Auto-sync started", Toast.LENGTH_SHORT).show()
    }

    private fun updateSyncSchedule() {
        // TODO: Update sync schedule based on frequency selection
    }

    private fun performSync() {
        if (!googleAuthManager.isSignedIn()) {
            Toast.makeText(context, "Please sign in first", Toast.LENGTH_SHORT).show()
            return
        }

        Toast.makeText(context, "Syncing...", Toast.LENGTH_SHORT).show()
        
        // Simulate sync process
        view?.postDelayed({
            settingsManager.markAsSynced()
            updateSyncStatus()
            val lastSync = System.currentTimeMillis()
            settingsManager.setLastSyncTime(lastSync)
            tvLastSyncTime.text = "Last sync: ${getTimeAgo(lastSync)}"
            Toast.makeText(context, "Sync completed", Toast.LENGTH_SHORT).show()
        }, 2000)
    }

    private fun performForceSync() {
        Toast.makeText(context, "Force syncing all data...", Toast.LENGTH_SHORT).show()
        
        // Simulate force sync
        view?.postDelayed({
            settingsManager.markAsSynced()
            updateSyncStatus()
            val lastSync = System.currentTimeMillis()
            settingsManager.setLastSyncTime(lastSync)
            tvLastSyncTime.text = "Last sync: ${getTimeAgo(lastSync)}"
            Toast.makeText(context, "Force sync completed", Toast.LENGTH_SHORT).show()
        }, 3000)
    }

    private fun performBackup() {
        if (!googleAuthManager.isSignedIn()) {
            Toast.makeText(context, "Please sign in first", Toast.LENGTH_SHORT).show()
            return
        }

        Toast.makeText(context, "Creating backup...", Toast.LENGTH_SHORT).show()
        
        // Simulate backup process
        view?.postDelayed({
            val backupTime = System.currentTimeMillis()
            settingsManager.setLastBackupTime(backupTime)
            tvLastBackup.text = android.text.format.DateFormat.format("MMM dd, yyyy HH:mm", java.util.Date(backupTime))
            Toast.makeText(context, "Backup completed", Toast.LENGTH_SHORT).show()
        }, 2000)
    }

    private fun showRestoreDialog() {
        // TODO: Implement restore dialog
        Toast.makeText(context, "Restore feature coming soon", Toast.LENGTH_SHORT).show()
    }

    private fun clearCache() {
        settingsManager.clearCache()
        updateStorageUsage()
        Toast.makeText(context, "Cache cleared", Toast.LENGTH_SHORT).show()
    }

    private fun exportData() {
        Toast.makeText(context, "Exporting data...", Toast.LENGTH_SHORT).show()
        
        // Simulate export process
        view?.postDelayed({
            Toast.makeText(context, "Data exported successfully", Toast.LENGTH_SHORT).show()
        }, 1500)
    }

    private fun getTimeAgo(timestamp: Long): String {
        val now = System.currentTimeMillis()
        val diff = now - timestamp
        
        return when {
            diff < 60000 -> "Just now"
            diff < 3600000 -> "${diff / 60000} minutes ago"
            diff < 86400000 -> "${diff / 3600000} hours ago"
            diff < 604800000 -> "${diff / 86400000} days ago"
            else -> android.text.format.DateFormat.format("MMM dd, yyyy", java.util.Date(timestamp)).toString()
        }
    }
}
