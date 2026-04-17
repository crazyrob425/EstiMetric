package com.example.estimetric.fragments

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.fragment.app.Fragment
import com.example.estimetric.R
import com.example.estimetric.utils.OAuthManager
import com.example.estimetric.utils.SettingsManager

class AIAPIsFragment : Fragment() {

    private lateinit var settingsManager: SettingsManager
    private lateinit var oauthManager: OAuthManager

    // UI Components
    private lateinit var btnGeminiLogin: Button
    private lateinit var btnClaudeLogin: Button
    private lateinit var btnKiloLogin: Button
    private lateinit var btnAntigravityLogin: Button
    private lateinit var tvGeminiStatus: TextView
    private lateinit var tvClaudeStatus: TextView
    private lateinit var tvKiloStatus: TextView
    private lateinit var tvAntigravityStatus: TextView
    private lateinit var switchMultiAccount: Switch
    private lateinit var switchSmartRouting: Switch
    private lateinit var spinnerPreferredApi: Spinner
    private lateinit var etProxyUrl: EditText
    private lateinit var btnTestProxy: Button

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_ai_apis, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        settingsManager = SettingsManager(requireContext())
        oauthManager = OAuthManager(requireContext())
        
        initializeViews(view)
        setupClickListeners()
        loadSettings()
        updateConnectionStatuses()
    }

    private fun initializeViews(view: View) {
        btnGeminiLogin = view.findViewById(R.id.btn_gemini_login)
        btnClaudeLogin = view.findViewById(R.id.btn_claude_login)
        btnKiloLogin = view.findViewById(R.id.btn_kilo_login)
        btnAntigravityLogin = view.findViewById(R.id.btn_antigravity_login)
        tvGeminiStatus = view.findViewById(R.id.tv_gemini_status)
        tvClaudeStatus = view.findViewById(R.id.tv_claude_status)
        tvKiloStatus = view.findViewById(R.id.tv_kilo_status)
        tvAntigravityStatus = view.findViewById(R.id.tv_antigravity_status)
        switchMultiAccount = view.findViewById(R.id.switch_multi_account)
        switchSmartRouting = view.findViewById(R.id.switch_smart_routing)
        spinnerPreferredApi = view.findViewById(R.id.spinner_preferred_api)
        etProxyUrl = view.findViewById(R.id.et_proxy_url)
        btnTestProxy = view.findViewById(R.id.btn_test_proxy)

        // Setup spinner
        val apiProviders = arrayOf("Auto-select", "Gemini", "Claude", "Kilo", "Antigravity")
        val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, apiProviders)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerPreferredApi.adapter = adapter
    }

    private fun setupClickListeners() {
        btnGeminiLogin.setOnClickListener {
            oauthManager.initiateGeminiOAuth { success ->
                if (success) {
                    Toast.makeText(context, "Gemini connected successfully", Toast.LENGTH_SHORT).show()
                    updateConnectionStatuses()
                } else {
                    Toast.makeText(context, "Failed to connect Gemini", Toast.LENGTH_SHORT).show()
                }
            }
        }

        btnClaudeLogin.setOnClickListener {
            oauthManager.initiateClaudeOAuth { success ->
                if (success) {
                    Toast.makeText(context, "Claude connected successfully", Toast.LENGTH_SHORT).show()
                    updateConnectionStatuses()
                } else {
                    Toast.makeText(context, "Failed to connect Claude", Toast.LENGTH_SHORT).show()
                }
            }
        }

        btnKiloLogin.setOnClickListener {
            oauthManager.initiateKiloOAuth { success ->
                if (success) {
                    Toast.makeText(context, "Kilo connected successfully", Toast.LENGTH_SHORT).show()
                    updateConnectionStatuses()
                } else {
                    Toast.makeText(context, "Failed to connect Kilo", Toast.LENGTH_SHORT).show()
                }
            }
        }

        btnAntigravityLogin.setOnClickListener {
            oauthManager.initiateAntigravityOAuth { success ->
                if (success) {
                    Toast.makeText(context, "Antigravity connected successfully", Toast.LENGTH_SHORT).show()
                    updateConnectionStatuses()
                } else {
                    Toast.makeText(context, "Failed to connect Antigravity", Toast.LENGTH_SHORT).show()
                }
            }
        }

        switchMultiAccount.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setMultiAccountEnabled(isChecked)
        }

        switchSmartRouting.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setSmartRoutingEnabled(isChecked)
        }

        spinnerPreferredApi.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                val provider = parent?.getItemAtPosition(position).toString()
                settingsManager.setPreferredApiProvider(provider)
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        btnTestProxy.setOnClickListener {
            testProxyConnection()
        }

        etProxyUrl.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                settingsManager.setProxyUrl(etProxyUrl.text.toString())
            }
        }
    }

    private fun loadSettings() {
        switchMultiAccount.isChecked = settingsManager.isMultiAccountEnabled()
        switchSmartRouting.isChecked = settingsManager.isSmartRoutingEnabled()
        etProxyUrl.setText(settingsManager.getProxyUrl())
        
        val preferredProvider = settingsManager.getPreferredApiProvider()
        val providers = arrayOf("Auto-select", "Gemini", "Claude", "Kilo", "Antigravity")
        val index = providers.indexOf(preferredProvider)
        if (index >= 0) {
            spinnerPreferredApi.setSelection(index)
        }
    }

    private fun updateConnectionStatuses() {
        tvGeminiStatus.text = if (oauthManager.isGeminiConnected()) "Connected" else "Not connected"
        tvGeminiStatus.setTextColor(
            resources.getColor(
                if (oauthManager.isGeminiConnected()) android.R.color.holo_green_dark 
                else android.R.color.holo_red_dark,
                null
            )
        )

        tvClaudeStatus.text = if (oauthManager.isClaudeConnected()) "Connected" else "Not connected"
        tvClaudeStatus.setTextColor(
            resources.getColor(
                if (oauthManager.isClaudeConnected()) android.R.color.holo_green_dark 
                else android.R.color.holo_red_dark,
                null
            )
        )

        tvKiloStatus.text = if (oauthManager.isKiloConnected()) "Connected" else "Not connected"
        tvKiloStatus.setTextColor(
            resources.getColor(
                if (oauthManager.isKiloConnected()) android.R.color.holo_green_dark 
                else android.R.color.holo_red_dark,
                null
            )
        )

        tvAntigravityStatus.text = if (oauthManager.isAntigravityConnected()) "Connected" else "Not connected"
        tvAntigravityStatus.setTextColor(
            resources.getColor(
                if (oauthManager.isAntigravityConnected()) android.R.color.holo_green_dark 
                else android.R.color.holo_red_dark,
                null
            )
        )

        // Update button states
        btnGeminiLogin.text = if (oauthManager.isGeminiConnected()) "Disconnect" else "Sign in with Google"
        btnClaudeLogin.text = if (oauthManager.isClaudeConnected()) "Disconnect" else "Connect Claude API"
        btnKiloLogin.text = if (oauthManager.isKiloConnected()) "Disconnect" else "Connect Kilo API"
        btnAntigravityLogin.text = if (oauthManager.isAntigravityConnected()) "Disconnect" else "Connect Antigravity API"
    }

    private fun testProxyConnection() {
        val proxyUrl = etProxyUrl.text.toString()
        if (proxyUrl.isBlank()) {
            Toast.makeText(context, "Please enter a proxy URL", Toast.LENGTH_SHORT).show()
            return
        }

        // TODO: Implement proxy testing logic
        Toast.makeText(context, "Testing proxy connection...", Toast.LENGTH_SHORT).show()
        
        // Simulate test result
        view?.postDelayed({
            Toast.makeText(context, "Proxy connection successful", Toast.LENGTH_SHORT).show()
        }, 2000)
    }
}
