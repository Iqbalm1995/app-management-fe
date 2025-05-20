"use client";

import { Divider, Flex, Stack, Text, useColorMode } from "@chakra-ui/react";
import { ReactNode, useEffect, useState } from "react";
import { radiusStyle } from "../constants/applicationConstants";

interface CustomPanelAlertProps {
  children: ReactNode;
  type?: "error" | "warning" | "info" | "success";
}

export function CustomPanelAlert({
  children,
  type = "info",
}: CustomPanelAlertProps) {
  const { colorMode } = useColorMode();
  const [bgColor, setBgColor] = useState("primary.50");
  const [brdrColor, setBrdrColor] = useState("primary.200");

  // Set the background color based on the type of alert
  useEffect(() => {
    switch (type) {
      case "error":
        setBgColor(colorMode === "light" ? "red.50" : "red.900");
        setBrdrColor(colorMode === "light" ? "red.200" : "red.700");
        break;
      case "warning":
        setBgColor(colorMode === "light" ? "yellow.50" : "yellow.900");
        setBrdrColor(colorMode === "light" ? "yellow.200" : "yellow.700");
        break;
      case "info":
        setBgColor(colorMode === "light" ? "blue.50" : "blue.900");
        setBrdrColor(colorMode === "light" ? "blue.200" : "blue.700");
        break;
      case "success":
        setBgColor(colorMode === "light" ? "green.50" : "green.900");
        setBrdrColor(colorMode === "light" ? "green.200" : "green.700");
        break;
      default:
        setBgColor("primary.50");
        setBrdrColor("primary.200");
    }
  }, [colorMode]);

  return (
    <Flex
      w={"full"}
      minH={"400px"}
      bg={bgColor}
      border={"2px"}
      rounded={radiusStyle}
      borderColor={brdrColor}
      justifyContent={"center"}
      alignItems={"center"}
      as={Stack}
      spacing={4}
    >
      {children}
    </Flex>
  );
}

interface InputGroupPanelProps {
  headerTitle: string;
  children: ReactNode;
}

export function InputGroupPanel({
  headerTitle,
  children,
}: InputGroupPanelProps) {
  const { colorMode } = useColorMode();
  return (
    <Flex
      as={Stack}
      w={"full"}
      p={5}
      rounded={radiusStyle}
      border={"1px"}
      borderColor={colorMode == "light" ? "gray.200" : "gray.700"}
      spacing={5}
    >
      <Text fontWeight={600}>{headerTitle}</Text>
      <Divider />
      <Flex as={Stack} w={"full"} px={3}>
        {children}
      </Flex>
    </Flex>
  );
}
