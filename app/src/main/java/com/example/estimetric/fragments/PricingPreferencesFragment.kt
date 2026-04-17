package com.example.estimetric.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.fragment.app.Fragment
import com.example.estimetric.R
import com.example.estimetric.utils.SettingsManager

class PricingPreferencesFragment : Fragment() {

    private lateinit var settingsManager: SettingsManager

    // UI Components
    private lateinit var rgStoreType: RadioGroup
    private lateinit var rbBothTypes: RadioButton
    private lateinit var rbBigBoxOnly: RadioButton
    private lateinit var rbLocalOnly: RadioButton
    private lateinit var spinnerPriority1: Spinner
    private lateinit var spinnerPriority2: Spinner
    private lateinit var spinnerPriority3: Spinner
    private lateinit var switchLivePricing: Switch
    private lateinit var spinnerPricingApi: Spinner
    private lateinit var etApiKey: EditText
    private lateinit var switchIncludeSales: Switch
    private lateinit var switchIncludeClearance: Switch
    private lateinit var switchIncludeBulk: Switch
    private lateinit var etMinPrice: EditText
    private lateinit var etMaxPrice: EditText
    private lateinit var spinnerSearchRadius: Spinner
    private lateinit var spinnerCurrency: Spinner
    private lateinit var switchIncludeTax: Switch

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_pricing_preferences, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        settingsManager = SettingsManager(requireContext())
        
