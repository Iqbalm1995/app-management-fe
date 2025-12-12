# Date & Time Picker Components Documentation

## Overview

Custom date and time picker components with advanced UI/UX features including:
- Multi-level navigation (Year → Month → Day)
- Android-style vertical spinner time picker (24-hour format)
- Range selection support
- No external libraries required (uses Chakra UI + date-fns)

---

## Components

### 1. DateInput
Single date picker (date only, no time)

### 2. DateTimeInput
Single date and time picker with vertical spinner

### 3. DateRangeInput
Date range picker (two dates, no time)

### 4. DateTimeRangeInput
Date and time range picker with single input

---

## Import

```tsx
import { 
  DateInput, 
  DateTimeInput, 
  DateRangeInput, 
  DateTimeRangeInput 
} from "@/app/components/dateInputs";
```

---

## 1. DateTimeInput (Recommended)

### Usage

```tsx
const [datetime, setDatetime] = useState<string | null>(null);

<DateTimeInput
  value={datetime}
  onChange={setDatetime}
  label="Meeting Time"
  placeholder="Select date and time"
  helperText="Choose when the meeting will start"
  isRequired
  size="md"
/>
```

### Features

**Date Selection:**
- Click month/year → Navigate to Month View
- Click year in Month View → Navigate to Year View
- Year View: 12 years at a time
- Month View: All 12 months
- Day View: Calendar grid with today highlighted

**Time Selection:**
- Android-style vertical spinners
- Hour: 00-23 (24-hour format)
- Minute: 00-59
- Scroll or click to select
- Auto-scrolls to current selection
- Selected value highlighted in blue

**Display Format:**
- Input shows: "MMM dd, yyyy, HH:mm" (e.g., "Dec 12, 2024, 14:30")
- Clock icon on left
- Clear button (X) on right when value exists

### Props

```typescript
interface DateTimeInputProps {
  value: string | null;              // ISO string or null
  onChange: (value: string | null) => void;
  label?: string;                    // Label above input
  placeholder?: string;              // Placeholder text
  helperText?: string;               // Helper text below
  errorMessage?: string;             // Error message (when isInvalid=true)
  isRequired?: boolean;              // Shows required indicator
  isDisabled?: boolean;              // Disables input
  isInvalid?: boolean;               // Shows error state
  minDateTime?: string;              // Minimum allowed datetime
  maxDateTime?: string;              // Maximum allowed datetime
  size?: "sm" | "md" | "lg";        // Input size
}
```

---

## 2. DateTimeRangeInput (Single Input)

### Usage

```tsx
const [startDateTime, setStartDateTime] = useState<string | null>(null);
const [endDateTime, setEndDateTime] = useState<string | null>(null);

<DateTimeRangeInput
  startValue={startDateTime}
  endValue={endDateTime}
  onStartChange={setStartDateTime}
  onEndChange={setEndDateTime}
  label="Task Schedule"
  placeholder="Select start and end date & time"
  size="md"
/>
```

### Features

**Single Input Display:**
- Shows: "MMM dd, HH:mm → MMM dd, HH:mm"
- Example: "Dec 12, 14:30 → Dec 15, 18:00"
- Arrow (→) separates start and end

**Selection Flow:**
1. Select Start Date → Calendar view
2. Select Start Time → Vertical spinners
3. Click "Next" → Moves to End Date
4. Select End Date → Calendar shows range
5. Select End Time → Vertical spinners
6. Click "Done" → Saves and closes

**Visual Feedback:**
- Active selection (start/end) highlighted in blue
- Selected dates highlighted in blue
- Dates in range have light blue background
- Clear indication of what's being selected

### Props

```typescript
interface DateTimeRangeInputProps {
  startValue: string | null;        // Start datetime (ISO string)
  endValue: string | null;          // End datetime (ISO string)
  onStartChange: (value: string | null) => void;
  onEndChange: (value: string | null) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorMessage?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
  size?: "sm" | "md" | "lg";
}
```

---

## 3. DateInput (Date Only)

### Usage

```tsx
const [date, setDate] = useState<string | null>(null);

<DateInput
  value={date}
  onChange={setDate}
  label="Birth Date"
  placeholder="Select date"
  size="md"
/>
```

### Features
- Calendar icon
- Clear button
- Same navigation as DateTimeInput (Year → Month → Day)
- No time selection

---

## 4. DateRangeInput (Date Range Only)

### Usage

```tsx
const [startDate, setStartDate] = useState<string | null>(null);
const [endDate, setEndDate] = useState<string | null>(null);

<DateRangeInput
  startValue={startDate}
  endValue={endDate}
  onStartChange={setStartDate}
  onEndChange={setEndDate}
  label="Project Duration"
  startPlaceholder="Start date"
  endPlaceholder="End date"
  validateRange
  showClearAll
  size="md"
/>
```

### Features
- Two separate inputs side by side
- Arrow separator between inputs
- Individual clear buttons
- "Clear All" button option
- Auto-validation (end >= start)
- Responsive (stacks on mobile)

---

## Value Format

