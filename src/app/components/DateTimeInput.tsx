"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Box,
  Grid,
  Button,
  HStack,
  VStack,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { FiClock, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { format } from "date-fns";
import { radiusStyle } from "../constants/applicationConstants";

interface DateTimeInputProps {
  value: string | null;
  onChange: (value: string | null) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorMessage?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
  minDateTime?: string;
  maxDateTime?: string;
  size?: "sm" | "md" | "lg";
}

type ViewMode = "year" | "month" | "day" | "time";

export const DateTimeInput: React.FC<DateTimeInputProps> = ({
  value,
  onChange,
  label,
  placeholder = "Select date and time",
  helperText,
  errorMessage,
  isRequired = false,
  isDisabled = false,
  isInvalid = false,
  minDateTime,
  maxDateTime,
  size = "md",
}) => {
  const { colorMode } = useColorMode();
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  
  const currentDate = value ? new Date(value) : new Date();
  const [viewDate, setViewDate] = useState(currentDate);
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);
  const [selectedHour, setSelectedHour] = useState(currentDate.getHours());
  const [selectedMinute, setSelectedMinute] = useState(currentDate.getMinutes());

  const hourScrollRef = useRef<HTMLDivElement>(null);
  const minuteScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to selected time when time picker opens
  useEffect(() => {
    if (viewMode === "time") {
      setTimeout(() => {
        if (hourScrollRef.current) {
          const itemHeight = 40;
          hourScrollRef.current.scrollTop = selectedHour * itemHeight - itemHeight * 2;
        }
        if (minuteScrollRef.current) {
          const itemHeight = 40;
          minuteScrollRef.current.scrollTop = selectedMinute * itemHeight - itemHeight * 2;
        }
      }, 100);
    }
  }, [viewMode, selectedHour, selectedMinute]);

  const formatDisplay = (datetime: string | null): string => {
    if (!datetime) return "";
    try {
      return format(new Date(datetime), "MMM dd, yyyy, HH:mm");
    } catch {
      return "";
    }
  };

  const handleClear = () => {
    onChange(null);
    setSelectedDate(null);
    setIsOpen(false);
  };

  // Year View
  const renderYearView = () => {
    const currentYear = viewDate.getFullYear();
    const startYear = Math.floor(currentYear / 12) * 12;
    const years = Array.from({ length: 12 }, (_, i) => startYear + i);

    return (
      <VStack spacing={3}>
        <HStack justify="space-between" w="full">
          <IconButton
            aria-label="Previous years"
            icon={<FiChevronLeft />}
            size="sm"
            variant="ghost"
            onClick={() => setViewDate(new Date(currentYear - 12, 0, 1))}
          />
          <Text fontWeight="semibold">{startYear} - {startYear + 11}</Text>
          <IconButton
            aria-label="Next years"
            icon={<FiChevronRight />}
            size="sm"
            variant="ghost"
            onClick={() => setViewDate(new Date(currentYear + 12, 0, 1))}
          />
        </HStack>
        <Grid templateColumns="repeat(3, 1fr)" gap={2} w="full">
          {years.map((year) => (
            <Button
              key={year}
              size="sm"
              variant={selectedDate?.getFullYear() === year ? "solid" : "ghost"}
              colorScheme={selectedDate?.getFullYear() === year ? "blue" : undefined}
              onClick={() => {
                setViewDate(new Date(year, viewDate.getMonth(), 1));
                setViewMode("month");
              }}
            >
              {year}
            </Button>
          ))}
        </Grid>
      </VStack>
    );
  };

  // Month View
  const renderMonthView = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = viewDate.getFullYear();

    return (
      <VStack spacing={3}>
        <HStack justify="space-between" w="full">
          <IconButton
            aria-label="Previous year"
            icon={<FiChevronLeft />}
            size="sm"
            variant="ghost"
            onClick={() => setViewDate(new Date(currentYear - 1, viewDate.getMonth(), 1))}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("year")}
            fontWeight="semibold"
          >
            {currentYear}
          </Button>
          <IconButton
            aria-label="Next year"
            icon={<FiChevronRight />}
            size="sm"
            variant="ghost"
            onClick={() => setViewDate(new Date(currentYear + 1, viewDate.getMonth(), 1))}
          />
        </HStack>
        <Grid templateColumns="repeat(3, 1fr)" gap={2} w="full">
          {months.map((month, index) => (
            <Button
              key={month}
              size="sm"
              variant={
                selectedDate?.getMonth() === index && selectedDate?.getFullYear() === currentYear
                  ? "solid"
                  : "ghost"
              }
              colorScheme={
                selectedDate?.getMonth() === index && selectedDate?.getFullYear() === currentYear
                  ? "blue"
                  : undefined
              }
              onClick={() => {
                setViewDate(new Date(currentYear, index, 1));
                setViewMode("day");
              }}
              _hover={{
                bg: selectedDate?.getMonth() === index && selectedDate?.getFullYear() === currentYear
                  ? undefined
                  : colorMode === "light" ? "gray.100" : "gray.600"
              }}
            >
              {month}
            </Button>
          ))}
        </Grid>
      </VStack>
    );
  };

  // Day View
  const renderDayView = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    const isSelectedDate = (day: number) => {
      if (!selectedDate) return false;
      return (
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === month &&
        selectedDate.getFullYear() === year
      );
    };

    const isToday = (day: number) => {
      const today = new Date();
      return (
        today.getDate() === day &&
        today.getMonth() === month &&
        today.getFullYear() === year
      );
    };

    return (
      <VStack spacing={3}>
        <HStack justify="space-between" w="full">
          <IconButton
            aria-label="Previous month"
            icon={<FiChevronLeft />}
            size="sm"
            variant="ghost"
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("month")}
            fontWeight="semibold"
          >
            {format(viewDate, "MMMM yyyy")}
          </Button>
          <IconButton
            aria-label="Next month"
            icon={<FiChevronRight />}
            size="sm"
            variant="ghost"
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
          />
        </HStack>
        <Box>
          <Grid templateColumns="repeat(7, 1fr)" gap={1} mb={2}>
            {weekDays.map((day) => (
              <Text key={day} fontSize="xs" textAlign="center" fontWeight="semibold" color="gray.500">
                {day}
              </Text>
            ))}
          </Grid>
          <Grid templateColumns="repeat(7, 1fr)" gap={1}>
            {days.map((day, index) => (
              <Button
                key={index}
                size="sm"
                variant={isSelectedDate(day!) ? "solid" : "ghost"}
                colorScheme={isSelectedDate(day!) ? "blue" : undefined}
                onClick={() => {
                  if (day) {
                    const newDate = new Date(year, month, day, selectedHour, selectedMinute);
                    setSelectedDate(newDate);
                    setViewMode("time");
                  }
                }}
                isDisabled={!day}
                fontSize="sm"
                h="32px"
                borderWidth={isToday(day!) ? "2px" : "0"}
                borderColor="blue.300"
              >
                {day || ""}
              </Button>
            ))}
          </Grid>
        </Box>
      </VStack>
    );
  };

  // Time Picker with Vertical Spinners
  const renderTimePicker = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    return (
      <VStack spacing={4}>
        <Text fontWeight="semibold" fontSize="lg">
          {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Select Time"}
        </Text>
        
        <HStack spacing={4} align="center">
          {/* Hour Spinner */}
          <VStack spacing={1}>
            <Text fontSize="xs" color="gray.500" fontWeight="semibold">Hour</Text>
            <Box
              ref={hourScrollRef}
              h="200px"
              w="80px"
              overflowY="scroll"
              position="relative"
              css={{
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': { background: '#CBD5E0', borderRadius: '10px' },
              }}
            >
              <Box h="80px" />
              {hours.map((hour) => (
                <Box
                  key={hour}
                  h="40px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  cursor="pointer"
                  onClick={() => setSelectedHour(hour)}
                  bg={selectedHour === hour ? "blue.500" : "transparent"}
                  color={selectedHour === hour ? "white" : colorMode === "light" ? "black" : "white"}
                  fontWeight={selectedHour === hour ? "bold" : "normal"}
                  fontSize={selectedHour === hour ? "xl" : "md"}
                  opacity={selectedHour === hour ? 1 : 0.4}
                  transition="all 0.2s"
                  rounded="md"
                  _hover={{ opacity: 1 }}
                >
                  {String(hour).padStart(2, "0")}
                </Box>
              ))}
              <Box h="80px" />
            </Box>
          </VStack>

          <Text fontSize="2xl" fontWeight="bold" color="gray.400">:</Text>

          {/* Minute Spinner */}
          <VStack spacing={1}>
            <Text fontSize="xs" color="gray.500" fontWeight="semibold">Minute</Text>
            <Box
              ref={minuteScrollRef}
              h="200px"
              w="80px"
              overflowY="scroll"
              position="relative"
              css={{
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': { background: '#CBD5E0', borderRadius: '10px' },
              }}
            >
              <Box h="80px" />
              {minutes.map((minute) => (
                <Box
                  key={minute}
                  h="40px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  cursor="pointer"
                  onClick={() => setSelectedMinute(minute)}
                  bg={selectedMinute === minute ? "blue.500" : "transparent"}
                  color={selectedMinute === minute ? "white" : colorMode === "light" ? "black" : "white"}
                  fontWeight={selectedMinute === minute ? "bold" : "normal"}
                  fontSize={selectedMinute === minute ? "xl" : "md"}
                  opacity={selectedMinute === minute ? 1 : 0.4}
                  transition="all 0.2s"
                  rounded="md"
                  _hover={{ opacity: 1 }}
                >
                  {String(minute).padStart(2, "0")}
                </Box>
              ))}
              <Box h="80px" />
            </Box>
          </VStack>
        </HStack>

        <HStack spacing={2} w="full" justify="space-between">
          <Button size="sm" variant="ghost" onClick={() => setViewMode("day")} leftIcon={<FiChevronLeft />}>
            Date
          </Button>
          <Button
            size="sm"
            colorScheme="blue"
            onClick={() => {
              if (selectedDate) {
                const finalDate = new Date(selectedDate);
                finalDate.setHours(selectedHour);
                finalDate.setMinutes(selectedMinute);
                onChange(finalDate.toISOString());
                setIsOpen(false);
                setViewMode("day");
              }
            }}
          >
            Done
          </Button>
        </HStack>
      </VStack>
    );
  };

  return (
    <FormControl isInvalid={isInvalid} isRequired={isRequired} isDisabled={isDisabled}>
      {label && <FormLabel fontSize={size === "sm" ? "sm" : "md"}>{label}</FormLabel>}

      <Popover
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setViewMode("day");
        }}
        placement="bottom-start"
      >
        <PopoverTrigger>
          <InputGroup size={size}>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiClock} color="gray.400" />
            </InputLeftElement>

            <Input
              value={formatDisplay(value)}
              placeholder={placeholder}
              readOnly
              onClick={() => !isDisabled && setIsOpen(true)}
              cursor="pointer"
              rounded={radiusStyle}
              pl={10}
              bg={colorMode === "light" ? "white" : "gray.700"}
            />

            {value && !isDisabled && (
              <InputRightElement>
                <IconButton
                  aria-label="Clear date and time"
                  icon={<FiX />}
                  size="xs"
                  variant="ghost"
                  onClick={handleClear}
                />
              </InputRightElement>
            )}
          </InputGroup>
        </PopoverTrigger>

        <PopoverContent w="320px" rounded={radiusStyle}>
          <PopoverBody p={4}>
            {viewMode === "year" && renderYearView()}
            {viewMode === "month" && renderMonthView()}
            {viewMode === "day" && renderDayView()}
            {viewMode === "time" && renderTimePicker()}
          </PopoverBody>
        </PopoverContent>
      </Popover>

      {helperText && !isInvalid && <FormHelperText>{helperText}</FormHelperText>}
      {errorMessage && isInvalid && <FormErrorMessage>{errorMessage}</FormErrorMessage>}
    </FormControl>
  );
};
