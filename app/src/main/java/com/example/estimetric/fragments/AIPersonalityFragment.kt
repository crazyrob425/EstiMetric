package com.example.estimetric.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.fragment.app.Fragment
import com.example.estimetric.R
import com.example.estimetric.utils.SettingsManager

class AIPersonalityFragment : Fragment() {

    private lateinit var settingsManager: SettingsManager

    // UI Components
    private lateinit var spinnerCommunicationStyle: Spinner
    private lateinit var seekbarFormality: SeekBar
    private lateinit var tvFormalityValue: TextView
    private lateinit var seekbarDetailLevel: SeekBar
    private lateinit var tvDetailValue: TextView
    private lateinit var switchProactiveSuggestions: Switch
    private lateinit var switchLearningMode: Switch
    private lateinit var switchContextAwareness: Switch
    private lateinit var switchHumorEnabled: Switch
    private lateinit var seekbarCreativity: SeekBar
    private lateinit var tvCreativityValue: TextView
    private lateinit var checkboxConstruction: CheckBox
    private lateinit var checkboxMaterials: CheckBox
    private lateinit var checkboxProjectManagement: CheckBox
    private lateinit var checkboxLocalRegulations: CheckBox
    private lateinit var checkboxIndustryTrends: CheckBox
    private lateinit var switchVoiceEnabled: Switch
    private lateinit var spinnerVoiceType: Spinner
    private lateinit var seekbarSpeechSpeed: SeekBar
    private lateinit var tvSpeechSpeedValue: TextView

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_ai_personality, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        settingsManager = SettingsManager(requireContext())
        
