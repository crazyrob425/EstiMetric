package com.example.estimetric.utils

import android.content.Context
import android.content.SharedPreferences
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.core.floatPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class SettingsManager(context: Context) {

    private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "estimetric_settings")
    private val dataStore = context.dataStore

    // AI API Settings
    companion object Keys {
        // AI API Keys
        val MULTI_ACCOUNT_ENABLED = booleanPreferencesKey("multi_account_enabled")
        val SMART_ROUTING_ENABLED = booleanPreferencesKey("smart_routing_enabled")
        val PREFERRED_API_PROVIDER = stringPreferencesKey("preferred_api_provider")
        val PROXY_URL = stringPreferencesKey("proxy_url")

        // GPS Settings
        val LOCATION_ENABLED = booleanPreferencesKey("location_enabled")
        val GPS_ACCURACY = stringPreferencesKey("gps_accuracy")
        val LOCATION_UPDATE_FREQUENCY = stringPreferencesKey("location_update_frequency")
        val SAVE_LOCATION_HISTORY = booleanPreferencesKey("save_location_history")
        val LOCATION_HISTORY_RETENTION = stringPreferencesKey("location_history_retention")

        // Pricing Preferences
        val STORE_TYPE_PREFERENCE = stringPreferencesKey("store_type_preference")
        val PRIORITY_1 = stringPreferencesKey("priority_1")
        val PRIORITY_2 = stringPreferencesKey("priority_2")
        val PRIORITY_3 = stringPreferencesKey("priority_3")
        val LIVE_PRICING_ENABLED = booleanPreferencesKey("live_pricing_enabled")
        val PRICING_API = stringPreferencesKey("pricing_api")
        val API_KEY = stringPreferencesKey("api_key")
        val INCLUDE_SALES = booleanPreferencesKey("include_sales")
        val INCLUDE_CLEARANCE = booleanPreferencesKey("include_clearance")
        val INCLUDE_BULK = booleanPreferencesKey("include_bulk")
        val MIN_PRICE = floatPreferencesKey("min_price")
        val MAX_PRICE = floatPreferencesKey("max_price")
        val SEARCH_RADIUS = stringPreferencesKey("search_radius")
        val CURRENCY = stringPreferencesKey("currency")
        val INCLUDE_TAX = booleanPreferencesKey("include_tax")

        // AI Personality
        val COMMUNICATION_STYLE = stringPreferencesKey("communication_style")
        val FORMALITY_LEVEL = intPreferencesKey("formality_level")
        val DETAIL_LEVEL = intPreferencesKey("detail_level")
        val PROACTIVE_SUGGESTIONS_ENABLED = booleanPreferencesKey("proactive_suggestions_enabled")
        val LEARNING_MODE_ENABLED = booleanPreferencesKey("learning_mode_enabled")
        val CONTEXT_AWARENESS_ENABLED = booleanPreferencesKey("context_awareness_enabled")
        val HUMOR_ENABLED = booleanPreferencesKey("humor_enabled")
        val CREATIVITY_LEVEL = intPreferencesKey("creativity_level")
        val CONSTRUCTION_KNOWLEDGE_ENABLED = booleanPreferencesKey("construction_knowledge_enabled")
        val MATERIALS_KNOWLEDGE_ENABLED = booleanPreferencesKey("materials_knowledge_enabled")
        val PROJECT_MANAGEMENT_KNOWLEDGE_ENABLED = booleanPreferencesKey("project_management_knowledge_enabled")
        val LOCAL_REGULATIONS_KNOWLEDGE_ENABLED = booleanPreferencesKey("local_regulations_knowledge_enabled")
        val INDUSTRY_TRENDS_KNOWLEDGE_ENABLED = booleanPreferencesKey("industry_trends_knowledge_enabled")
        val VOICE_ENABLED = booleanPreferencesKey("voice_enabled")
        val VOICE_TYPE = stringPreferencesKey("voice_type")
        val SPEECH_SPEED = intPreferencesKey("speech_speed")

        // Bid & Proposal Settings
        val DEFAULT_HOURLY_RATE = floatPreferencesKey("default_hourly_rate")
        val PROFIT_MARGIN = floatPreferencesKey("profit_margin")
        val CONTINGENCY = floatPreferencesKey("contingency")
        val BID_STRATEGY = stringPreferencesKey("bid_strategy")
        val PROPOSAL_TEMPLATE = stringPreferencesKey("proposal_template")
        val AI_SUGGESTIONS_ENABLED = booleanPreferencesKey("ai_suggestions_enabled")
        val AUTO_GENERATE_PROPOSALS = booleanPreferencesKey("auto_generate_proposals")
        val ROUND_PRICES = booleanPreferencesKey("round_prices")
        val SHOW_BREAKDOWN = booleanPreferencesKey("show_breakdown")
        val INCLUDE_ALTERNATIVES = booleanPreferencesKey("include_alternatives")
        val PRICE_FORMAT = stringPreferencesKey("price_format")
        val AUTO_SEND_PROPOSALS = booleanPreferencesKey("auto_send_proposals")
        val FOLLOW_UP_REMINDERS_ENABLED = booleanPreferencesKey("follow_up_reminders_enabled")
        val FOLLOW_UP_INTERVAL = intPreferencesKey("follow_up_interval")
        val CONTACT_METHOD = stringPreferencesKey("contact_method")
        val COMPETITOR_ANALYSIS_ENABLED = booleanPreferencesKey("competitor_analysis_enabled")
        val MARKET_ADJUSTMENT_ENABLED = booleanPreferencesKey("market_adjustment_enabled")
        val SEASONAL_PRICING_ENABLED = booleanPreferencesKey("seasonal_pricing_enabled")
        val RISK_TOLERANCE = intPreferencesKey("risk_tolerance")

        // Cloud Sync Settings
        val AUTO_SYNC_ENABLED = booleanPreferencesKey("auto_sync_enabled")
        val SYNC_WIFI_ONLY = booleanPreferencesKey("sync_wifi_only")
        val SYNC_FREQUENCY = stringPreferencesKey("sync_frequency")
        val AUTO_BACKUP_ENABLED = booleanPreferencesKey("auto_backup_enabled")
        val LAST_BACKUP_TIME = longPreferencesKey("last_backup_time")
        val LAST_SYNC_TIME = longPreferencesKey("last_sync_time")
        val SETTINGS_SYNCED = booleanPreferencesKey("settings_synced")
        val ESTIMATES_SYNCED = booleanPreferencesKey("estimates_synced")
        val PREFERENCES_SYNCED = booleanPreferencesKey("preferences_synced")

        // User Profile Settings
        val FULL_NAME = stringPreferencesKey("full_name")
        val JOB_TITLE = stringPreferencesKey("job_title")
        val COMPANY_NAME = stringPreferencesKey("company_name")
        val POSITION = stringPreferencesKey("position")
        val COMPANY_EMAIL = stringPreferencesKey("company_email")
        val PHONE_NUMBER = stringPreferencesKey("phone_number")
        val WEBSITE = stringPreferencesKey("website")
        val BASE_HOURLY_RATE = floatPreferencesKey("base_hourly_rate")
        val YEARS_OF_EXPERIENCE = intPreferencesKey("years_of_experience")
        val SPECIALIZATION = stringPreferencesKey("specialization")
        val SERVICE_AREA = stringPreferencesKey("service_area")
        val RECEIVE_OFFERS_ENABLED = booleanPreferencesKey("receive_offers_enabled")
        val PUBLIC_PROFILE_ENABLED = booleanPreferencesKey("public_profile_enabled")
        val SHOW_CERTIFICATIONS_ENABLED = booleanPreferencesKey("show_certifications_enabled")
        val RESIDENTIAL_PROJECTS_ENABLED = booleanPreferencesKey("residential_projects_enabled")
        val COMMERCIAL_PROJECTS_ENABLED = booleanPreferencesKey("commercial_projects_enabled")
        val INDUSTRIAL_PROJECTS_ENABLED = booleanPreferencesKey("industrial_projects_enabled")
        val GOVERNMENT_PROJECTS_ENABLED = booleanPreferencesKey("government_projects_enabled")
        val BIO = stringPreferencesKey("bio")
    }

    // AI API Settings
    suspend fun setMultiAccountEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[MULTI_ACCOUNT_ENABLED] = enabled
        }
    }

    fun isMultiAccountEnabled(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[MULTI_ACCOUNT_ENABLED] ?: false
    }

    suspend fun setSmartRoutingEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[SMART_ROUTING_ENABLED] = enabled
        }
    }

    fun isSmartRoutingEnabled(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[SMART_ROUTING_ENABLED] ?: false
    }

    suspend fun setPreferredApiProvider(provider: String) {
        dataStore.edit { preferences ->
            preferences[PREFERRED_API_PROVIDER] = provider
        }
    }

    fun getPreferredApiProvider(): Flow<String> = dataStore.data.map { preferences ->
        preferences[PREFERRED_API_PROVIDER] ?: "Auto-select"
    }

    suspend fun setProxyUrl(url: String) {
        dataStore.edit { preferences ->
            preferences[PROXY_URL] = url
        }
    }

    fun getProxyUrl(): Flow<String> = dataStore.data.map { preferences ->
        preferences[PROXY_URL] ?: ""
    }

    // GPS Settings
    suspend fun setLocationEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[LOCATION_ENABLED] = enabled
        }
    }

    fun isLocationEnabled(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[LOCATION_ENABLED] ?: false
    }

    suspend fun setGpsAccuracy(accuracy: String) {
        dataStore.edit { preferences ->
            preferences[GPS_ACCURACY] = accuracy
        }
    }

    fun getGpsAccuracy(): Flow<String> = dataStore.data.map { preferences ->
        preferences[GPS_ACCURACY] ?: "Medium (±10m)"
    }

    suspend fun setLocationUpdateFrequency(frequency: String) {
        dataStore.edit { preferences ->
            preferences[LOCATION_UPDATE_FREQUENCY] = frequency
        }
    }

    fun getLocationUpdateFrequency(): Flow<String> = dataStore.data.map { preferences ->
        preferences[LOCATION_UPDATE_FREQUENCY] ?: "Every minute"
    }

    suspend fun setSaveLocationHistory(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[SAVE_LOCATION_HISTORY] = enabled
        }
    }

    fun isSaveLocationHistoryEnabled(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[SAVE_LOCATION_HISTORY] ?: false
    }

    suspend fun setLocationHistoryRetention(retention: String) {
        dataStore.edit { preferences ->
            preferences[LOCATION_HISTORY_RETENTION] = retention
        }
    }

    fun getLocationHistoryRetention(): Flow<String> = dataStore.data.map { preferences ->
        preferences[LOCATION_HISTORY_RETENTION] ?: "1 month"
    }

    // Pricing Preferences
    suspend fun setStoreTypePreference(type: String) {
        dataStore.edit { preferences ->
            preferences[STORE_TYPE_PREFERENCE] = type
        }
    }

    fun getStoreTypePreference(): Flow<String> = dataStore.data.map { preferences ->
        preferences[STORE_TYPE_PREFERENCE] ?: "both"
    }

    suspend fun setPriority1(priority: String) {
        dataStore.edit { preferences ->
            preferences[PRIORITY_1] = priority
        }
    }

    fun getPriority1(): Flow<String> = dataStore.data.map { preferences ->
        preferences[PRIORITY_1] ?: "Big Box Stores"
    }

    suspend fun setPriority2(priority: String) {
        dataStore.edit { preferences ->
            preferences[PRIORITY_2] = priority
        }
    }

    fun getPriority2(): Flow<String> = dataStore.data.map { preferences ->
        preferences[PRIORITY_2] ?: "Local Stores"
    }

    suspend fun setPriority3(priority: String) {
        dataStore.edit { preferences ->
            preferences[PRIORITY_3] = priority
        }
    }

    fun getPriority3(): Flow<String> = dataStore.data.map { preferences ->
        preferences[PRIORITY_3] ?: "Online Retailers"
    }

    suspend fun setLivePricingEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[LIVE_PRICING_ENABLED] = enabled
        }
    }

    fun isLivePricingEnabled(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[LIVE_PRICING_ENABLED] ?: false
    }

    suspend fun setPricingApi(api: String) {
        dataStore.edit { preferences ->
            preferences[PRICING_API] = api
        }
    }

    fun getPricingApi(): Flow<String> = dataStore.data.map { preferences ->
        preferences[PRICING_API] ?: "Home Depot API"
    }

    suspend fun setApiKey(key: String) {
        dataStore.edit { preferences ->
            preferences[API_KEY] = key
        }
    }

    fun getApiKey(): Flow<String> = dataStore.data.map { preferences ->
        preferences[API_KEY] ?: ""
    }

    suspend fun setIncludeSales(include: Boolean) {
        dataStore.edit { preferences ->
            preferences[INCLUDE_SALES] = include
        }
    }

    fun isIncludeSales(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[INCLUDE_SALES] ?: true
    }

    suspend fun setIncludeClearance(include: Boolean) {
        dataStore.edit { preferences ->
            preferences[INCLUDE_CLEARANCE] = include
        }
    }

    fun isIncludeClearance(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[INCLUDE_CLEARANCE] ?: true
    }

    suspend fun setIncludeBulk(include: Boolean) {
        dataStore.edit { preferences ->
            preferences[INCLUDE_BULK] = include
        }
    }

    fun isIncludeBulk(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[INCLUDE_BULK] ?: false
    }

    suspend fun setMinPrice(price: Double) {
        dataStore.edit { preferences ->
            preferences[MIN_PRICE] = price.toFloat()
        }
    }

    fun getMinPrice(): Flow<Double> = dataStore.data.map { preferences ->
        preferences[MIN_PRICE]?.toDouble() ?: 0.0
    }

    suspend fun setMaxPrice(price: Double) {
        dataStore.edit { preferences ->
            preferences[MAX_PRICE] = price.toFloat()
        }
    }

    fun getMaxPrice(): Flow<Double> = dataStore.data.map { preferences ->
        preferences[MAX_PRICE]?.toDouble() ?: Double.MAX_VALUE
    }

    suspend fun setSearchRadius(radius: String) {
        dataStore.edit { preferences ->
            preferences[SEARCH_RADIUS] = radius
        }
    }

    fun getSearchRadius(): Flow<String> = dataStore.data.map { preferences ->
        preferences[SEARCH_RADIUS] ?: "25 miles"
    }

    suspend fun setCurrency(currency: String) {
        dataStore.edit { preferences ->
            preferences[CURRENCY] = currency
        }
    }

    fun getCurrency(): Flow<String> = dataStore.data.map { preferences ->
        preferences[CURRENCY] ?: "USD ($)"
    }

    suspend fun setIncludeTax(include: Boolean) {
        dataStore.edit { preferences ->
            preferences[INCLUDE_TAX] = include
        }
    }

    fun isIncludeTax(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[INCLUDE_TAX] ?: false
    }

    // AI Personality Settings
    suspend fun setCommunicationStyle(style: String) {
        dataStore.edit { preferences ->
            preferences[COMMUNICATION_STYLE] = style
        }
    }

    fun getCommunicationStyle(): Flow<String> = dataStore.data.map { preferences ->
        preferences[COMMUNICATION_STYLE] ?: "Professional"
    }

    suspend fun setFormalityLevel(level: Int) {
        dataStore.edit { preferences ->
            preferences[FORMALITY_LEVEL] = level
        }
    }

    fun getFormalityLevel(): Flow<Int> = dataStore.data.map { preferences ->
        preferences[FORMALITY_LEVEL] ?: 5
    }

    suspend fun setDetailLevel(level: Int) {
        dataStore.edit { preferences ->
            preferences[DETAIL_LEVEL] = level
        }
    }

    fun getDetailLevel(): Flow<Int> = dataStore.data.map { preferences ->
        preferences[DETAIL_LEVEL] ?: 7
    }

    suspend fun setProactiveSuggestionsEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[PROACTIVE_SUGGESTIONS_ENABLED] = enabled
        }
    }

    fun isProactiveSuggestionsEnabled(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[PROACTIVE_SUGGESTIONS_ENABLED] ?: true
    }

    suspend fun setLearningModeEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[LEARNING_MODE_ENABLED] = enabled
        }
    }

    fun isLearningModeEnabled(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[LEARNING_MODE_ENABLED] ?: true
    }

    suspend fun setContextAwarenessEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[CONTEXT_AWARENESS_ENABLED] = enabled
        }
    }

    fun isContextAwarenessEnabled(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[CONTEXT_AWARENESS_ENABLED] ?: true
    }

    suspend fun setHumorEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[HUMOR_ENABLED] = enabled
        }
    }

    fun isHumorEnabled(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[HUMOR_ENABLED] ?: false
    }

    suspend fun setCreativityLevel(level: Int) {
        dataStore.edit { preferences ->
            preferences[CREATIVITY_LEVEL] = level
        }
    }

    fun getCreativityLevel(): Flow<Int> = dataStore.data.map { preferences ->
        preferences[CREATIVITY_LEVEL] ?: 5
    }

    // Knowledge areas
    suspend fun setConstructionKnowledgeEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[CONSTRUCTION_KNOWLEDGE_ENABLED] = enabled
        }
    }

    fun isConstructionKnowledgeEnabled(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[CONSTRUCTION_KNOWLEDGE_ENABLED] ?: true
    }

    suspend fun setMaterialsKnowledgeEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[MATERIALS_KNOWLEDGE_ENABLED] = enabled
        }
    }

    fun isMaterialsKnowledgeEnabled(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[MATERIALS_KNOWLEDGE_ENABLED] ?: true
    }

    suspend fun setProjectManagementKnowledgeEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[PROJECT_MANAGEMENT_KNOWLEDGE_ENABLED] = enabled
        }
    }

    fun isProjectManagementKnowledgeEnabled(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[PROJECT_MANAGEMENT_KNOWLEDGE_ENABLED] ?: false
    }

    suspend fun setLocalRegulationsKnowledgeEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[LOCAL_REGULATIONS_KNOWLEDGE_ENABLED] = enabled
        }
    }

    fun isLocalRegulationsKnowledgeEnabled(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[LOCAL_REGULATIONS_KNOWLEDGE_ENABLED] ?: false
    }

    suspend fun setIndustryTrendsKnowledgeEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[INDUSTRY_TRENDS_KNOWLEDGE_ENABLED] = enabled
        }
    }

    fun isIndustryTrendsKnowledgeEnabled(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[INDUSTRY_TRENDS_KNOWLEDGE_ENABLED] ?: false
    }

    // Voice settings
    suspend fun setVoiceEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[VOICE_ENABLED] = enabled
        }
    }

    fun isVoiceEnabled(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[VOICE_ENABLED] ?: false
    }

    suspend fun setVoiceType(type: String) {
        dataStore.edit { preferences ->
            preferences[VOICE_TYPE] = type
        }
    }

    fun getVoiceType(): Flow<String> = dataStore.data.map { preferences ->
        preferences[VOICE_TYPE] ?: "Natural Male"
    }

    suspend fun setSpeechSpeed(speed: Int) {
        dataStore.edit { preferences ->
            preferences[SPEECH_SPEED] = speed
        }
    }

    fun getSpeechSpeed(): Flow<Int> = dataStore.data.map { preferences ->
        preferences[SPEECH_SPEED] ?: 5
    }

    // Bid & Proposal Settings
    suspend fun setDefaultHourlyRate(rate: Double) {
        dataStore.edit { preferences ->
            preferences[DEFAULT_HOURLY_RATE] = rate.toFloat()
        }
    }

    fun getDefaultHourlyRate(): Flow<Double> = dataStore.data.map { preferences ->
        preferences[DEFAULT_HOURLY_RATE]?.toDouble() ?: 0.0
    }

    suspend fun setProfitMargin(margin: Double) {
        dataStore.edit { preferences ->
            preferences[PROFIT_MARGIN] = margin.toFloat()
        }
    }

    fun getProfitMargin(): Flow<Double> = dataStore.data.map { preferences ->
        preferences[PROFIT_MARGIN]?.toDouble() ?: 20.0
    }

    suspend fun setContingency(contingency: Double) {
        dataStore.edit { preferences ->
            preferences[CONTINGENCY] = contingency.toFloat()
        }
    }

    fun getContingency(): Flow<Double> = dataStore.data.map { preferences ->
        preferences[CONTINGENCY]?.toDouble() ?: 10.0
    }

    suspend fun setBidStrategy(strategy: String) {
        dataStore.edit { preferences ->
            preferences[BID_STRATEGY] = strategy
        }
    }

    fun getBidStrategy(): Flow<String> = dataStore.data.map { preferences ->
        preferences[BID_STRATEGY] ?: "Competitive"
    }

    suspend fun setProposalTemplate(template: String) {
        dataStore.edit { preferences ->
            preferences[PROPOSAL_TEMPLATE] = template
        }
    }

    fun getProposalTemplate(): Flow<String> = dataStore.data.map { preferences ->
        preferences[PROPOSAL_TEMPLATE] ?: "Standard Proposal"
    }

    suspend fun setAiSuggestionsEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[AI_SUGGESTIONS_ENABLED] = enabled
        }
    }

    fun isAiSuggestionsEnabled(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[AI_SUGGESTIONS_ENABLED] ?: true
    }

    suspend fun setAutoGenerateProposals(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[AUTO_GENERATE_PROPOSALS] = enabled
        }
    }

    fun isAutoGenerateProposals(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[AUTO_GENERATE_PROPOSALS] ?: false
    }

    suspend fun setRoundPrices(round: Boolean) {
        dataStore.edit { preferences ->
            preferences[ROUND_PRICES] = round
        }
    }

    fun isRoundPrices(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[ROUND_PRICES] ?: true
    }

    suspend fun setShowBreakdown(show: Boolean) {
        dataStore.edit { preferences ->
            preferences[SHOW_BREAKDOWN] = show
        }
    }

    fun isShowBreakdown(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[SHOW_BREAKDOWN] ?: true
    }

    suspend fun setIncludeAlternatives(include: Boolean) {
        dataStore.edit { preferences ->
            preferences[INCLUDE_ALTERNATIVES] = include
        }
    }

    fun isIncludeAlternatives(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[INCLUDE_ALTERNATIVES] ?: false
    }

    suspend fun setPriceFormat(format: String) {
        dataStore.edit { preferences ->
            preferences[PRICE_FORMAT] = format
        }
    }

    fun getPriceFormat(): Flow<String> = dataStore.data.map { preferences ->
        preferences[PRICE_FORMAT] ?: "Detailed Breakdown"
    }

    suspend fun setAutoSendProposals(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[AUTO_SEND_PROPOSALS] = enabled
        }
    }

    fun isAutoSendProposals(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[AUTO_SEND_PROPOSALS] ?: false
    }

    suspend fun setFollowUpRemindersEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[FOLLOW_UP_REMINDERS_ENABLED] = enabled
        }
    }

    fun isFollowUpRemindersEnabled(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[FOLLOW_UP_REMINDERS_ENABLED] ?: true
    }

    suspend fun setFollowUpInterval(interval: Int) {
        dataStore.edit { preferences ->
            preferences[FOLLOW_UP_INTERVAL] = interval
        }
    }

    fun getFollowUpInterval(): Flow<Int> = dataStore.data.map { preferences ->
        preferences[FOLLOW_UP_INTERVAL] ?: 7
    }

    suspend fun setContactMethod(method: String) {
        dataStore.edit { preferences ->
            preferences[CONTACT_METHOD] = method
        }
    }

    fun getContactMethod(): Flow<String> = dataStore.data.map { preferences ->
        preferences[CONTACT_METHOD] ?: "Email"
    }

    suspend fun setCompetitorAnalysisEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[COMPETITOR_ANALYSIS_ENABLED] = enabled
        }
    }

    fun isCompetitorAnalysisEnabled(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[COMPETITOR_ANALYSIS_ENABLED] ?: false
    }

    suspend fun setMarketAdjustmentEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[MARKET_ADJUSTMENT_ENABLED] = enabled
        }
    }

    fun isMarketAdjustmentEnabled(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[MARKET_ADJUSTMENT_ENABLED] ?: false
    }

    suspend fun setSeasonalPricingEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[SEASONAL_PRICING_ENABLED] = enabled
        }
    }

    fun isSeasonalPricingEnabled(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[SEASONAL_PRICING_ENABLED] ?: false
    }

    suspend fun setRiskTolerance(tolerance: Int) {
        dataStore.edit { preferences ->
            preferences[RISK_TOLERANCE] = tolerance
        }
    }

    fun getRiskTolerance(): Flow<Int> = dataStore.data.map { preferences ->
        preferences[RISK_TOLERANCE] ?: 5
    }

    // Cloud Sync Settings
    suspend fun setAutoSyncEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[AUTO_SYNC_ENABLED] = enabled
        }
    }

    fun isAutoSyncEnabled(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[AUTO_SYNC_ENABLED] ?: false
    }

    suspend fun setSyncWifiOnly(wifiOnly: Boolean) {
        dataStore.edit { preferences ->
            preferences[SYNC_WIFI_ONLY] = wifiOnly
        }
    }

    fun isSyncWifiOnly(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[SYNC_WIFI_ONLY] ?: true
    }

    suspend fun setSyncFrequency(frequency: String) {
        dataStore.edit { preferences ->
            preferences[SYNC_FREQUENCY] = frequency
        }
    }

    fun getSyncFrequency(): Flow<String> = dataStore.data.map { preferences ->
        preferences[SYNC_FREQUENCY] ?: "Daily"
    }

    suspend fun setAutoBackupEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[AUTO_BACKUP_ENABLED] = enabled
        }
    }

    fun isAutoBackupEnabled(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[AUTO_BACKUP_ENABLED] ?: true
    }

    suspend fun setLastBackupTime(time: Long) {
        dataStore.edit { preferences ->
            preferences[LAST_BACKUP_TIME] = time
        }
    }

    fun getLastBackupTime(): Flow<Long> = dataStore.data.map { preferences ->
        preferences[LAST_BACKUP_TIME] ?: 0L
    }

    suspend fun setLastSyncTime(time: Long) {
        dataStore.edit { preferences ->
            preferences[LAST_SYNC_TIME] = time
        }
    }

    fun getLastSyncTime(): Flow<Long> = dataStore.data.map { preferences ->
        preferences[LAST_SYNC_TIME] ?: 0L
    }

    suspend fun markAsSynced() {
        dataStore.edit { preferences ->
            preferences[SETTINGS_SYNCED] = true
            preferences[ESTIMATES_SYNCED] = true
            preferences[PREFERENCES_SYNCED] = true
        }
    }

    fun areSettingsSynced(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[SETTINGS_SYNCED] ?: false
    }

    fun areEstimatesSynced(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[ESTIMATES_SYNCED] ?: false
    }

    fun arePreferencesSynced(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[PREFERENCES_SYNCED] ?: false
    }

    // User Profile Settings
    suspend fun setFullName(name: String) {
        dataStore.edit { preferences ->
            preferences[FULL_NAME] = name
        }
    }

    fun getFullName(): Flow<String> = dataStore.data.map { preferences ->
        preferences[FULL_NAME] ?: ""
    }

    suspend fun setJobTitle(title: String) {
        dataStore.edit { preferences ->
            preferences[JOB_TITLE] = title
        }
    }

    fun getJobTitle(): Flow<String> = dataStore.data.map { preferences ->
        preferences[JOB_TITLE] ?: ""
    }

    suspend fun setCompanyName(company: String) {
        dataStore.edit { preferences ->
            preferences[COMPANY_NAME] = company
        }
    }

    fun getCompanyName(): Flow<String> = dataStore.data.map { preferences ->
        preferences[COMPANY_NAME] ?: ""
    }

    suspend fun setPosition(position: String) {
        dataStore.edit { preferences ->
            preferences[POSITION] = position
        }
    }

    fun getPosition(): Flow<String> = dataStore.data.map { preferences ->
        preferences[POSITION] ?: ""
    }

    suspend fun setCompanyEmail(email: String) {
        dataStore.edit { preferences ->
            preferences[COMPANY_EMAIL] = email
        }
    }

    fun getCompanyEmail(): Flow<String> = dataStore.data.map { preferences ->
        preferences[COMPANY_EMAIL] ?: ""
    }

    suspend fun setPhoneNumber(phone: String) {
        dataStore.edit { preferences ->
            preferences[PHONE_NUMBER] = phone
        }
    }

    fun getPhoneNumber(): Flow<String> = dataStore.data.map { preferences ->
        preferences[PHONE_NUMBER] ?: ""
    }

    suspend fun setWebsite(website: String) {
        dataStore.edit { preferences ->
            preferences[WEBSITE] = website
        }
    }

    fun getWebsite(): Flow<String> = dataStore.data.map { preferences ->
        preferences[WEBSITE] ?: ""
    }

    suspend fun setBaseHourlyRate(rate: Double) {
        dataStore.edit { preferences ->
            preferences[BASE_HOURLY_RATE] = rate.toFloat()
        }
    }

    fun getBaseHourlyRate(): Flow<Double> = dataStore.data.map { preferences ->
        preferences[BASE_HOURLY_RATE]?.toDouble() ?: 0.0
    }

    suspend fun setYearsOfExperience(years: Int) {
        dataStore.edit { preferences ->
            preferences[YEARS_OF_EXPERIENCE] = years
        }
    }

    fun getYearsOfExperience(): Flow<Int> = dataStore.data.map { preferences ->
        preferences[YEARS_OF_EXPERIENCE] ?: 0
    }

    suspend fun setSpecialization(specialization: String) {
        dataStore.edit { preferences ->
            preferences[SPECIALIZATION] = specialization
        }
    }

    fun getSpecialization(): Flow<String> = dataStore.data.map { preferences ->
        preferences[SPECIALIZATION] ?: "General Contracting"
    }

    suspend fun setServiceArea(area: String) {
        dataStore.edit { preferences ->
            preferences[SERVICE_AREA] = area
        }
    }

    fun getServiceArea(): Flow<String> = dataStore.data.map { preferences ->
        preferences[SERVICE_AREA] ?: ""
    }

    suspend fun setReceiveOffersEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[RECEIVE_OFFERS_ENABLED] = enabled
        }
    }

    fun isReceiveOffersEnabled(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[RECEIVE_OFFERS_ENABLED] ?: true
    }

    suspend fun setPublicProfileEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[PUBLIC_PROFILE_ENABLED] = enabled
        }
    }

    fun isPublicProfileEnabled(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[PUBLIC_PROFILE_ENABLED] ?: false
    }

    suspend fun setShowCertificationsEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[SHOW_CERTIFICATIONS_ENABLED] = enabled
        }
    }

    fun isShowCertificationsEnabled(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[SHOW_CERTIFICATIONS_ENABLED] ?: true
    }

    suspend fun setResidentialProjectsEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[RESIDENTIAL_PROJECTS_ENABLED] = enabled
        }
    }

    fun isResidentialProjectsEnabled(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[RESIDENTIAL_PROJECTS_ENABLED] ?: true
    }

    suspend fun setCommercialProjectsEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[COMMERCIAL_PROJECTS_ENABLED] = enabled
        }
    }

    fun isCommercialProjectsEnabled(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[COMMERCIAL_PROJECTS_ENABLED] ?: false
    }

    suspend fun setIndustrialProjectsEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[INDUSTRIAL_PROJECTS_ENABLED] = enabled
        }
    }

    fun isIndustrialProjectsEnabled(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[INDUSTRIAL_PROJECTS_ENABLED] ?: false
    }

    suspend fun setGovernmentProjectsEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[GOVERNMENT_PROJECTS_ENABLED] = enabled
        }
    }

    fun isGovernmentProjectsEnabled(): Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[GOVERNMENT_PROJECTS_ENABLED] ?: false
    }

    suspend fun setBio(bio: String) {
        dataStore.edit { preferences ->
            preferences[BIO] = bio
        }
    }

    fun getBio(): Flow<String> = dataStore.data.map { preferences ->
        preferences[BIO] ?: ""
    }

    // Utility methods
    suspend fun clearCache() {
        // Implementation for clearing cache
    }

    fun getStorageUsage(): Long {
        // Implementation for calculating storage usage
        return 25 * 1024L // 25KB placeholder
    }
}