        initializeViews(view)
        setupClickListeners()
        loadSettings()
    }

    private fun initializeViews(view: View) {
        rgStoreType = view.findViewById(R.id.rg_store_type)
        rbBothTypes = view.findViewById(R.id.rb_both_types)
        rbBigBoxOnly = view.findViewById(R.id.rb_big_box_only)
        rbLocalOnly = view.findViewById(R.id.rb_local_only)
        spinnerPriority1 = view.findViewById(R.id.spinner_priority_1)
        spinnerPriority2 = view.findViewById(R.id.spinner_priority_2)
        spinnerPriority3 = view.findViewById(R.id.spinner_priority_3)
        switchLivePricing = view.findViewById(R.id.switch_live_pricing)
        spinnerPricingApi = view.findViewById(R.id.spinner_pricing_api)
        etApiKey = view.findViewById(R.id.et_api_key)
        switchIncludeSales = view.findViewById(R.id.switch_include_sales)
        switchIncludeClearance = view.findViewById(R.id.switch_include_clearance)
        switchIncludeBulk = view.findViewById(R.id.switch_include_bulk)
        etMinPrice = view.findViewById(R.id.et_min_price)
        etMaxPrice = view.findViewById(R.id.et_max_price)
        spinnerSearchRadius = view.findViewById(R.id.spinner_search_radius)
        spinnerCurrency = view.findViewById(R.id.spinner_currency)
        switchIncludeTax = view.findViewById(R.id.switch_include_tax)

        // Setup spinners
        setupPrioritySpinners()
        setupPricingApiSpinner()
        setupSearchRadiusSpinner()
        setupCurrencySpinner()
    }

    private fun setupPrioritySpinners() {
        val storeTypes = arrayOf("Big Box Stores", "Local Stores", "Online Retailers", "Wholesale")
        val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, storeTypes)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)

        spinnerPriority1.adapter = adapter
        spinnerPriority2.adapter = adapter
        spinnerPriority3.adapter = adapter

        // Set default selections
        spinnerPriority2.setSelection(1)
        spinnerPriority3.setSelection(2)
    }

    private fun setupPricingApiSpinner() {
        val apis = arrayOf("Home Depot API", "Lowe's API", "Custom API", "PriceAPI", "RapidAPI")
        val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, apis)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerPricingApi.adapter = adapter
    }

    private fun setupSearchRadiusSpinner() {
        val radii = arrayOf("1 mile", "5 miles", "10 miles", "25 miles", "50 miles", "100 miles")
        val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, radii)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerSearchRadius.adapter = adapter
    }

    private fun setupCurrencySpinner() {
        val currencies = arrayOf("USD ($)", "EUR (â¬)", "GBP (Â£)", "CAD (C$)", "AUD (A$)")
        val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, currencies)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerCurrency.adapter = adapter
    }

    private fun setupClickListeners() {
        rgStoreType.setOnCheckedChangeListener { _, checkedId ->
            val storeType = when (checkedId) {
                R.id.rb_both_types -> "both"
                R.id.rb_big_box_only -> "big_box"
                R.id.rb_local_only -> "local"
                else -> "both"
            }
            settingsManager.setStoreTypePreference(storeType)
        }

        switchLivePricing.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setLivePricingEnabled(isChecked)
        }

        switchIncludeSales.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setIncludeSales(isChecked)
        }

        switchIncludeClearance.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setIncludeClearance(isChecked)
        }

        switchIncludeBulk.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setIncludeBulk(isChecked)
        }

        switchIncludeTax.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setIncludeTax(isChecked)
        }

        spinnerPriority1.onItemSelectedListener = createPrioritySpinnerListener(1)
        spinnerPriority2.onItemSelectedListener = createPrioritySpinnerListener(2)
        spinnerPriority3.onItemSelectedListener = createPrioritySpinnerListener(3)

        spinnerPricingApi.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                val api = parent?.getItemAtPosition(position).toString()
                settingsManager.setPricingApi(api)
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        spinnerSearchRadius.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                val radius = parent?.getItemAtPosition(position).toString()
                settingsManager.setSearchRadius(radius)
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        spinnerCurrency.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                val currency = parent?.getItemAtPosition(position).toString()
                settingsManager.setCurrency(currency)
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        etApiKey.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                settingsManager.setApiKey(etApiKey.text.toString())
            }
        }

        etMinPrice.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                val minPrice = etMinPrice.text.toString()
                if (minPrice.isNotBlank()) {
                    settingsManager.setMinPrice(minPrice.toDoubleOrNull() ?: 0.0)
                }
            }
        }

        etMaxPrice.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                val maxPrice = etMaxPrice.text.toString()
                if (maxPrice.isNotBlank()) {
                    settingsManager.setMaxPrice(maxPrice.toDoubleOrNull() ?: Double.MAX_VALUE)
                }
            }
        }
    }

    private fun createPrioritySpinnerListener(priority: Int): AdapterView.OnItemSelectedListener {
        return object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                val storeType = parent?.getItemAtPosition(position).toString()
                when (priority) {
                    1 -> settingsManager.setPriority1(storeType)
                    2 -> settingsManager.setPriority2(storeType)
                    3 -> settingsManager.setPriority3(storeType)
                }
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }
    }

    private fun loadSettings() {
        // Store type preference
        val storeType = settingsManager.getStoreTypePreference()
        when (storeType) {
            "both" -> rbBothTypes.isChecked = true
            "big_box" -> rbBigBoxOnly.isChecked = true
            "local" -> rbLocalOnly.isChecked = true
        }

        // Live pricing
        switchLivePricing.isChecked = settingsManager.isLivePricingEnabled()

        // Pricing filters
        switchIncludeSales.isChecked = settingsManager.isIncludeSales()
        switchIncludeClearance.isChecked = settingsManager.isIncludeClearance()
        switchIncludeBulk.isChecked = settingsManager.isIncludeBulk()
        switchIncludeTax.isChecked = settingsManager.isIncludeTax()

        // API settings
        etApiKey.setText(settingsManager.getApiKey())

        // Price range
        val minPrice = settingsManager.getMinPrice()
        if (minPrice > 0) {
            etMinPrice.setText(minPrice.toString())
        }

        val maxPrice = settingsManager.getMaxPrice()
        if (maxPrice < Double.MAX_VALUE) {
            etMaxPrice.setText(maxPrice.toString())
        }

        // Priority selections
        val priority1 = settingsManager.getPriority1()
        val priority2 = settingsManager.getPriority2()
        val priority3 = settingsManager.getPriority3()

        val storeTypes = arrayOf("Big Box Stores", "Local Stores", "Online Retailers", "Wholesale")
        spinnerPriority1.setSelection(storeTypes.indexOf(priority1))
        spinnerPriority2.setSelection(storeTypes.indexOf(priority2))
        spinnerPriority3.setSelection(storeTypes.indexOf(priority3))

        // API selection
        val pricingApi = settingsManager.getPricingApi()
        val apis = arrayOf("Home Depot API", "Lowe's API", "Custom API", "PriceAPI", "RapidAPI")
        spinnerPricingApi.setSelection(apis.indexOf(pricingApi))

        // Search radius
        val searchRadius = settingsManager.getSearchRadius()
        val radii = arrayOf("1 mile", "5 miles", "10 miles", "25 miles", "50 miles", "100 miles")
        spinnerSearchRadius.setSelection(radii.indexOf(searchRadius))

        // Currency
        val currency = settingsManager.getCurrency()
        val currencies = arrayOf("USD ($)", "EUR (â¬)", "GBP (Â£)", "CAD (C$)", "AUD (A$)")
        spinnerCurrency.setSelection(currencies.indexOf(currency))
    }
}
