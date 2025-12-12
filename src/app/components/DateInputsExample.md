# Date Input Components Usage

## Import

```tsx
import { DateInput, DateTimeInput, DateRangeInput, DateTimeRangeInput } from "@/app/components/dateInputs";
```

## DateInput

Single date picker component.

```tsx
const [date, setDate] = useState<string | null>(null);

<DateInput
  value={date}
  onChange={setDate}
  label="Birth Date"
  placeholder="Select your birth date"
  helperText="Choose a date from the calendar"
  isRequired
  size="md"
/>
```

## DateTimeInput

Single date and time picker component.

```tsx
const [datetime, setDatetime] = useState<string | null>(null);

<DateTimeInput
  value={datetime}
  onChange={setDatetime}
  label="Meeting Time"
  placeholder="Select meeting date and time"
  helperText="Choose when the meeting will start"
  isRequired
  size="md"
/>
```

## DateRangeInput

Date range picker with start and end dates.

```tsx
const [startDate, setStartDate] = useState<string | null>(null);
const [endDate, setEndDate] = useState<string | null>(null);

<DateRangeInput
  startValue={startDate}
  endValue={endDate}
  onStartChange={setStartDate}
  onEndChange={setEndDate}
  label="Project Duration"
  startPlaceholder="Project start"
  endPlaceholder="Project end"
  helperText="Select the project timeline"
  validateRange
  showClearAll
  size="md"
/>
```

## DateTimeRangeInput

Date and time range picker with start and end.

```tsx
const [startDateTime, setStartDateTime] = useState<string | null>(null);
const [endDateTime, setEndDateTime] = useState<string | null>(null);

<DateTimeRangeInput
  startValue={startDateTime}
  endValue={endDateTime}
  onStartChange={setStartDateTime}
  onEndChange={setEndDateTime}
  label="Event Schedule"
  startPlaceholder="Event starts"
  endPlaceholder="Event ends"
  helperText="Select the event time range"
  validateRange
  showClearAll
  size="md"
/>
```

## Props

### Common Props (All Components)

- `label?: string` - Label text above the input
- `helperText?: string` - Helper text below the input
- `errorMessage?: string` - Error message (shown when isInvalid=true)
- `isRequired?: boolean` - Shows required indicator
- `isDisabled?: boolean` - Disables the input
- `isInvalid?: boolean` - Shows error state
- `size?: "sm" | "md" | "lg"` - Input size

### Single Input Props (DateInput, DateTimeInput)

- `value: string | null` - Current value (ISO string)
- `onChange: (value: string | null) => void` - Change handler
- `placeholder?: string` - Placeholder text
- `minDate/minDateTime?: string` - Minimum allowed date
- `maxDate/maxDateTime?: string` - Maximum allowed date

### Range Input Props (DateRangeInput, DateTimeRangeInput)

- `startValue: string | null` - Start date/time value
- `endValue: string | null` - End date/time value
- `onStartChange: (value: string | null) => void` - Start change handler
- `onEndChange: (value: string | null) => void` - End change handler
- `startPlaceholder?: string` - Start input placeholder
- `endPlaceholder?: string` - End input placeholder
- `minDate/minDateTime?: string` - Minimum allowed date
- `maxDate/maxDateTime?: string` - Maximum allowed date
- `validateRange?: boolean` - Auto-validate end >= start (default: true)
- `showClearAll?: boolean` - Show "Clear All" button (default: true)

## Features

- ✅ Native browser date/time pickers
- ✅ Clear buttons for easy reset
- ✅ Icon indicators (calendar/clock)
- ✅ Validation support
- ✅ Error states
- ✅ Disabled states
- ✅ Size variants (sm, md, lg)
- ✅ Responsive (range inputs stack on mobile)
- ✅ Accessible
- ✅ Consistent with Chakra UI theme
- ✅ Auto-validation for ranges (end >= start)
