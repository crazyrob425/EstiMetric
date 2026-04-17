package com.example.estimetric.fragments

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.fragment.app.Fragment
import com.example.estimetric.R
import com.example.estimetric.utils.SettingsManager

class UserProfileFragment : Fragment() {

    private lateinit var settingsManager: SettingsManager

    // UI Components
    private lateinit var etFullName: EditText
    private lateinit var etJobTitle: EditText
    private lateinit var etCompanyName: EditText
    private lateinit var etPosition: EditText
    private lateinit var etCompanyEmail: EditText
    private lateinit var etPhoneNumber: EditText
    private lateinit var etWebsite: EditText
    private lateinit var etBaseHourlyRate: EditText
    private lateinit var seekbarExperience: SeekBar
    private lateinit var tvExperienceYears: TextView
    private lateinit var spinnerSpecialization: Spinner
    private lateinit var etServiceArea: EditText
    private lateinit var switchReceiveOffers: Switch
    private lateinit var switchPublicProfile: Switch
    private lateinit var switchShowCertifications: Switch
    private lateinit var checkboxResidential: CheckBox
    private lateinit var checkboxCommercial: CheckBox
    private lateinit var checkboxIndustrial: CheckBox
    private lateinit var checkboxGovernment: CheckBox
    private lateinit var etBio: EditText
    private lateinit var tvBioCharCount: TextView
    private lateinit var btnSaveProfile: Button
    private lateinit var btnPreviewProfile: Button

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_user_profile, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        settingsManager = SettingsManager(requireContext())
        
