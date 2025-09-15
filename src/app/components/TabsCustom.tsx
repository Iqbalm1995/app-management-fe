import { Flex, Heading, Tab, useColorMode } from "@chakra-ui/react";
import { radiusStyle } from "../constants/applicationConstants";
import { JSX, ReactNode } from "react";

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
      bgColor={activeStep == idx ? "secondary.500" : "transparent"}
      rounded={radiusStyle}
      color={
        activeStep == idx
          ? "white"
          : colorMode == "light"
          ? "gray.800"
          : "gray.100"
      }
      boxShadow={activeStep == idx ? "md" : "none"}
      w={"280px"}
      justifyContent={"center"}
      textAlign={"center"}
      alignItems={"center"}
      cursor={"pointer"}
      onClick={() => {
        goToSection(idx);
      }}
      _hover={{
        bg:
          activeStep == idx
            ? "secondary.500"
            : colorMode == "light"
            ? "gray.100"
            : "gray.800",
        color:
          activeStep == idx
            ? "white"
            : colorMode == "light"
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

export const TabButtonCustomStyle = ({ children }: { children: ReactNode }) => {
  const { colorMode } = useColorMode();
  return (
    <Tab
      px={8}
      py={4}
      bgColor={"transparent"}
      rounded={radiusStyle}
      color={colorMode == "light" ? "gray.800" : "white"}
      justifyContent={"center"}
      textAlign={"center"}
      fontWeight={600}
      alignItems={"center"}
      cursor={"pointer"}
      _hover={{
        bg: colorMode == "light" ? "gray.100" : "gray.800",
        color: colorMode == "light" ? "gray.800" : "white",
      }}
      _selected={{
        bg: "secondary.500",
        color: "white",
        boxShadow: "md",
      }}
    >
      {children}
    </Tab>
  );
};
