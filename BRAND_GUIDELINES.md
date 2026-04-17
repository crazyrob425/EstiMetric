# EstiMetric Brand Guidelines

## Brand Identity

EstiMetric is a professional estimation and metrics tracking application designed to help teams accurately measure, estimate, and track project metrics with confidence.

---

## Color Palette

### Primary Colors
- **Primary Purple**: `#6200EE` - Main brand color, used for primary buttons, headers, key elements
- **Primary Dark**: `#3700B3` - Darker variant for shadows, depth, inactive states
- **Accent Teal**: `#03DAC5` - Secondary accent for highlights, CTAs, success states

### Neutral Colors
- **White**: `#FFFFFF` - Primary background
- **Light Gray**: `#F5F5F5` - Secondary background, cards
- **Medium Gray**: `#EEEEEE` - Dividers, borders
- **Dark Gray**: `#757575` - Secondary text
- **Text Primary**: `#212121` - Main text
- **Text Secondary**: `#757575` - Secondary text
- **Text Hint**: `#BDBDBD` - Disabled, hint text

### Semantic Colors
- **Success Green**: `#4CAF50` - Success messages, confirmations
- **Warning Orange**: `#FF9800` - Warnings, alerts
- **Error Red**: `#F44336` - Errors, deletions
- **Info Blue**: `#2196F3` - Information, notifications

---

## Typography

### Font Family
- **Primary Font**: Roboto (Material Design default)
- **Fallback**: Sans-serif

### Font Sizes & Styles
- **Heading 1 (H1)**: 34sp, Bold - Page titles
- **Heading 2 (H2)**: 28sp, Bold - Section headers
- **Heading 3 (H3)**: 24sp, Medium - Subsection headers
- **Body Large**: 16sp, Regular - Main body text
- **Body Regular**: 14sp, Regular - Standard text
- **Label**: 12sp, Medium - Labels, captions
- **Caption**: 12sp, Regular - Secondary captions

---

## Logo

### Main Logo (ic_app_logo.xml)
- **Composition**: Stylized "E" with metric bars and upward arrow
- **Colors**: Purple background, teal accent, white elements
- **Usage**: App icon, splash screen, marketing materials
- **Minimum Size**: 48dp

### Launcher Icon (ic_launcher_foreground.xml + ic_launcher_background.xml)
- **Format**: Adaptive icon (foreground + background layers)
- **Size**: 192dp (108dp safe zone recommended)
- **Usage**: Home screen icon, app drawer

### Feature Graphic (ic_feature_graphic.xml)
- **Size**: 512dp × 512dp
- **Usage**: Google Play Store, promotional materials
- **Composition**: Vertical bar chart with upward arrow, centered in circle

---

## Icon System

### Standard Icon Size
- **24dp**: UI icons, menu items
- **48dp**: Large buttons, secondary elements
- **96dp**: Feature graphics

### Icon Guidelines
- All icons use solid fills (no gradients)
- Consistent stroke width: 2dp
- Rounded corners: 2dp
- Spacing: Adequate padding around icons
- Primary color: Purple (`#6200EE`)
- Secondary color: Teal (`#03DAC5`)

### Icon Library
- **ic_measurement.xml** - Ruler/measurement icon
- **ic_analytics.xml** - Chart/analytics icon
- **ic_estimation.xml** - Target/estimation icon

---

## Component Styles

### Buttons
- **Primary Button**: Purple background, white text, 12dp rounded corners
- **Secondary Button**: Teal background, white text, 12dp rounded corners
- **Tertiary Button**: Outlined, purple border, white background

### Cards
- **Standard Card**: White background, subtle shadow, 16dp rounded corners
- **Border**: 1dp light gray divider
- **Padding**: 16dp

### Input Fields
- **Border Color**: Medium gray (`#EEEEEE`)
- **Focus Color**: Primary purple (`#6200EE`)
- **Corner Radius**: 8dp

---

## Spacing System

- **Extra Small (4dp)**: Micro spacing between elements
- **Small (8dp)**: Spacing within components
- **Medium (16dp)**: Standard spacing between components
- **Large (24dp)**: Major spacing between sections
- **Extra Large (32dp)**: Screen-level spacing

---

## UI Patterns

### Splash Screen
- **Background**: Gradient (purple to dark blue)
- **Accent Elements**: Teal circular decorations
- **Center Logo**: White circle with centered EstiMetric logo
- **Text**: "EstiMetric" in white, centered at bottom

### Home Screen
- **Header**: Purple background with white text and logo
- **Cards**: Feature cards with teal accent borders
- **CTAs**: Teal buttons with white text

### Navigation
- **Bottom Tab Bar**: Light gray background, active icons purple
- **Sidebar (if used)**: Purple background, white text

---

## Asset Files

All branding assets are located in `app/src/main/res/`:

### Vector Drawables (XML)
```
drawable/
├── ic_app_logo.xml              # Main app logo
├── ic_launcher_foreground.xml   # Launcher icon (foreground)
├── ic_launcher_background.xml   # Launcher icon (background)
├── ic_feature_graphic.xml       # Feature graphic (512dp)
├── ic_splash_background.xml     # Splash screen background
├── ic_measurement.xml           # Measurement icon
├── ic_analytics.xml             # Analytics icon
├── ic_estimation.xml            # Estimation icon
├── bg_card.xml                  # Card background
├── bg_button_primary.xml        # Primary button
└── bg_button_secondary.xml      # Secondary button

values/
└── colors.xml                   # Color definitions
└── themes.xml                   # Theme definitions
```

---

## Usage Examples

### Using Brand Colors in Kotlin
```kotlin
ContextCompat.getColor(context, R.color.primary_purple)
ContextCompat.getColor(context, R.color.accent_teal)
```

### Using Icons in Layouts
```xml
<ImageView
    android:layout_width="24dp"
    android:layout_height="24dp"
    android:src="@drawable/ic_estimation"
    android:tint="@color/primary_purple" />
```

### Using Backgrounds
```xml
<Button
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:background="@drawable/bg_button_primary"
    android:text="Estimate" />
```

---

## Best Practices

1. **Color Usage**: Always use defined colors from `colors.xml`, never hardcode hex values
2. **Icon Consistency**: Use provided icons from the icon library; avoid mixing styles
3. **Typography**: Follow the typography guide for consistent hierarchy
4. **Spacing**: Maintain consistent spacing using the spacing system
5. **Contrast**: Ensure text has sufficient contrast (WCAG AA minimum)
6. **Accessibility**: Always provide content descriptions for icons and images
7. **Brand Integrity**: Keep the logo and core brand elements unchanged

---

## File Modifications & Updates

- **Last Updated**: 2026-04-17
- **Version**: 1.0
- **Designer Notes**: Initial brand identity created with modern Material Design 3 principles
