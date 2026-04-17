package com.example.estimetric.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.fragment.app.Fragment
import com.example.estimetric.R
import com.example.estimetric.utils.SettingsManager

class BidProposalFragment : Fragment() {

    private lateinit var settingsManager: SettingsManager

    // UI Components
    private lateinit var etDefaultHourlyRate: EditText
    private lateinit var etProfitMargin: EditText
    private lateinit var etContingency: EditText
    private lateinit var spinnerBidStrategy: Spinner
    private lateinit var spinnerProposalTemplate: Spinner
    private lateinit var switchIncludeAiSuggestions: Switch
    private lateinit var switchAutoGenerateProposals: Switch
    private lateinit var btnManageTemplates: Button
    private lateinit var switchRoundPrices: Switch
    private lateinit var switchShowBreakdown: Switch
    private lateinit var switchIncludeAlternatives: Switch
    private lateinit var spinnerPriceFormat: Spinner
    private lateinit var switchAutoSendProposals: Switch
    private lateinit var switchFollowUpReminders: Switch
    private lateinit var etFollowupInterval: EditText
    private lateinit var spinnerContactMethod: Spinner
    private lateinit var switchCompetitorAnalysis: Switch
    private lateinit var switchMarketAdjustment: Switch
    private lateinit var switchSeasonalPricing: Switch
    private lateinit var seekbarRiskTolerance: SeekBar
    private lateinit var tvRiskValue: TextView

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_bid_proposal, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        settingsManager = SettingsManager(requireContext())
        
