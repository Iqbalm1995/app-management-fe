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
  Divider,
} from "@chakra-ui/react";
import { FiClock, FiX, FiChevronLeft, FiChevronRight, FiArrowRight } from "react-icons/fi";
import { format } from "date-fns";
import { radiusStyle } from "../constants/applicationConstants";

interface DateTimeRangeInputProps {
  startValue: string | null;
  endValue: string | null;
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

type ViewMode = "day" | "time";
type SelectingRange = "start" | "end";

export const DateTimeRangeInput: React.FC<DateTimeRangeInputProps> = ({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  label,
  placeholder = "Select date and time range",
  helperText,
  errorMessage,
  isRequired = false,
  isDisabled = false,
  isInvalid = false,
  size = "md",
}) => {
  const { colorMode } = useColorMode();
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [selectingRange, setSelectingRange] = useState<SelectingRange>("start");
  
  const currentDate = new Date();
  const [viewDate, setViewDate] = useState(currentDate);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(startValue ? new Date(startValue) : null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(endValue ? new Date(endValue) : null);
  
  const [selectedHour, setSelectedHour] = useState(0);
  const [selectedMinute, setSelectedMinute] = useState(0);

  const hourScrollRef = useRef<HTMLDivElement>(null);
  const minuteScrollRef = useRef<HTMLDivElement>(null);

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

  const formatDisplay = (): string => {
    if (!startValue && !endValue) return "";
    try {
      const start = startValue ? format(new Date(startValue), "MMM dd, HH:mm") : "Start";
      const end = endValue ? format(new Date(endValue), "MMM dd, HH:mm") : "End";
      return `${start} → ${end}`;
    } catch {
      return "";
    }
  };

  const handleClear = () => {
    onStartChange(null);
    onEndChange(null);
    setTempStartDate(null);
    setTempEndDate(null);
    setIsOpen(false);
  };

  const handleDateSelect = (day: number) => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    if (selectingRange === "start") {
      const newDate = new Date(year, month, day, selectedHour, selectedMinute);
      setTempStartDate(newDate);
      setSelectedHour(newDate.getHours());
      setSelectedMinute(newDate.getMinutes());
      setViewMode("time");
    } else {
      const newDate = new Date(year, month, day, selectedHour, selectedMinute);
      setTempEndDate(newDate);
      setSelectedHour(newDate.getHours());
      setSelectedMinute(newDate.getMinutes());
      setViewMode("time");
    }
  };

  const toLocalISOString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const handleTimeConfirm = () => {
    if (selectingRange === "start" && tempStartDate) {
      const finalDate = new Date(tempStartDate);
      finalDate.setHours(selectedHour);
      finalDate.setMinutes(selectedMinute);
      setTempStartDate(finalDate);
      onStartChange(toLocalISOString(finalDate));
      
      // Move to end date selection
      setSelectingRange("end");
      setViewMode("day");
      setSelectedHour(tempEndDate?.getHours() || 0);
      setSelectedMinute(tempEndDate?.getMinutes() || 0);
    } else if (selectingRange === "end" && tempEndDate) {
      const finalDate = new Date(tempEndDate);
      finalDate.setHours(selectedHour);
      finalDate.setMinutes(selectedMinute);
      setTempEndDate(finalDate);
      onEndChange(toLocalISOString(finalDate));
      
      // Close picker
      setIsOpen(false);
      setViewMode("day");
      setSelectingRange("start");
    }
  };

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

    const isInRange = (day: number) => {
      if (!tempStartDate || !tempEndDate) return false;
      const checkDate = new Date(year, month, day);
      return checkDate >= tempStartDate && checkDate <= tempEndDate;
    };

    const isStartDate = (day: number) => {
      if (!tempStartDate) return false;
      return (
        tempStartDate.getDate() === day &&
        tempStartDate.getMonth() === month &&
        tempStartDate.getFullYear() === year
      );
    };

    const isEndDate = (day: number) => {
      if (!tempEndDate) return false;
      return (
        tempEndDate.getDate() === day &&
        tempEndDate.getMonth() === month &&
        tempEndDate.getFullYear() === year
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
          <Text fontWeight="semibold">{format(viewDate, "MMMM yyyy")}</Text>
          <IconButton
            aria-label="Next month"
            icon={<FiChevronRight />}
            size="sm"
            variant="ghost"
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
          />
        </HStack>

        <HStack spacing={2} fontSize="sm">
          <Text color={selectingRange === "start" ? "blue.500" : "gray.500"} fontWeight={selectingRange === "start" ? "bold" : "normal"}>
            {tempStartDate ? format(tempStartDate, "MMM dd") : "Start"}
          </Text>
          <Icon as={FiArrowRight} color="gray.400" />
          <Text color={selectingRange === "end" ? "blue.500" : "gray.500"} fontWeight={selectingRange === "end" ? "bold" : "normal"}>
            {tempEndDate ? format(tempEndDate, "MMM dd") : "End"}
          </Text>
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
                variant={isStartDate(day!) || isEndDate(day!) ? "solid" : "ghost"}
                colorScheme={isStartDate(day!) || isEndDate(day!) ? "blue" : undefined}
                bg={isInRange(day!) && !isStartDate(day!) && !isEndDate(day!) ? "blue.100" : undefined}
                onClick={() => day && handleDateSelect(day)}
                isDisabled={!day}
                fontSize="sm"
                h="32px"
              >
                {day || ""}
              </Button>
            ))}
          </Grid>
        </Box>
      </VStack>
    );
  };

  const renderTimePicker = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    return (
      <VStack spacing={4}>
        <Text fontWeight="semibold" fontSize="lg">
          {selectingRange === "start" ? "Start Time" : "End Time"}
        </Text>
        
        <HStack spacing={4} align="center">
          <VStack spacing={1}>
            <Text fontSize="xs" color="gray.500" fontWeight="semibold">Hour</Text>
            <Box
              ref={hourScrollRef}
              h="200px"
              w="80px"
              overflowY="scroll"
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

          <VStack spacing={1}>
            <Text fontSize="xs" color="gray.500" fontWeight="semibold">Minute</Text>
            <Box
              ref={minuteScrollRef}
              h="200px"
              w="80px"
              overflowY="scroll"
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
          <Button size="sm" colorScheme="blue" onClick={handleTimeConfirm}>
            {selectingRange === "start" ? "Next" : "Done"}
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
          setSelectingRange("start");
        }}
        placement="bottom-start"
      >
        <PopoverTrigger>
          <InputGroup size={size}>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiClock} color="gray.400" />
            </InputLeftElement>

            <Input
              value={formatDisplay()}
              placeholder={placeholder}
              readOnly
              onClick={() => !isDisabled && setIsOpen(true)}
              cursor="pointer"
              rounded={radiusStyle}
              pl={10}
              bg={colorMode === "light" ? "white" : "gray.700"}
            />

            {(startValue || endValue) && !isDisabled && (
              <InputRightElement>
                <IconButton
                  aria-label="Clear date range"
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
