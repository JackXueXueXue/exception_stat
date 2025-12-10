# TimeFilter Component Technical Implementation

## 1. Component Overview
The `TimeFilter` is a sophisticated, hybrid date-time selector designed for React applications. It resolves the common UX conflict between "quick preset selection" (e.g., Last 24h) and "precise custom range selection" by combining them into a unified interface.

**Key Features:**
*   **Unified Interface**: The calendar and time inputs are always visible, allowing immediate context switching.
*   **Bidirectional Synchronization**: Selecting a preset updates the specific time range; editing the time range updates the preset state.
*   **Range Highlighting**: The visual calendar highlights all days falling within the selected start and end timestamps.

## 2. State Management

The component maintains a local state buffer that only propagates to the parent component upon clicking "Apply".

```typescript
// Controlled State
const [isOpen, setIsOpen] = useState(false);

// Data State
const [selectedPreset, setSelectedPreset] = useState<TimeRangeOption>(value);
const [startDate, setStartDate] = useState<string>(customStartDate || '');
const [endDate, setEndDate] = useState<string>(customEndDate || '');
```

## 3. Core Logic Implementation

### 3.1 Preset to Time Synchronization (Auto-Fill)
When a user selects a preset (e.g., "Past 7 Days"), the component immediately calculates the precise ISO timestamps for that range and updates the inputs.

*   **Trigger**: Clicking a sidebar button (e.g., '7d').
*   **Logic**: `getRangeFromPreset(preset)` calculates `start` and `end` relative to `new Date()`.
*   **Outcome**: The specific date/time inputs are populated, and the calendar visualizes this range immediately.

### 3.2 Time to Preset Synchronization (Custom Override)
Any manual interaction with the precise controls switches the mode to 'custom'.

*   **Trigger**: Typing in the `datetime-local` inputs OR clicking a specific date on the calendar.
*   **Logic**: `setSelectedPreset('custom')`.
*   **Outcome**: The sidebar selection moves to "Custom Range", indicating the user has deviated from standard presets.

### 3.3 Visual Calendar Logic
The calendar renders the current month's grid.

*   **Rendering**: Generates a grid of days, padding the start of the month with empty cells based on `firstDayOfWeek`.
*   **Range Highlighting (`isDaySelected`)**:
    Instead of just matching a single selected date, it checks if a calendar day falls within the time window:
    ```typescript
    targetDate >= startDate && targetDate <= endDate
    ```
    This ensures that if "Last 7 Days" is selected, all 7 days are visually highlighted on the calendar.

*   **Interaction (`handleDayClick`)**:
    Clicking a specific day (e.g., the 15th) is interpreted as "I want to see data for this specific day".
    *   `startDate` -> YYYY-MM-15T00:00
    *   `endDate` -> YYYY-MM-15T23:59
    *   Mode switches to 'custom'.

## 4. Accessibility & UX Details
*   **Dropdown Alignment**: The dropdown is anchored `left-0` to ensure it doesn't overflow the viewport when placed in a left-aligned toolbar.
*   **Click Outside**: A `mousedown` listener on `document` handles closing the dropdown when clicking outside the component area.
*   **Format Handling**: Uses `datetime-local` specific ISO format (no seconds/milliseconds, `T` separator) for input compatibility.