All components use **ISO 8601 string format**:

```typescript
// Example values
"2024-12-12T14:30:00.000Z"  // Full datetime
"2024-12-12T00:00:00.000Z"  // Date only (midnight)

// Setting value
onChange("2024-12-12T14:30:00.000Z")

// Getting value
const date = new Date(value);
const formatted = format(new Date(value), "MMM dd, yyyy");
```

---

## Common Patterns

### 1. Form Integration

```tsx
const [taskForm, setTaskForm] = useState({
  taskName: "",
  taskStartDate: "",
  taskEndDate: "",
});

<DateTimeRangeInput
  startValue={taskForm.taskStartDate || null}
  endValue={taskForm.taskEndDate || null}
  onStartChange={(value) =>
    setTaskForm((prev) => ({ ...prev, taskStartDate: value || "" }))
  }
  onEndChange={(value) =>
    setTaskForm((prev) => ({ ...prev, taskEndDate: value || "" }))
  }
  label="Schedule"
/>
```

### 2. Validation

```tsx
const [datetime, setDatetime] = useState<string | null>(null);
const [error, setError] = useState("");

const handleChange = (value: string | null) => {
  setDatetime(value);
  if (value && new Date(value) < new Date()) {
    setError("Date must be in the future");
  } else {
    setError("");
  }
};

<DateTimeInput
  value={datetime}
  onChange={handleChange}
  isInvalid={!!error}
  errorMessage={error}
/>
```

### 3. Min/Max Constraints

```tsx
const minDate = new Date().toISOString(); // Today
const maxDate = new Date(2025, 11, 31).toISOString(); // End of 2025

<DateTimeInput
  value={datetime}
  onChange={setDatetime}
  minDateTime={minDate}
  maxDateTime={maxDate}
/>
```

---

## Styling

All components:
- ✅ Use Chakra UI theme colors
- ✅ Support light/dark mode
- ✅ Use `radiusStyle` constant for consistent borders
- ✅ Responsive design
- ✅ Accessible (ARIA labels, keyboard navigation)

---

## Technical Details

### Dependencies
- `@chakra-ui/react` - UI components
- `date-fns` - Date formatting
- `react-icons/fi` - Feather icons

### File Structure
```
src/app/components/
├── DateInput.tsx              (~100 lines)
├── DateTimeInput.tsx          (~450 lines)
├── DateRangeInput.tsx         (~220 lines)
├── DateTimeRangeInput.tsx     (~400 lines)
└── dateInputs.ts              (exports)
```

### Key Features
- **No external date picker library** - Custom implementation
- **Android-style time picker** - Vertical scrollable spinners
- **Multi-level navigation** - Year → Month → Day drill-down
- **Range selection** - Visual feedback for date ranges
- **Auto-scroll** - Spinners auto-scroll to selected value
- **Smooth animations** - Transitions and hover effects

---

## Best Practices

### ✅ DO
- Use DateTimeRangeInput for start/end datetime pairs
- Use DateTimeInput for single datetime values
- Store values as ISO strings in state
- Validate ranges (end >= start)
- Provide clear labels and placeholders

### ❌ DON'T
- Don't use native `<input type="datetime-local">`
- Don't store Date objects in state (use ISO strings)
- Don't forget to handle null values
- Don't mix DateInput with DateTimeInput for ranges

---

## Examples in Codebase

### Current Usage
```typescript
// File: src/app/(pages)/workspace/project/projectWorkspace.tsx
// Line: ~4500

<DateTimeRangeInput
  startValue={taskForm.taskStartDate || null}
  endValue={taskForm.taskEndDate || null}
  onStartChange={(value) =>
    setTaskForm((prev) => ({ ...prev, taskStartDate: value || "" }))
  }
  onEndChange={(value) =>
    setTaskForm((prev) => ({ ...prev, taskEndDate: value || "" }))
  }
  label="Task Schedule"
  placeholder="Select start and end date & time"
  size="md"
/>
```

---

## Troubleshooting

### Issue: "Rendered more hooks than during the previous render"
**Solution:** Ensure `useEffect` is at component top level, not inside render functions.

### Issue: Spinner doesn't auto-scroll
**Solution:** Check that refs are properly attached and setTimeout delay is sufficient (100ms).

### Issue: Range validation not working
**Solution:** Ensure both start and end values are ISO strings and use `new Date()` for comparison.

### Issue: Dark mode colors incorrect
**Solution:** Use `useColorMode()` hook and theme-aware colors from Chakra UI.

---

## Future Enhancements

Potential improvements:
- [ ] Keyboard shortcuts (arrow keys for navigation)
- [ ] Quick select buttons (Today, Tomorrow, Next Week)
- [ ] Time presets (9:00 AM, 5:00 PM, etc.)
- [ ] Custom date formats
- [ ] Timezone support
- [ ] Recurring date patterns

---

## Support

For issues or questions:
1. Check this documentation
2. Review example usage in projectWorkspace.tsx
3. Check component source code for implementation details

**Last Updated:** December 12, 2024
**Version:** 1.0.0
