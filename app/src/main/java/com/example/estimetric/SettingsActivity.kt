package com.example.estimetric

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.viewpager2.widget.ViewPager2
import com.google.android.material.tabs.TabLayout
import com.google.android.material.tabs.TabLayoutMediator
import com.example.estimetric.adapters.SettingsPagerAdapter

class SettingsActivity : AppCompatActivity() {

    private lateinit var viewPager: ViewPager2
    private lateinit var tabLayout: TabLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_settings)

        // Initialize views
        viewPager = findViewById(R.id.view_pager)
        tabLayout = findViewById(R.id.tab_layout)

        // Set up the adapter
        val adapter = SettingsPagerAdapter(this)
        viewPager.adapter = adapter

        // Set up the tabs
        TabLayoutMediator(tabLayout, viewPager) { tab, position ->
            tab.text = when (position) {
                0 -> "AI APIs"
                1 -> "GPS"
                2 -> "Pricing"
                3 -> "AI Personality"
                4 -> "Bids"
                5 -> "Cloud Sync"
                6 -> "Profile"
                else -> "Unknown"
            }
        }.attach()

        // Set up toolbar
        supportActionBar?.apply {
            setDisplayHomeAsUpEnabled(true)
            setDisplayShowHomeEnabled(true)
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressed()
        return true
    }
}
