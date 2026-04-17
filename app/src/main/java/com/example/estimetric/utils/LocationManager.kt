package com.example.estimetric.utils

import android.content.Context
import android.location.Location
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

class LocationManager(private val context: Context) {

    private val _locationHistory = MutableStateFlow<List<Location>>(emptyList())
    val locationHistory: Flow<List<Location>> = _locationHistory.asStateFlow()

    private val sharedPreferences = context.getSharedPreferences("location_data", Context.MODE_PRIVATE)

    fun saveLocation(location: Location) {
        val currentHistory = _locationHistory.value.toMutableList()
        currentHistory.add(location)
        
        // Keep only last 1000 locations to prevent memory issues
        if (currentHistory.size > 1000) {
            currentHistory.removeAt(0)
        }
        
        _locationHistory.value = currentHistory
        
        // Also save to persistent storage
        saveLocationToPreferences(location)
    }

    private fun saveLocationToPreferences(location: Location) {
        val locationString = "${location.latitude},${location.longitude},${location.time},${location.accuracy}"
        val history = sharedPreferences.getString("location_history", "")?.split("|")?.toMutableList() ?: mutableListOf()
        
        history.add(locationString)
        
        // Keep only last 500 locations in preferences
        if (history.size > 500) {
            history.removeAt(0)
        }
        
        sharedPreferences.edit()
            .putString("location_history", history.joinToString("|"))
            .apply()
    }

    fun getLocationHistory(): List<Location> {
        val historyString = sharedPreferences.getString("location_history", "") ?: ""
        return historyString.split("|")
            .filter { it.isNotEmpty() }
            .map { locationString ->
                val parts = locationString.split(",")
                if (parts.size >= 4) {
                    try {
                        val location = Location("EstiMetric")
                        location.latitude = parts[0].toDouble()
                        location.longitude = parts[1].toDouble()
                        location.time = parts[2].toLong()
                        location.accuracy = parts[3].toFloat()
                        location
                    } catch (e: Exception) {
                        null
                    }
                } else {
                    null
                }
            }
            .filterNotNull()
    }

    fun clearLocationHistory() {
        _locationHistory.value = emptyList()
        sharedPreferences.edit()
            .remove("location_history")
            .apply()
    }

    fun getLocationCount(): Int {
        return _locationHistory.value.size
    }

    fun getAverageAccuracy(): Float {
        val locations = _locationHistory.value
        return if (locations.isNotEmpty()) {
            locations.map { it.accuracy }.average().toFloat()
        } else {
            0f
        }
    }

    fun getLastKnownLocation(): Location? {
        return _locationHistory.value.lastOrNull()
    }

    fun getLocationStatistics(): LocationStatistics {
        val locations = _locationHistory.value
        return LocationStatistics(
            totalLocations = locations.size,
            averageAccuracy = if (locations.isNotEmpty()) locations.map { it.accuracy }.average().toFloat() else 0f,
            bestAccuracy = if (locations.isNotEmpty()) locations.minOf { it.accuracy } else 0f,
            worstAccuracy = if (locations.isNotEmpty()) locations.maxOf { it.accuracy } else 0f,
            lastLocationTime = locations.lastOrNull()?.time ?: 0L
        )
    }
}

data class LocationStatistics(
    val totalLocations: Int,
    val averageAccuracy: Float,
    val bestAccuracy: Float,
    val worstAccuracy: Float,
    val lastLocationTime: Long
)
