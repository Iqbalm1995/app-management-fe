import {
  Badge,
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  Tab,
  TabList,
  TabListProps,
  TabProps,
  Tabs,
  TabsProps,
  Text,
  Tooltip,
  useColorMode,
} from "@chakra-ui/react";
import { radiusStyle } from "../constants/applicationConstants";
import React, { ElementType, forwardRef, JSX, ReactNode } from "react";

// ============================================================================
// 1. Standalone Section Navigation Tab Button
// ============================================================================
export interface TabButtonCustomProps {
  tabProp: React.ReactNode;
  activeStep: number;
  idx: number;
  goToSection: (index: number) => void;
}

export const TabButtonCustom = ({
  tabProp,
  activeStep,
  idx,
  goToSection,
}: TabButtonCustomProps) => {
  const { colorMode } = useColorMode();
  return (
    <Flex
      px={8}
      py={4}
      bgColor={activeStep === idx ? "secondary.500" : "transparent"}
      rounded={radiusStyle}
      color={
        activeStep === idx
          ? "white"
          : colorMode === "light"
            ? "gray.800"
            : "gray.100"
      }
      boxShadow={activeStep === idx ? "md" : "none"}
      minW={"280px"}
      justifyContent={"center"}
      textAlign={"center"}
      alignItems={"center"}
      cursor={"pointer"}
      onClick={() => {
        goToSection(idx);
      }}
      _hover={{
        bg:
          activeStep === idx
            ? "secondary.500"
            : colorMode === "light"
              ? "gray.100"
              : "gray.800",
        color:
          activeStep === idx
            ? "white"
            : colorMode === "light"
              ? "gray.800"
              : "white",
      }}
    >
      <Heading as="h4" size="md">
        {tabProp}
      </Heading>
    </Flex>
  );
};

// ============================================================================
// 2. Legacy / Custom Project Tab Styles (Maintained for Backward Compatibility)
// ============================================================================
export const TabButtonCustomStyle = ({ children }: { children: ReactNode }) => {
  const { colorMode } = useColorMode();
  return (
    <Tab
      px={8}
      py={2}
      bgGradient={
        colorMode === "light"
          ? "linear(to-br, whiteAlpha.900, whiteAlpha.900)"
          : "linear(to-br, blackAlpha.500, blackAlpha.500)"
      }
      rounded={radiusStyle}
      color={colorMode === "light" ? "gray.800" : "white"}
      justifyContent={"center"}
      textAlign={"center"}
      fontWeight={600}
      alignItems={"center"}
      cursor={"pointer"}
      whiteSpace={"nowrap"}
      _hover={{
        bgGradient:
          colorMode === "light"
            ? "linear(to-br, gray.300, gray.300)"
            : "linear(to-br, gray.800, gray.800)",
        color: colorMode === "light" ? "gray.800" : "white",
      }}
      _selected={{
        bgGradient: "linear(to-br, secondary.500, secondary.800)",
        color: "white",
        boxShadow: "md",
      }}
    >
      {children}
    </Tab>
  );
};

export const TabButtonCustomStyleHighLight = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { colorMode } = useColorMode();
  return (
    <Tab
      px={8}
      py={2}
      bg={colorMode === "light" ? "white" : "gray.900"}
      rounded={radiusStyle}
      color={colorMode === "light" ? "secondary.700" : "secondary.200"}
      justifyContent={"center"}
      textAlign={"center"}
      fontWeight={600}
      alignItems={"center"}
      cursor={"pointer"}
      whiteSpace={"nowrap"}
      border="2px solid"
      borderColor={colorMode === "light" ? "secondary.200" : "secondary.700"}
      position="relative"
      transition="all 0.2s ease"
      _hover={{
        bg: colorMode === "light" ? "secondary.50" : "gray.800",
        borderColor: colorMode === "light" ? "secondary.400" : "secondary.500",
        color: colorMode === "light" ? "secondary.600" : "secondary.100",
        transform: "translateY(-1px)",
        boxShadow:
          colorMode === "light"
            ? "0 2px 8px rgba(0, 119, 254, 0.15)"
            : "0 2px 8px rgba(0, 119, 254, 0.25)",
      }}
      _selected={{
        bgGradient:
          colorMode === "light"
            ? "linear(to-br, secondary.500, secondary.700)"
            : "linear(to-br, secondary.600, secondary.900)",
        borderColor: "transparent",
        color: "white",
        boxShadow:
          colorMode === "light"
            ? "0 4px 12px rgba(0, 119, 254, 0.35)"
            : "0 4px 12px rgba(0, 119, 254, 0.5)",
        transform: "translateY(-2px)",
      }}
    >
      {children}
    </Tab>
  );
};

