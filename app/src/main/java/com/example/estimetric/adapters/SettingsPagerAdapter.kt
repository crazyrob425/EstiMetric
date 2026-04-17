package com.example.estimetric.adapters

import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentActivity
import androidx.viewpager2.adapter.FragmentStateAdapter
import com.example.estimetric.fragments.*

class SettingsPagerAdapter(activity: FragmentActivity) : FragmentStateAdapter(activity) {

    override fun getItemCount(): Int = 7

    override fun createFragment(position: Int): Fragment {
        return when (position) {
            0 -> AIAPIsFragment()
            1 -> GPSSettingsFragment()
            2 -> PricingPreferencesFragment()
            3 -> AIPersonalityFragment()
            4 -> BidProposalFragment()
            5 -> CloudSyncFragment()
            6 -> UserProfileFragment()
            else -> throw IllegalArgumentException("Invalid position: $position")
        }
    }
}
