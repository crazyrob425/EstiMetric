# SWEEP.md - EstiMetric Project Guidelines

> This file contains project rules, commands, and guidelines for AI coding assistants and developers.

---

## 📁 Project Overview

**Project Name:** EstiMetric
**Platform:** Android
**IDE:** Android Studio
**Language(s):** Kotlin (primary), Java (if needed)

---

## 🛠️ Terminal Commands

### Build Commands

```powershell
# Clean the project
./gradlew clean

# Build debug APK
./gradlew assembleDebug

# Build release APK
./gradlew assembleRelease

# Build and install debug APK on connected device
./gradlew installDebug

# Clean and rebuild the entire project
./gradlew clean build
```

### Test Commands

```powershell
# Run all unit tests
./gradlew test

# Run unit tests for debug variant
./gradlew testDebugUnitTest

# Run instrumented tests on connected device/emulator
./gradlew connectedAndroidTest

# Run a specific test class
./gradlew test --tests "com.example.MyTestClass"

# Run tests with detailed output
./gradlew test --info
```

### Lint & Code Quality

```powershell
# Run Android Lint
./gradlew lint

# Run lint for debug variant only
./gradlew lintDebug

# Run ktlint (if configured)
./gradlew ktlintCheck

# Format code with ktlint (if configured)
./gradlew ktlintFormat

# Run detekt (if configured)
./gradlew detekt
```

### Dependency Management

```powershell
# List all dependencies
./gradlew dependencies

# List dependencies for a specific module
./gradlew :app:dependencies

# Check for dependency updates (requires plugin)
./gradlew dependencyUpdates

# Refresh dependencies
./gradlew --refresh-dependencies
```

### Gradle Utilities

```powershell
# List all available Gradle tasks
./gradlew tasks

# List tasks for a specific module
./gradlew :app:tasks

# Run with debug logging
./gradlew assembleDebug --debug

# Run with stacktrace on error
./gradlew assembleDebug --stacktrace

# Stop Gradle daemon
./gradlew --stop

# Check Gradle version
./gradlew --version
```

### ADB Commands

```powershell
# List connected devices
adb devices

# Install APK manually
adb install app/build/outputs/apk/debug/app-debug.apk

# Uninstall app
adb uninstall com.example.estimetric

# View device logs (Logcat)
adb logcat

# Filter logs by tag
adb logcat -s "MyTag"

# Clear app data
adb shell pm clear com.example.estimetric

# Take screenshot
adb exec-out screencap -p > screenshot.png

# Record screen
adb shell screenrecord /sdcard/recording.mp4
```

---

## 📐 Code Style Preferences

### Kotlin Style Guidelines

- Use **camelCase** for variables and functions
- Use **PascalCase** for classes and interfaces
- Use **SCREAMING_SNAKE_CASE** for constants
- Prefer `val` over `var` when possible (immutability)
- Use data classes for simple data holders
- Use sealed classes for restricted hierarchies
- Prefer extension functions for utility operations
- Use coroutines for asynchronous operations
- Follow single responsibility principle

### File Organization

```
app/
├── src/
│   ├── main/
│   │   ├── java/com/example/estimetric/
│   │   │   ├── data/           # Data layer (repositories, data sources)
│   │   │   ├── domain/         # Domain layer (use cases, models)
│   │   │   ├── presentation/   # UI layer (activities, fragments, viewmodels)
│   │   │   ├── di/             # Dependency injection modules
│   │   │   └── utils/          # Utility classes and extensions
│   │   ├── res/                # Resources (layouts, drawables, values)
│   │   └── AndroidManifest.xml
│   ├── test/                   # Unit tests
│   └── androidTest/            # Instrumented tests
├── build.gradle.kts            # Module-level build file
└── proguard-rules.pro          # ProGuard rules
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Activity | `*Activity` | `MainActivity`, `SettingsActivity` |
| Fragment | `*Fragment` | `HomeFragment`, `ProfileFragment` |
| ViewModel | `*ViewModel` | `HomeViewModel`, `UserViewModel` |
| Repository | `*Repository` | `UserRepository`, `DataRepository` |
| Use Case | `*UseCase` | `GetUserUseCase`, `LoginUseCase` |
| Adapter | `*Adapter` | `ItemAdapter`, `UserListAdapter` |
| Layout files | `type_name` | `activity_main`, `fragment_home`, `item_user` |
| Drawable | `ic_*` or `bg_*` | `ic_arrow_back`, `bg_button_primary` |

---

## 🏗️ Architecture

### Recommended: MVVM + Clean Architecture

```
Presentation Layer (UI)
    ↓
ViewModel (State Management)
    ↓
Use Cases / Interactors (Business Logic)
    ↓
Repository (Data Abstraction)
    ↓
Data Sources (Remote API / Local DB)
```

### Libraries & Dependencies (Common)

- **UI:** Jetpack Compose or XML Views with Material Design
- **Navigation:** Jetpack Navigation Component
- **DI:** Hilt or Koin
- **Networking:** Retrofit + OkHttp
- **JSON Parsing:** Kotlinx Serialization or Moshi
- **Database:** Room
- **Async:** Kotlin Coroutines + Flow
- **Image Loading:** Coil or Glide
- **Testing:** JUnit, MockK, Espresso

---

## ✅ Best Practices

1. **Always read files before editing** - Understand context before making changes
2. **Run lint after changes** - Ensure code quality
3. **Write tests** - Unit tests for business logic, UI tests for critical flows
4. **Use meaningful commit messages** - Follow conventional commits
5. **Handle errors gracefully** - Use Result/Either patterns or try-catch
6. **Avoid hardcoded strings** - Use string resources for localization
7. **Use proper logging** - Use Timber or similar for debug logging
8. **Follow Material Design guidelines** - Consistent UI/UX

---

## 🔧 Environment Setup

### Prerequisites
- JDK 17 or higher
- Android Studio (latest stable)
- Android SDK (API 24+ recommended minimum)
- Gradle (wrapper included)

### First Time Setup
```powershell
# Sync Gradle files
./gradlew wrapper

# Build the project
./gradlew build

# Run on emulator/device
./gradlew installDebug
```

---

## 📝 Notes

<!-- Add project-specific notes, decisions, or important information here -->

- Project-specific configurations and decisions can be documented in this section
- Update this file as the project evolves

---

*Last Updated: [Auto-update this when making changes]*