        initializeViews(view)
        setupClickListeners()
        loadSettings()
    }

    private fun initializeViews(view: View) {
        etFullName = view.findViewById(R.id.et_full_name)
        etJobTitle = view.findViewById(R.id.et_job_title)
        etCompanyName = view.findViewById(R.id.et_company_name)
        etPosition = view.findViewById(R.id.et_position)
        etCompanyEmail = view.findViewById(R.id.et_company_email)
        etPhoneNumber = view.findViewById(R.id.et_phone_number)
        etWebsite = view.findViewById(R.id.et_website)
        etBaseHourlyRate = view.findViewById(R.id.et_base_hourly_rate)
        seekbarExperience = view.findViewById(R.id.seekbar_experience)
        tvExperienceYears = view.findViewById(R.id.tv_experience_years)
        spinnerSpecialization = view.findViewById(R.id.spinner_specialization)
        etServiceArea = view.findViewById(R.id.et_service_area)
        switchReceiveOffers = view.findViewById(R.id.switch_receive_offers)
        switchPublicProfile = view.findViewById(R.id.switch_public_profile)
        switchShowCertifications = view.findViewById(R.id.switch_show_certifications)
        checkboxResidential = view.findViewById(R.id.checkbox_residential)
        checkboxCommercial = view.findViewById(R.id.checkbox_commercial)
        checkboxIndustrial = view.findViewById(R.id.checkbox_industrial)
        checkboxGovernment = view.findViewById(R.id.checkbox_government)
        etBio = view.findViewById(R.id.et_bio)
        tvBioCharCount = view.findViewById(R.id.tv_bio_char_count)
        btnSaveProfile = view.findViewById(R.id.btn_save_profile)
        btnPreviewProfile = view.findViewById(R.id.btn_preview_profile)

        // Setup specialization spinner
        setupSpecializationSpinner()
    }

    private fun setupSpecializationSpinner() {
        val specializations = arrayOf(
            "General Contracting",
            "Electrical",
            "Plumbing",
            "HVAC",
            "Roofing",
            "Landscaping",
            "Painting",
            "Flooring",
            "Carpentry",
            "Concrete",
            "Insulation",
            "Windows & Doors",
            "Other"
        )
        val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, specializations)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerSpecialization.adapter = adapter
    }

    private fun setupClickListeners() {
        seekbarExperience.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                tvExperienceYears.text = "$progress years"
                if (fromUser) {
                    settingsManager.setYearsOfExperience(progress)
                }
            }

            override fun onStartTrackingTouch(seekBar: SeekBar?) {}

            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })

        spinnerSpecialization.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                val specialization = parent?.getItemAtPosition(position).toString()
                settingsManager.setSpecialization(specialization)
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        switchReceiveOffers.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setReceiveOffersEnabled(isChecked)
        }

        switchPublicProfile.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setPublicProfileEnabled(isChecked)
        }

        switchShowCertifications.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setShowCertificationsEnabled(isChecked)
        }

        checkboxResidential.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setResidentialProjectsEnabled(isChecked)
        }

        checkboxCommercial.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setCommercialProjectsEnabled(isChecked)
        }

        checkboxIndustrial.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setIndustrialProjectsEnabled(isChecked)
        }

        checkboxGovernment.setOnCheckedChangeListener { _, isChecked ->
            settingsManager.setGovernmentProjectsEnabled(isChecked)
        }

        // Bio character counter
        etBio.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}

            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                tvBioCharCount.text = "${s?.length ?: 0}/500 characters"
            }

            override fun afterTextChanged(s: Editable?) {}
        })

        btnSaveProfile.setOnClickListener {
            saveProfile()
        }

        btnPreviewProfile.setOnClickListener {
            previewProfile()
        }

        // Text field listeners
        etFullName.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                settingsManager.setFullName(etFullName.text.toString())
            }
        }

        etJobTitle.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                settingsManager.setJobTitle(etJobTitle.text.toString())
            }
        }

        etCompanyName.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                settingsManager.setCompanyName(etCompanyName.text.toString())
            }
        }

        etPosition.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                settingsManager.setPosition(etPosition.text.toString())
            }
        }

        etCompanyEmail.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                settingsManager.setCompanyEmail(etCompanyEmail.text.toString())
            }
        }

        etPhoneNumber.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                settingsManager.setPhoneNumber(etPhoneNumber.text.toString())
            }
        }

        etWebsite.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                settingsManager.setWebsite(etWebsite.text.toString())
            }
        }

        etBaseHourlyRate.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                val rate = etBaseHourlyRate.text.toString()
                if (rate.isNotBlank()) {
                    settingsManager.setBaseHourlyRate(rate.toDoubleOrNull() ?: 0.0)
                }
            }
        }

        etServiceArea.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                settingsManager.setServiceArea(etServiceArea.text.toString())
            }
        }

        etBio.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                settingsManager.setBio(etBio.text.toString())
            }
        }
    }

    private fun loadSettings() {
        // Personal information
        etFullName.setText(settingsManager.getFullName())
        etJobTitle.setText(settingsManager.getJobTitle())
        etCompanyName.setText(settingsManager.getCompanyName())
        etPosition.setText(settingsManager.getPosition())

        // Contact information
        etCompanyEmail.setText(settingsManager.getCompanyEmail())
        etPhoneNumber.setText(settingsManager.getPhoneNumber())
        etWebsite.setText(settingsManager.getWebsite())

        // Professional details
        val baseRate = settingsManager.getBaseHourlyRate()
        if (baseRate > 0) {
            etBaseHourlyRate.setText(baseRate.toString())
        }

        val experience = settingsManager.getYearsOfExperience()
        seekbarExperience.progress = experience
        tvExperienceYears.text = "$experience years"

        val specialization = settingsManager.getSpecialization()
        val specializations = arrayOf(
            "General Contracting",
            "Electrical",
            "Plumbing",
            "HVAC",
            "Roofing",
            "Landscaping",
            "Painting",
            "Flooring",
            "Carpentry",
            "Concrete",
            "Insulation",
            "Windows & Doors",
            "Other"
        )
        spinnerSpecialization.setSelection(specializations.indexOf(specialization))

        etServiceArea.setText(settingsManager.getServiceArea())

        // Business preferences
        switchReceiveOffers.isChecked = settingsManager.isReceiveOffersEnabled()
        switchPublicProfile.isChecked = settingsManager.isPublicProfileEnabled()
        switchShowCertifications.isChecked = settingsManager.isShowCertificationsEnabled()

        // Project types
        checkboxResidential.isChecked = settingsManager.isResidentialProjectsEnabled()
        checkboxCommercial.isChecked = settingsManager.isCommercialProjectsEnabled()
        checkboxIndustrial.isChecked = settingsManager.isIndustrialProjectsEnabled()
        checkboxGovernment.isChecked = settingsManager.isGovernmentProjectsEnabled()

        // Bio
        val bio = settingsManager.getBio()
        etBio.setText(bio)
        tvBioCharCount.text = "${bio.length}/500 characters"
    }

    private fun saveProfile() {
        // Save all fields
        settingsManager.setFullName(etFullName.text.toString())
        settingsManager.setJobTitle(etJobTitle.text.toString())
        settingsManager.setCompanyName(etCompanyName.text.toString())
        settingsManager.setPosition(etPosition.text.toString())
        settingsManager.setCompanyEmail(etCompanyEmail.text.toString())
        settingsManager.setPhoneNumber(etPhoneNumber.text.toString())
        settingsManager.setWebsite(etWebsite.text.toString())
        
        val rate = etBaseHourlyRate.text.toString()
        if (rate.isNotBlank()) {
            settingsManager.setBaseHourlyRate(rate.toDoubleOrNull() ?: 0.0)
        }
        
        settingsManager.setServiceArea(etServiceArea.text.toString())
        settingsManager.setBio(etBio.text.toString())

        Toast.makeText(context, "Profile saved successfully", Toast.LENGTH_SHORT).show()
    }

    private fun previewProfile() {
        val profileInfo = buildString {
            append("Profile Preview\n\n")
            append("Name: ${etFullName.text}\n")
            append("Title: ${etJobTitle.text}\n")
            append("Company: ${etCompanyName.text}\n")
            append("Email: ${etCompanyEmail.text}\n")
            append("Phone: ${etPhoneNumber.text}\n")
            append("Rate: $${etBaseHourlyRate.text}/hour\n")
            append("Experience: ${tvExperienceYears.text}\n")
            append("Specialization: ${spinnerSpecialization.selectedItem}\n")
            append("Service Area: ${etServiceArea.text}\n")
            if (etBio.text.isNotBlank()) {
                append("\nBio:\n${etBio.text}")
            }
        }

        // Show preview dialog
        val builder = android.app.AlertDialog.Builder(requireContext())
        builder.setTitle("Profile Preview")
        builder.setMessage(profileInfo)
        builder.setPositiveButton("OK", null)
        builder.show()
    }
}
