package com.example.estimetric.fragments

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.os.Looper
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import com.example.estimetric.R
import com.example.estimetric.utils.LocationManager
import com.example.estimetric.utils.SettingsManager
import com.google.android.gms.location.*

class GPSSettingsFragment : Fragment() {

    private lateinit var settingsManager: SettingsManager
    private lateinit var locationManager: LocationManager
    private lateinit var fusedLocationClient: FusedLocationProviderClient

    // UI Components
    private lateinit var switchLocationEnabled: Switch
    private lateinit var tvLocationStatus: TextView
    private lateinit var btnRequestLocationPermission: Button
    private lateinit var btnTestLocation: Button
    private lateinit var spinnerGpsAccuracy: Spinner
    private lateinit var spinnerUpdateFrequency: Spinner
    private lateinit var switchSaveLocationHistory: Switch
    private lateinit var spinnerHistoryRetention: Spinner
    private lateinit var btnClearLocationHistory: Button
    private lateinit var tvCurrentLocation: TextView
    private lateinit var tvLocationAccuracy: TextView
    private lateinit var tvLastUpdate: TextView

    private val LOCATION_PERMISSION_REQUEST_CODE = 1001

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_gps_settings, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        settingsManager = SettingsManager(requireContext())
        locationManager = LocationManager(requireContext())
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(requireContext())
        
