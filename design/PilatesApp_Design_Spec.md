# Pilates Pro: iOS App Design Specification
**Role:** Senior UI/UX Designer
**Target Audience:** Middle School Students & Beginners
**Platform:** iOS (iPhone 16 Pro, 393pt width)
**Design System:** "Energetic & Approachable"

---

## 1. Design Principles (HIG Alignment)
*   **Clarity**: Large, legible typography (SF Pro Rounded) to make instructions easy to read during movement.
*   **Deference**: The UI recedes; content (workout videos and progress rings) takes center stage.
*   **Depth**: Use subtle shadows and layers to denote hierarchy (floating controls over video).
*   **Color Strategy**: High energy but not aggressive.
    *   **Primary**: `Luminous Mint (#4ADE80)` - Fresh, energetic, implies growth.
    *   **Secondary**: `Ocean Blue (#3B82F6)` - Trust, calm.
    *   **Background**: `Pure White (#FFFFFF)` with `Light Gray (#F3F4F6)` grouping areas.

---

## 2. Information Architecture & User Flow

```mermaid
graph TD
    A[Launch App] --> B{Logged In?}
    B -- No --> C[Onboarding & Registration]
    B -- Yes --> D[Home Tab (Dashboard)]
    
    D --> E[Workout Player]
    D --> F[Tab 2: Library]
    D --> G[Tab 3: Progress]
    D --> H[Tab 4: Profile/Settings]

    F --> E
    E --> I[Summary & Badge Award]
    I --> D
```

---

## 3. Prototype Screens

### Section A: Onboarding & Home

#### Screen 1: Welcome & Onboarding
*   **Layout**: Full-screen background video of a teenager doing a simple stretch in a bright room.
*   **Overlay**: Semi-transparent gradient from bottom (black 60% to transparent).
*   **Content**:
    *   **Logo**: Centered, top 30%. White stylized "P" icon.
    *   **Headline**: "Find Your Core Power." (SF Pro Rounded, Bold, 34pt, White).
    *   **Subhead**: "Simple pilates for students. Stronger posture, better focus."
    *   **Action**: "Get Started" Button (Pill shape, Mint Green background, Black text).
*   **Design Note**: Captures attention immediately. The copy is empowering for the target age group.

#### Screen 2: Home Dashboard ("The Hub")
*   **Header**: "Good Afternoon, Alex! 👋"
*   **Hero Section**: **"Daily Streak Ring"**.
    *   A large, central Activity Ring (Apple Style) showing 15/30 mins.
    *   Inside the ring: "15 min remaining".
*   **Section: "Up Next"**:
    *   Card: "After-School Decompress".
    *   Visual: Thumbnail of a spine roll-down.
    *   Tags: 10 min • Beginner • No Equipment.
    *   Action: Big "Play" button overlay.
*   **Bottom Tab Bar**: Home (Active), Explore, Progress, Me.
*   **Design Note**: Prioritizes the "next step" to reduce friction. The ring provides instant visual status.

---

### Section B: Core Experience

#### Screen 3: Workout Library (Explore)
*   **Search**: iOS Native Search Bar ("Search pose, pain relief...").
*   **Filter Pills**: Horizontal scroll (Neck Pain, Core, Sleep, Posture).
*   **Layout**: 2-Column Masonry Grid.
    *   **Card 1**: "Text Neck Relief". Visual: Neck stretch. Badge: "Popular".
    *   **Card 2**: "Core Blaster L1". Visual: The Hundred pose.
*   **Interaction**: Tapping a card expands it using a seamless shared-element transition into the details view.
*   **Design Note**: Uses terminology relevant to students (e.g., "Text Neck", "Exam Stress").

#### Screen 4: Workout Player
*   **Video**: Takes up top 70% of screen. Clear visual demonstration.
*   **Controls Layer (Bottom Sheet)**:
    *   **Timer**: Large Countdown "00:45".
    *   **Instruction**: "Keep your lower back pressed to the mat." (Large text).
    *   **Haptic Feedback**: Phone vibrates on 3-2-1 countdown.
    *   **Controls**: Pause (Center), Skip (Right), Voice Toggle (Left).
*   **Design Note**: High contrast UI elements ensure visibility even when the phone is placed on the floor/mat.

---

### Section C: Motivation & Retention

#### Screen 5: Progress Tracker
*   **Chart**: "Weekly Activity". Bar chart using rounded bars (Mint Green).
    *   X-Axis: M T W T F S S.
    *   Highlight: Current day bar is animated/pulsing.
*   **Stats Grid**:
    *   Square 1: "Total Workouts" (12).
    *   Square 2: "Posture Score" (A+).
*   **Calendar Heatmap**: Small dots showing activity over the month (Github style but dots are flowers or stars).
*   **Design Note**: Visualizing consistency over intensity. The "Posture Score" gamifies the health benefit.

#### Screen 6: Community & Achievements
*   **Achievement Wall**: Grid of badges.
    *   Unlocked: "Early Bird" (Bright Colors).
    *   Locked: "Plank Master" (Greyscale silhouette).
*   **Friend Activity**:
    *   List item: "Sarah completed 'Morning Flow'".
    *   Reaction: "High Five" button (Small hand icon).
*   **Design Note**: Social proof is critical for the middle school demographic. Positive reinforcement only.

---

### Section D: Settings

#### Screen 7: Profile & Settings
*   **Header**: Large Avatar with editable ring color.
*   **List Group (Inset Grouped Style)**:
    *   **My Plan**: "Beginner Level 1" >
    *   **Reminders**: "Daily at 7:00 PM" (Toggle ON).
    *   **Accessibility**: "High Contrast Mode", "Voice Descriptions".
    *   **Dark Mode**: Toggle.
*   **Design Note**: Adheres strictly to iOS system settings patterns for familiarity.

---

## 4. Design Guidelines Overview

### Typography
| Style | Font | Size | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Large Title** | SF Pro Rounded | 34pt | Bold | Page Headers |
| **Title 2** | SF Pro Rounded | 22pt | Semibold | Section Headers |
| **Body** | SF Pro Text | 17pt | Regular | Main content, Instructions |
| **Caption** | SF Pro Text | 12pt | Medium | Metadata, Timestamps |

### Spacing & Layout
*   **Margins**: 16pt (standard), 24pt (loose).
*   **Corner Radius**:
    *   Cards: 20pt (Smooth, organic feel).
    *   Buttons: 30pt (Pill shape).
*   **Touch Targets**: Minimum 44x44pt for all interactive elements to ensure accessibility.

### Accessibility Considerations
*   **Color Contrast**: All text meets WCAG AA standards (4.5:1 ratio).
*   **Dynamic Type**: Layouts support dynamic font scaling up to 200%.
*   **Audio/Visual**: All audio instructions have synchronized text captions.