        initializeViews(view)
        setupClickListeners()
        loadSettings()
    }

    private fun initializeViews(view: View) {
        spinnerCommunicationStyle = view.findViewById(R.id.spinner_communication_style)
        seekbarFormality = view.findViewById(R.id.seekbar_formality)
        tvFormalityValue = view.findViewById(R.id.tv_formality_value)
        seekbarDetailLevel = view.findViewById(R.id.seekbar_detail_level)
        tvDetailValue = view.findViewById(R.id.tv_detail_value)
        switchProactiveSuggestions = view.findViewById(R.id.switch_proactive_suggestions)
        switchLearningMode = view.findViewById(R.id.switch_learning_mode)
        switchContextAwareness = view.findViewById(R.id.switch_context_awareness)
        switchHumorEnabled = view.findViewById(R.id.switch_humor_enabled)
        seekbarCreativity = view.findViewById(R.id.seekbar_creativity)
        tvCreativityValue = view.findViewById(R.id.tv_creativity_value)
        checkboxConstruction = view.findViewById(R.id.checkbox_construction)
        checkboxMaterials = view.findViewById(R.id.checkbox_materials)
        checkboxProjectManagement = view.findViewById(R.id.checkbox_project_management)
        checkboxLocalRegulations = view.findViewById(R.id.checkbox_local_regulations)
        checkboxIndustryTrends = view.findViewById(R.id.checkbox_industry_trends)
        switchVoiceEnabled = view.findViewById(R.id.switch_voice_enabled)
        spinnerVoiceType = view.findViewById(R.id.spinner_voice_type)
        seekbarSpeechSpeed = view.findViewById(R.id.seekbar_speech_speed)
        tvSpeechSpeedValue = view.findViewById(R.id.tv_speech_speed_value)

        // Setup spinners
        setupCommunicationStyleSpinner()
        setupVoiceTypeSpinner()
    }

    private fun setupCommunicationStyleSpinner() {
        val styles = arrayOf("Professional", "Friendly", "Technical", "Casual", "Formal", "Conversational")
        val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, styles)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerCommunicationStyle.adapter = adapter
    }

    private fun setupVoiceTypeSpinner() {
        val voices = arrayOf("Natural Male", "Natural Female", "Professional Male", "Professional Female", "Friendly Male", "Friendly Female")
        val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, voices)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerVoiceType.adapter = adapter
    }

    private fun setupClickListeners() {
        spinnerCommunicationStyle.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                val style = parent?.getItemAtPosition(position).toString()
                settingsManager.setCommunicationStyle(style)
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        seekbarFormality.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                tvFormalityValue.text = progress.toString()
                if (fromUser) {
                    settingsManager.setFormalityLevel(progress)
                }
            }

            override fun onStartTrackingTouch(seekBar: SeekBar?) {}

            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })

        seekbarDetailLevel.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                tvDetailValue.text = progress.toString()
                if (fromUser) {
                    settingsManager.setDetailLevel(progress)
                }
            }

            override fun onStartTrackingTouch(seekBar: SeekBar?) {}

            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })

        switchProactiveSuggestions.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setProactiveSuggestionsEnabled(isChecked)
        }

        switchLearningMode.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setLearningModeEnabled(isChecked)
        }

        switchContextAwareness.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setContextAwarenessEnabled(isChecked)
        }

        switchHumorEnabled.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setHumorEnabled(isChecked)
        }

        seekbarCreativity.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                tvCreativityValue.text = progress.toString()
                if (fromUser) {
                    settingsManager.setCreativityLevel(progress)
                }
            }

            override fun onStartTrackingTouch(seekBar: SeekBar?) {}

            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })

        checkboxConstruction.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setConstructionKnowledgeEnabled(isChecked)
        }

        checkboxMaterials.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setMaterialsKnowledgeEnabled(isChecked)
        }

        checkboxProjectManagement.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setProjectManagementKnowledgeEnabled(isChecked)
        }

        checkboxLocalRegulations.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setLocalRegulationsKnowledgeEnabled(isChecked)
        }

        checkboxIndustryTrends.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setIndustryTrendsKnowledgeEnabled(isChecked)
        }

        switchVoiceEnabled.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setVoiceEnabled(isChecked)
            spinnerVoiceType.isEnabled = isChecked
            seekbarSpeechSpeed.isEnabled = isChecked
        }

        spinnerVoiceType.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                val voiceType = parent?.getItemAtPosition(position).toString()
                settingsManager.setVoiceType(voiceType)
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        seekbarSpeechSpeed.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                tvSpeechSpeedValue.text = progress.toString()
                if (fromUser) {
                    settingsManager.setSpeechSpeed(progress)
                }
            }

            override fun onStartTrackingTouch(seekBar: SeekBar?) {}

            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })
    }

    private fun loadSettings() {
        // Communication style
        val communicationStyle = settingsManager.getCommunicationStyle()
        val styles = arrayOf("Professional", "Friendly", "Technical", "Casual", "Formal", "Conversational")
        spinnerCommunicationStyle.setSelection(styles.indexOf(communicationStyle))

        // Personality sliders
        val formalityLevel = settingsManager.getFormalityLevel()
        seekbarFormality.progress = formalityLevel
        tvFormalityValue.text = formalityLevel.toString()

        val detailLevel = settingsManager.getDetailLevel()
        seekbarDetailLevel.progress = detailLevel
        tvDetailValue.text = detailLevel.toString()

        val creativityLevel = settingsManager.getCreativityLevel()
        seekbarCreativity.progress = creativityLevel
        tvCreativityValue.text = creativityLevel.toString()

        // Behavior switches
        switchProactiveSuggestions.isChecked = settingsManager.isProactiveSuggestionsEnabled()
        switchLearningMode.isChecked = settingsManager.isLearningModeEnabled()
        switchContextAwareness.isChecked = settingsManager.isContextAwarenessEnabled()
        switchHumorEnabled.isChecked = settingsManager.isHumorEnabled()

        // Knowledge areas
        checkboxConstruction.isChecked = settingsManager.isConstructionKnowledgeEnabled()
        checkboxMaterials.isChecked = settingsManager.isMaterialsKnowledgeEnabled()
        checkboxProjectManagement.isChecked = settingsManager.isProjectManagementKnowledgeEnabled()
        checkboxLocalRegulations.isChecked = settingsManager.isLocalRegulationsKnowledgeEnabled()
        checkboxIndustryTrends.isChecked = settingsManager.isIndustryTrendsKnowledgeEnabled()

        // Voice settings
        switchVoiceEnabled.isChecked = settingsManager.isVoiceEnabled()
        spinnerVoiceType.isEnabled = settingsManager.isVoiceEnabled()
        seekbarSpeechSpeed.isEnabled = settingsManager.isVoiceEnabled()

        val voiceType = settingsManager.getVoiceType()
        val voices = arrayOf("Natural Male", "Natural Female", "Professional Male", "Professional Female", "Friendly Male", "Friendly Female")
        spinnerVoiceType.setSelection(voices.indexOf(voiceType))

        val speechSpeed = settingsManager.getSpeechSpeed()
        seekbarSpeechSpeed.progress = speechSpeed
        tvSpeechSpeedValue.text = speechSpeed.toString()
    }
}