        initializeViews(view)
        setupClickListeners()
        loadSettings()
    }

    private fun initializeViews(view: View) {
        etDefaultHourlyRate = view.findViewById(R.id.et_default_hourly_rate)
        etProfitMargin = view.findViewById(R.id.et_profit_margin)
        etContingency = view.findViewById(R.id.et_contingency)
        spinnerBidStrategy = view.findViewById(R.id.spinner_bid_strategy)
        spinnerProposalTemplate = view.findViewById(R.id.spinner_proposal_template)
        switchIncludeAiSuggestions = view.findViewById(R.id.switch_include_ai_suggestions)
        switchAutoGenerateProposals = view.findViewById(R.id.switch_auto_generate_proposals)
        btnManageTemplates = view.findViewById(R.id.btn_manage_templates)
        switchRoundPrices = view.findViewById(R.id.switch_round_prices)
        switchShowBreakdown = view.findViewById(R.id.switch_show_breakdown)
        switchIncludeAlternatives = view.findViewById(R.id.switch_include_alternatives)
        spinnerPriceFormat = view.findViewById(R.id.spinner_price_format)
        switchAutoSendProposals = view.findViewById(R.id.switch_auto_send_proposals)
        switchFollowUpReminders = view.findViewById(R.id.switch_follow_up_reminders)
        etFollowupInterval = view.findViewById(R.id.et_followup_interval)
        spinnerContactMethod = view.findViewById(R.id.spinner_contact_method)
        switchCompetitorAnalysis = view.findViewById(R.id.switch_competitor_analysis)
        switchMarketAdjustment = view.findViewById(R.id.switch_market_adjustment)
        switchSeasonalPricing = view.findViewById(R.id.switch_seasonal_pricing)
        seekbarRiskTolerance = view.findViewById(R.id.seekbar_risk_tolerance)
        tvRiskValue = view.findViewById(R.id.tv_risk_value)

        // Setup spinners
        setupBidStrategySpinner()
        setupProposalTemplateSpinner()
        setupPriceFormatSpinner()
        setupContactMethodSpinner()
    }

    private fun setupBidStrategySpinner() {
        val strategies = arrayOf("Competitive", "Premium", "Value-based", "Cost-plus", "Market Rate")
        val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, strategies)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerBidStrategy.adapter = adapter
    }

    private fun setupProposalTemplateSpinner() {
        val templates = arrayOf("Standard Proposal", "Detailed Breakdown", "Executive Summary", "Quick Quote", "Custom Template")
        val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, templates)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerProposalTemplate.adapter = adapter
    }

    private fun setupPriceFormatSpinner() {
        val formats = arrayOf("Detailed Breakdown", "Summary Only", "Tiered Pricing", "Fixed Price", "Hourly Rate")
        val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, formats)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerPriceFormat.adapter = adapter
    }

    private fun setupContactMethodSpinner() {
        val methods = arrayOf("Email", "Phone", "Text Message", "In-Person", "Video Call")
        val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, methods)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerContactMethod.adapter = adapter
    }

    private fun setupClickListeners() {
        spinnerBidStrategy.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                val strategy = parent?.getItemAtPosition(position).toString()
                settingsManager.setBidStrategy(strategy)
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        spinnerProposalTemplate.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                val template = parent?.getItemAtPosition(position).toString()
                settingsManager.setProposalTemplate(template)
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        switchIncludeAiSuggestions.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setAiSuggestionsEnabled(isChecked)
        }

        switchAutoGenerateProposals.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setAutoGenerateProposals(isChecked)
        }

        btnManageTemplates.setOnClickListener {
            Toast.makeText(context, "Template management coming soon", Toast.LENGTH_SHORT).show()
        }

        switchRoundPrices.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setRoundPrices(isChecked)
        }

        switchShowBreakdown.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setShowBreakdown(isChecked)
        }

        switchIncludeAlternatives.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setIncludeAlternatives(isChecked)
        }

        spinnerPriceFormat.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                val format = parent?.getItemAtPosition(position).toString()
                settingsManager.setPriceFormat(format)
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        switchAutoSendProposals.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setAutoSendProposals(isChecked)
        }

        switchFollowUpReminders.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setFollowUpRemindersEnabled(isChecked)
        }

        spinnerContactMethod.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                val method = parent?.getItemAtPosition(position).toString()
                settingsManager.setContactMethod(method)
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        switchCompetitorAnalysis.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setCompetitorAnalysisEnabled(isChecked)
        }

        switchMarketAdjustment.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setMarketAdjustmentEnabled(isChecked)
        }

        switchSeasonalPricing.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setSeasonalPricingEnabled(isChecked)
        }

        seekbarRiskTolerance.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                tvRiskValue.text = progress.toString()
                if (fromUser) {
                    settingsManager.setRiskTolerance(progress)
                }
            }

            override fun onStartTrackingTouch(seekBar: SeekBar?) {}

            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })

        // Text field listeners
        etDefaultHourlyRate.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                val rate = etDefaultHourlyRate.text.toString()
                if (rate.isNotBlank()) {
                    settingsManager.setDefaultHourlyRate(rate.toDoubleOrNull() ?: 0.0)
                }
            }
        }

        etProfitMargin.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                val margin = etProfitMargin.text.toString()
                if (margin.isNotBlank()) {
                    settingsManager.setProfitMargin(margin.toDoubleOrNull() ?: 0.0)
                }
            }
        }

        etContingency.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                val contingency = etContingency.text.toString()
                if (contingency.isNotBlank()) {
                    settingsManager.setContingency(contingency.toDoubleOrNull() ?: 0.0)
                }
            }
        }

        etFollowupInterval.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                val interval = etFollowupInterval.text.toString()
                if (interval.isNotBlank()) {
                    settingsManager.setFollowupInterval(interval.toIntOrNull() ?: 7)
                }
            }
        }
    }

    private fun loadSettings() {
        // Default bid settings
        val defaultRate = settingsManager.getDefaultHourlyRate()
        if (defaultRate > 0) {
            etDefaultHourlyRate.setText(defaultRate.toString())
        }

        val profitMargin = settingsManager.getProfitMargin()
        if (profitMargin > 0) {
            etProfitMargin.setText(profitMargin.toString())
        }

        val contingency = settingsManager.getContingency()
        if (contingency > 0) {
            etContingency.setText(contingency.toString())
        }

        // Bid strategy
        val bidStrategy = settingsManager.getBidStrategy()
        val strategies = arrayOf("Competitive", "Premium", "Value-based", "Cost-plus", "Market Rate")
        spinnerBidStrategy.setSelection(strategies.indexOf(bidStrategy))

        // Proposal templates
        val proposalTemplate = settingsManager.getProposalTemplate()
        val templates = arrayOf("Standard Proposal", "Detailed Breakdown", "Executive Summary", "Quick Quote", "Custom Template")
        spinnerProposalTemplate.setSelection(templates.indexOf(proposalTemplate))

        switchIncludeAiSuggestions.isChecked = settingsManager.isAiSuggestionsEnabled()
        switchAutoGenerateProposals.isChecked = settingsManager.isAutoGenerateProposals()

        // Pricing preferences
        switchRoundPrices.isChecked = settingsManager.isRoundPrices()
        switchShowBreakdown.isChecked = settingsManager.isShowBreakdown()
        switchIncludeAlternatives.isChecked = settingsManager.isIncludeAlternatives()

        val priceFormat = settingsManager.getPriceFormat()
        val formats = arrayOf("Detailed Breakdown", "Summary Only", "Tiered Pricing", "Fixed Price", "Hourly Rate")
        spinnerPriceFormat.setSelection(formats.indexOf(priceFormat))

        // Client communication
        switchAutoSendProposals.isChecked = settingsManager.isAutoSendProposals()
        switchFollowUpReminders.isChecked = settingsManager.isFollowUpRemindersEnabled()

        val followupInterval = settingsManager.getFollowupInterval()
        if (followupInterval > 0) {
            etFollowupInterval.setText(followupInterval.toString())
        }

        val contactMethod = settingsManager.getContactMethod()
        val methods = arrayOf("Email", "Phone", "Text Message", "In-Person", "Video Call")
        spinnerContactMethod.setSelection(methods.indexOf(contactMethod))

        // Advanced settings
        switchCompetitorAnalysis.isChecked = settingsManager.isCompetitorAnalysisEnabled()
        switchMarketAdjustment.isChecked = settingsManager.isMarketAdjustmentEnabled()
        switchSeasonalPricing.isChecked = settingsManager.isSeasonalPricingEnabled()

        val riskTolerance = settingsManager.getRiskTolerance()
        seekbarRiskTolerance.progress = riskTolerance
        tvRiskValue.text = riskTolerance.toString()
    }
}
