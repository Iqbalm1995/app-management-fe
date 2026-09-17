"use client";

import { Button, ButtonGroup, useColorMode } from "@chakra-ui/react";
import { FiBarChart2, FiActivity } from "react-icons/fi";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { VisualizationMode } from "../types";

interface VisualizationSwitcherProps {
  value: VisualizationMode;
  onChange: (mode: VisualizationMode) => void;
}

/** Let the user choose Gantt vs horizontal timeline. */
const VisualizationSwitcher = ({
  value,
  onChange,
}: VisualizationSwitcherProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <ButtonGroup size="sm" isAttached rounded={radiusStyle}>
      <Button
        leftIcon={<FiBarChart2 />}
        colorScheme={value === "gantt" ? "secondary" : undefined}
        variant={value === "gantt" ? "solid" : "outline"}
        borderColor={value === "gantt" ? undefined : isDark ? "gray.700" : "gray.300"}
        color={
          value === "gantt"
            ? "white"
            : isDark
            ? "gray.300"
            : "gray.600"
        }
        bg={
          value === "gantt"
            ? undefined
            : isDark
            ? "gray.800"
            : "white"
        }
        _hover={
          value === "gantt"
            ? undefined
            : { bg: isDark ? "whiteAlpha.100" : "gray.50" }
        }
        onClick={() => onChange("gantt")}
        rounded={radiusStyle}
        borderRightRadius={0}
      >
        Gantt
      </Button>
      <Button
        leftIcon={<FiActivity />}
        colorScheme={value === "timeline" ? "secondary" : undefined}
        variant={value === "timeline" ? "solid" : "outline"}
        borderColor={value === "timeline" ? undefined : isDark ? "gray.700" : "gray.300"}
        color={
          value === "timeline"
            ? "white"
            : isDark
            ? "gray.300"
            : "gray.600"
        }
        bg={
          value === "timeline"
            ? undefined
            : isDark
            ? "gray.800"
            : "white"
        }
        _hover={
          value === "timeline"
            ? undefined
            : { bg: isDark ? "whiteAlpha.100" : "gray.50" }
        }
        onClick={() => onChange("timeline")}
        rounded={radiusStyle}
        borderLeftRadius={0}
      >
        Timeline
      </Button>
    </ButtonGroup>
  );
};

export default VisualizationSwitcher;