        initializeViews(view)
        setupClickListeners()
        loadSettings()
        updateLocationStatus()
    }

    private fun initializeViews(view: View) {
        switchLocationEnabled = view.findViewById(R.id.switch_location_enabled)
        tvLocationStatus = view.findViewById(R.id.tv_location_status)
        btnRequestLocationPermission = view.findViewById(R.id.btn_request_location_permission)
        btnTestLocation = view.findViewById(R.id.btn_test_location)
        spinnerGpsAccuracy = view.findViewById(R.id.spinner_gps_accuracy)
        spinnerUpdateFrequency = view.findViewById(R.id.spinner_update_frequency)
        switchSaveLocationHistory = view.findViewById(R.id.switch_save_location_history)
        spinnerHistoryRetention = view.findViewById(R.id.spinner_history_retention)
        btnClearLocationHistory = view.findViewById(R.id.btn_clear_location_history)
        tvCurrentLocation = view.findViewById(R.id.tv_current_location)
        tvLocationAccuracy = view.findViewById(R.id.tv_location_accuracy)
        tvLastUpdate = view.findViewById(R.id.tv_last_update)

        // Setup spinners
        val accuracyOptions = arrayOf("High (±5m)", "Medium (±10m)", "Low (±20m)")
        val accuracyAdapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, accuracyOptions)
        accuracyAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerGpsAccuracy.adapter = accuracyAdapter

        val frequencyOptions = arrayOf("Real-time", "Every 30 seconds", "Every minute", "Every 5 minutes")
        val frequencyAdapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, frequencyOptions)
        frequencyAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerUpdateFrequency.adapter = frequencyAdapter

        val retentionOptions = arrayOf("1 week", "1 month", "3 months", "6 months", "1 year")
        val retentionAdapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, retentionOptions)
        retentionAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerHistoryRetention.adapter = retentionAdapter
    }

    private fun setupClickListeners() {
        switchLocationEnabled.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setLocationEnabled(isChecked)
            if (isChecked && hasLocationPermission()) {
                startLocationUpdates()
            } else {
                stopLocationUpdates()
            }
            updateLocationStatus()
        }

        btnRequestLocationPermission.setOnClickListener {
            requestLocationPermission()
        }

        btnTestLocation.setOnClickListener {
            if (hasLocationPermission()) {
                getCurrentLocation()
            } else {
                Toast.makeText(context, "Location permission required", Toast.LENGTH_SHORT).show()
            }
        }

        spinnerGpsAccuracy.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                val accuracy = parent?.getItemAtPosition(position).toString()
                settingsManager.setGpsAccuracy(accuracy)
                if (switchLocationEnabled.isChecked) {
                    restartLocationUpdates()
                }
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        spinnerUpdateFrequency.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                val frequency = parent?.getItemAtPosition(position).toString()
                settingsManager.setLocationUpdateFrequency(frequency)
                if (switchLocationEnabled.isChecked) {
                    restartLocationUpdates()
                }
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        switchSaveLocationHistory.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setSaveLocationHistory(isChecked)
            if (!isChecked) {
                btnClearLocationHistory.isEnabled = false
            } else {
                btnClearLocationHistory.isEnabled = true
            }
        }

        spinnerHistoryRetention.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                val retention = parent?.getItemAtPosition(position).toString()
                settingsManager.setLocationHistoryRetention(retention)
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        btnClearLocationHistory.setOnClickListener {
            locationManager.clearLocationHistory()
            Toast.makeText(context, "Location history cleared", Toast.LENGTH_SHORT).show()
        }
    }

    private fun loadSettings() {
        switchLocationEnabled.isChecked = settingsManager.isLocationEnabled()
        switchSaveLocationHistory.isChecked = settingsManager.isSaveLocationHistoryEnabled()
        btnClearLocationHistory.isEnabled = settingsManager.isSaveLocationHistoryEnabled()

        val accuracy = settingsManager.getGpsAccuracy()
        val accuracyOptions = arrayOf("High (±5m)", "Medium (±10m)", "Low (±20m)")
        val accuracyIndex = accuracyOptions.indexOf(accuracy)
        if (accuracyIndex >= 0) {
            spinnerGpsAccuracy.setSelection(accuracyIndex)
        }

        val frequency = settingsManager.getLocationUpdateFrequency()
        val frequencyOptions = arrayOf("Real-time", "Every 30 seconds", "Every minute", "Every 5 minutes")
        val frequencyIndex = frequencyOptions.indexOf(frequency)
        if (frequencyIndex >= 0) {
            spinnerUpdateFrequency.setSelection(frequencyIndex)
        }

        val retention = settingsManager.getLocationHistoryRetention()
        val retentionOptions = arrayOf("1 week", "1 month", "3 months", "6 months", "1 year")
        val retentionIndex = retentionOptions.indexOf(retention)
        if (retentionIndex >= 0) {
            spinnerHistoryRetention.setSelection(retentionIndex)
        }
    }

    private fun updateLocationStatus() {
        if (hasLocationPermission()) {
            if (switchLocationEnabled.isChecked) {
                tvLocationStatus.text = "Location services enabled"
                tvLocationStatus.setTextColor(resources.getColor(android.R.color.holo_green_dark, null))
                btnRequestLocationPermission.isEnabled = false
                btnTestLocation.isEnabled = true
            } else {
                tvLocationStatus.text = "Location services disabled"
                tvLocationStatus.setTextColor(resources.getColor(android.R.color.holo_red_dark, null))
                btnRequestLocationPermission.isEnabled = false
                btnTestLocation.isEnabled = false
            }
        } else {
            tvLocationStatus.text = "Location permission not granted"
            tvLocationStatus.setTextColor(resources.getColor(android.R.color.holo_orange_dark, null))
            btnRequestLocationPermission.isEnabled = true
            btnTestLocation.isEnabled = false
        }
    }

    private fun hasLocationPermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            requireContext(),
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
    }

    private fun requestLocationPermission() {
        ActivityCompat.requestPermissions(
            requireActivity(),
            arrayOf(
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
            ),
            LOCATION_PERMISSION_REQUEST_CODE
        )
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == LOCATION_PERMISSION_REQUEST_CODE) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Toast.makeText(context, "Location permission granted", Toast.LENGTH_SHORT).show()
                if (switchLocationEnabled.isChecked) {
                    startLocationUpdates()
                }
                updateLocationStatus()
            } else {
                Toast.makeText(context, "Location permission denied", Toast.LENGTH_SHORT).show()
                switchLocationEnabled.isChecked = false
                updateLocationStatus()
            }
        }
    }

    private fun startLocationUpdates() {
        if (!hasLocationPermission()) return

        val locationRequest = createLocationRequest()
        val locationCallback = createLocationCallback()

        fusedLocationClient.requestLocationUpdates(
            locationRequest,
            locationCallback,
            Looper.getMainLooper()
        )
    }

    private fun stopLocationUpdates() {
        fusedLocationClient.removeLocationUpdates(createLocationCallback())
    }

    private fun restartLocationUpdates() {
        stopLocationUpdates()
        if (switchLocationEnabled.isChecked) {
            startLocationUpdates()
        }
    }

    private fun createLocationRequest(): LocationRequest {
        return LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 10000).apply {
            setMinUpdateIntervalMillis(5000)
            setMaxUpdateDelayMillis(15000)
        }.build()
    }

    private fun createLocationCallback(): LocationCallback {
        return object : LocationCallback() {
            override fun onLocationResult(locationResult: LocationResult) {
                locationResult.lastLocation?.let { location ->
                    updateLocationDisplay(location)
                    if (settingsManager.isSaveLocationHistoryEnabled()) {
                        locationManager.saveLocation(location)
                    }
                }
            }
        }
    }

    private fun getCurrentLocation() {
        if (!hasLocationPermission()) return

        fusedLocationClient.lastLocation.addOnSuccessListener { location ->
            if (location != null) {
                updateLocationDisplay(location)
                Toast.makeText(context, "Location updated", Toast.LENGTH_SHORT).show()
            } else {
                Toast.makeText(context, "Unable to get current location", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun updateLocationDisplay(location: android.location.Location) {
        tvCurrentLocation.text = "Lat: ${location.latitude}, Lng: ${location.longitude}"
        tvLocationAccuracy.text = "Accuracy: ±${location.accuracy}m"
        tvLastUpdate.text = "Last update: ${android.text.format.DateFormat.format("HH:mm:ss", java.util.Date())}"
    }
}