// ============================================================================
// 3. Modern Reusable Design Pattern Tabs Component
// ============================================================================
export type TabDesignVariant = "segmented" | "pills" | "cards" | "outline" | "minimal";

export interface CustomTabListProps extends Omit<TabListProps, "children"> {
  children: ReactNode;
  variant?: TabDesignVariant;
  fullWidth?: boolean;
}

export const CustomTabList = forwardRef<HTMLDivElement, CustomTabListProps>(
  ({ children, variant = "segmented", fullWidth = false, ...props }, ref) => {
    const { colorMode } = useColorMode();
    const isLight = colorMode === "light";

    if (variant === "pills") {
      return (
        <TabList
          ref={ref}
          display="flex"
          alignItems="center"
          gap={2}
          p={1}
          w={fullWidth ? "full" : "fit-content"}
          maxW="full"
          overflowX="auto"
          overflowY="hidden"
          border="none"
          css={{
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": { height: "4px" },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: isLight ? "#CBD5E0" : "#4A5568",
              borderRadius: "4px",
            },
          }}
          {...props}
        >
          {children}
        </TabList>
      );
    }

    if (variant === "cards") {
      return (
        <TabList
          ref={ref}
          display="flex"
          alignItems="center"
          gap={3}
          p={1.5}
          w={fullWidth ? "full" : "fit-content"}
          maxW="full"
          overflowX="auto"
          border="none"
          css={{
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
          {...props}
        >
          {children}
        </TabList>
      );
    }

    if (variant === "outline") {
      return (
        <TabList
          ref={ref}
          display="flex"
          alignItems="center"
          gap={2}
          borderBottom="2px solid"
          borderColor={isLight ? "gray.200" : "gray.700"}
          pb={-0.5}
          w={fullWidth ? "full" : "fit-content"}
          maxW="full"
          overflowX="auto"
          {...props}
        >
          {children}
        </TabList>
      );
    }

    // Default: "segmented" (Modern Pill/Track Segmented Tab Container)
    return (
      <TabList
        ref={ref}
        display="inline-flex"
        alignItems="center"
        p={1.5}
        bg={isLight ? "gray.100" : "gray.900"}
        border="1px solid"
        borderColor={isLight ? "gray.200" : "gray.750"}
        rounded={radiusStyle}
        gap={1.5}
        w={fullWidth ? "full" : "fit-content"}
        maxW="full"
        overflowX="auto"
        overflowY="hidden"
        boxShadow={isLight ? "inset 0 1px 2px rgba(0,0,0,0.04)" : "inset 0 1px 2px rgba(0,0,0,0.3)"}
        css={{
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
        {...props}
      >
        {children}
      </TabList>
    );
  }
);
CustomTabList.displayName = "CustomTabList";

export interface CustomTabItemProps extends Omit<TabProps, "children"> {
  icon?: ElementType | ReactNode;
  label: ReactNode;
  badge?: ReactNode | number | string;
  badgeColorScheme?: string;
  badgeVariant?: "solid" | "subtle" | "outline";
  isHighlight?: boolean;
  tooltip?: string;
  variant?: TabDesignVariant;
}

export const CustomTabItem = forwardRef<HTMLButtonElement, CustomTabItemProps>(
  (
    {
      icon: IconProp,
      label,
      badge,
      badgeColorScheme = "secondary",
      badgeVariant = "subtle",
      isHighlight = false,
      tooltip,
      variant = "segmented",
      ...props
    },
    ref
  ) => {
    const { colorMode } = useColorMode();
    const isLight = colorMode === "light";

    // Dynamic icon renderer
    const renderIcon = () => {
      if (!IconProp) return null;
      if (React.isValidElement(IconProp)) return IconProp;
      const IconComponent = IconProp as ElementType;
      return <Icon as={IconComponent} boxSize={4} />;
    };

    // Dynamic badge renderer
    const renderBadge = () => {
      if (badge === undefined || badge === null || badge === "") return null;

      if (badgeColorScheme === "red" || badgeColorScheme === "danger") {
        return (
          <Box
            as="span"
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            bg="red.500"
            color="white"
            fontSize="3xs"
            fontWeight="bold"
            borderRadius="full"
            minW="18px"
            h="18px"
            px={1.5}
            lineHeight="1"
            boxShadow="0 1px 3px rgba(229, 62, 62, 0.4)"
          >
            {badge}
          </Box>
        );
      }

      return (
        <Badge
          colorScheme={badgeColorScheme}
          variant={badgeVariant}
          rounded="full"
          fontSize="3xs"
          px={2}
          py={0.5}
          textTransform="none"
          fontWeight="bold"
        >
          {badge}
        </Badge>
      );
    };

    // Style according to variant
    let tabStyles: TabProps = {};

    if (variant === "pills") {
      tabStyles = {
        px: { base: 3.5, md: 4.5 },
        py: 2,
        rounded: radiusStyle,
        fontSize: "sm",
        fontWeight: 600,
        color: isLight ? "gray.600" : "gray.400",
        bg: isLight ? "gray.50" : "gray.800",
        border: "1px solid",
        borderColor: isLight ? "gray.200" : "gray.700",
        whiteSpace: "nowrap",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        _hover: {
          bg: isLight ? "gray.100" : "gray.750",
          color: isLight ? "gray.900" : "gray.100",
          transform: "translateY(-1px)",
        },
        _selected: {
          bgGradient: isLight
            ? "linear(to-r, secondary.500, secondary.600)"
            : "linear(to-r, secondary.600, secondary.800)",
          borderColor: "transparent",
          color: "white",
          boxShadow: isLight
            ? "0 4px 12px rgba(0, 119, 254, 0.28)"
            : "0 4px 12px rgba(0, 119, 254, 0.45)",
          transform: "translateY(-1px)",
        },
      };
    } else if (variant === "cards") {
      tabStyles = {
        px: { base: 4, md: 5 },
        py: 2.5,
        rounded: radiusStyle,
        fontSize: "sm",
        fontWeight: 600,
        color: isLight ? "gray.600" : "gray.400",
        bg: isLight ? "white" : "gray.800",
        border: "1px solid",
        borderColor: isLight ? "gray.200" : "gray.700",
        whiteSpace: "nowrap",
        transition: "all 0.2s ease",
        _hover: {
          borderColor: isLight ? "secondary.300" : "secondary.600",
          color: isLight ? "secondary.600" : "secondary.300",
          boxShadow: "sm",
        },
        _selected: {
          bg: isLight ? "secondary.50" : "gray.750",
          borderColor: isLight ? "secondary.500" : "secondary.400",
          color: isLight ? "secondary.700" : "secondary.200",
          fontWeight: 700,
          boxShadow: "md",
        },
      };
    } else {
      // Default: "segmented"
      tabStyles = {
        px: { base: 3.5, md: 4.5 },
        py: 1.5,
        rounded: radiusStyle,
        fontSize: "xs",
        fontWeight: 600,
        color: isLight ? "gray.600" : "gray.400",
        bg: "transparent",
        whiteSpace: "nowrap",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        _hover: {
          color: isLight ? "gray.900" : "gray.100",
          bg: isLight ? "whiteAlpha.700" : "whiteAlpha.100",
        },
        _selected: {
          bg: isLight ? "white" : "gray.800",
          color: isLight ? "secondary.700" : "secondary.200",
          fontWeight: "bold",
          boxShadow: isLight
            ? "0 2px 6px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)"
            : "0 2px 6px rgba(0, 0, 0, 0.4)",
          border: "1px solid",
          borderColor: isLight ? "gray.200" : "gray.700",
        },
      };
    }

    const tabContent = (
      <Tab ref={ref} {...tabStyles} {...props}>
        <HStack spacing={2} align="center">
          {renderIcon()}
          <Text as="span">{label}</Text>
          {renderBadge()}
        </HStack>
      </Tab>
    );

    if (tooltip) {
      return (
        <Tooltip label={tooltip} hasArrow rounded="md" fontSize="xs">
          {tabContent}
        </Tooltip>
      );
    }

    return tabContent;
  }
);
CustomTabItem.displayName = "CustomTabItem";

// Export standard aliases for seamless cross-module use
export const AppTabList = CustomTabList;
export const AppTabItem = CustomTabItem;

