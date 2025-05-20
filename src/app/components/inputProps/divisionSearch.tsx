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
import { FiPlusCircle } from "react-icons/fi";
import { DivisionResponse } from "@/app/services/useDivisions";
import { radiusStyle } from "@/app/constants/applicationConstants";

interface DivisionListSearchProps {
  onDivisionSelect: (division: DivisionResponse) => void;
  divisionData: DivisionResponse[];
}

function DivisionListSearch({
  onDivisionSelect,
  divisionData,
}: DivisionListSearchProps) {
  const { colorMode } = useColorMode();

  return (
    <Flex as={Stack} w="full" pt={2}>
      {divisionData.map((division, index) => (
        <Flex
          key={index}
          bg={colorMode == "light" ? "gray.100" : "gray.700"}
          // bg={"gray.100"}
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
          <Button
            rounded={radiusStyle}
            colorScheme="green"
            size="sm"
            onClick={() => onDivisionSelect(division)}
          >
            <FiPlusCircle />
          </Button>
        </Flex>
      ))}
    </Flex>
  );
}

export default DivisionListSearch;
