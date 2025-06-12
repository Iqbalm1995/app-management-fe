import { fullDay, shortDay } from "@/app/constants/applicationConstants";
import { HStack, Button } from "@chakra-ui/react";
import { useState, useEffect } from "react";

interface WeekdaySelectorProps {
  /** initial / controlled value: "Monday, Wednesday" */
  value?: string;
  /** callback returns the updated string */
  onChange?: (val: string) => void;
}

export default function WeekdaySelector({
  value = "",
  onChange,
}: WeekdaySelectorProps) {
  // split the incoming string once, trim empty parts
  const [selected, setSelected] = useState<string[]>(
    value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );

  // if parent passes a new value, sync local state
  useEffect(() => {
    setSelected(
      value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );
  }, [value]);

  const toggleDay = (day: string) => {
    const next = selected.includes(day)
      ? selected.filter((d) => d !== day)
      : [...selected, day];

    setSelected(next);
    onChange?.(next.join(", "));
  };

  return (
    <HStack spacing={2}>
      {fullDay.map((day, i) => {
        const active = selected.includes(day);
        return (
          <Button
            key={day}
            size="sm"
            borderRadius="full"
            w="32px"
            h="32px"
            p={0}
            variant={active ? "solid" : "outline"}
            colorScheme={active ? "secondary" : "gray"}
            onClick={() => toggleDay(day)}
          >
            {shortDay[i]}
          </Button>
        );
      })}
    </HStack>
  );
}
