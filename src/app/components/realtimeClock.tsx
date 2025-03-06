import React, { useEffect, useState } from "react";
import { Box, Text, HStack, Stack, Flex, Heading } from "@chakra-ui/react";

const RealTimeClock: React.FC = () => {
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);

    const interval = setInterval(() => {
      const now = new Date();

      // Format time to include seconds
      const formattedTime = now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      // Format the date to include day, date, month name, and year
      const formattedDateEN = now.toLocaleDateString("en-GB", {
        weekday: "long", // Day name (e.g., Monday)
        day: "numeric", // Date (e.g., 1)
        month: "long", // Month name (e.g., January)
        year: "numeric", // Year (e.g., 2024)
      });

      // Format the date to include day, date, month name, and year in Indonesian
      const formattedDateID = now.toLocaleDateString("id-ID", {
        weekday: "long", // Day name in Indonesian (e.g., Senin)
        day: "numeric", // Date (e.g., 20)
        month: "long", // Month name in Indonesian (e.g., November)
        year: "numeric", // Year (e.g., 2024)
      });

      setTime(formattedTime);
      setDate(formattedDateID);
    }, 0);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return null;
  }

  // Split the time into hours, minutes, and seconds
  const hoursMinutes = time.split(":").slice(0, 2).join(":");
  const formattedSeconds = time.split(":")[2]; // Extract seconds separately

  return (
    <Box textAlign="center" color={"white"}>
      <Flex
        as={Stack}
        justifyContent={"center"}
        alignItems={"center"}
        spacing={3}
      >
        {/* Hours and Minutes (Bold and Normal) */}
        <Heading as="h2" size="3xl">
          {hoursMinutes}
        </Heading>
        {/* Add the day, date, month, and year below */}
        <Text fontSize="lg" fontWeight={600}>
          {date}
        </Text>
      </Flex>
    </Box>
  );
};

export default RealTimeClock;
