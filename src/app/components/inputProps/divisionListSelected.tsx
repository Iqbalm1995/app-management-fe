"use client";

import {
  Box,
  Button,
  Flex,
  HStack,
  Spacer,
  Stack,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { FiMinusCircle } from "react-icons/fi";
import { DivisionResponse } from "@/app/services/useDivisions";
import { radiusStyle } from "@/app/constants/applicationConstants";

interface DivisionSelectedProps {
  onDivisionSelect: (divisionId: string) => void;
  divisionDataSelected: DivisionResponse[];
  editMode?: boolean;
}

function DivisionListSelected({
  onDivisionSelect,
  divisionDataSelected,
  editMode = false,
}: DivisionSelectedProps) {
  const { colorMode } = useColorMode();

  return (
    <Flex
      as={Stack}
      w="full"
      mt={2}
      p={2}
      bgColor={colorMode == "light" ? "white" : "gray.900"}
      border={"1px"}
      borderColor={"gray.200"}
      rounded={radiusStyle}
      boxShadow={"md"}
    >
      <Text>Selected Division</Text>
      {divisionDataSelected.map((division, index) => (
        <Flex
          key={index}
          bgGradient={"linear(to-br, secondary.500, secondary.800)"}
          color={"white"}
          w="full"
          py={3}
          px={8}
          rounded={radiusStyle}
          boxShadow="md"
          as={HStack}
          spacing={8}
        >
          <Box>
            <Stack spacing={0}>
              <Text fontWeight={600}>
                {division.divisionName} ({division.divisionCode})
              </Text>
            </Stack>
          </Box>
          <Spacer />
          {editMode && (
            <Button
              rounded={radiusStyle}
              colorScheme="red"
              size="sm"
              onClick={() => onDivisionSelect(division.id)}
            >
              <FiMinusCircle />
            </Button>
          )}
        </Flex>
      ))}
    </Flex>
  );
}

export default DivisionListSelected;
