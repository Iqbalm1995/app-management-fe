"use client";

import { ProjectDataResponse } from "@/app/services/useProjects";
import {
  TabPanel,
  useColorMode,
  VStack,
  Box,
  Text,
  Button,
  Icon,
  Flex,
} from "@chakra-ui/react";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { FiClock, FiZap, FiTrendingUp } from "react-icons/fi";

interface OverviewTabProps {
  DataProject: ProjectDataResponse | null;
}

export const OverviewTab = ({ DataProject }: OverviewTabProps) => {
  const { colorMode } = useColorMode();

  return (
    <TabPanel px={0}>
      <Flex
        direction="column"
        align="center"
        justify="center"
        minH="400px"
        textAlign="center"
        py={12}
      >
        {/* Coming Soon Icon */}
        <Box
          position="relative"
          mb={6}
        >
          <Icon
            as={FiClock}
            boxSize={20}
            color={colorMode === "light" ? "blue.500" : "blue.400"}
            opacity={0.8}
          />
          <Icon
            as={FiZap}
            boxSize={8}
            color={colorMode === "light" ? "orange.500" : "orange.400"}
            position="absolute"
            top={-2}
            right={-2}
          />
        </Box>

        {/* Coming Soon Content */}
        <VStack spacing={4} maxW="md">
          <Text
            fontSize="3xl"
            fontWeight="bold"
            bgGradient="linear(to-r, blue.500, purple.600)"
            bgClip="text"
          >
            Coming Soon
          </Text>
          
          <Text
            fontSize="lg"
            color={colorMode === "light" ? "gray.600" : "gray.400"}
            lineHeight="tall"
          >
            We're working on an amazing overview dashboard with project insights, 
            analytics, and real-time metrics.
          </Text>

          <VStack spacing={2} mt={4}>
            <Text
              fontSize="sm"
              color={colorMode === "light" ? "gray.500" : "gray.500"}
              fontWeight="medium"
            >
              Features coming soon:
            </Text>
            <VStack spacing={1} fontSize="sm" color={colorMode === "light" ? "gray.600" : "gray.400"}>
              <Text>• Project Analytics Dashboard</Text>
              <Text>• Progress Tracking & Metrics</Text>
              <Text>• Team Performance Insights</Text>
              <Text>• Timeline & Milestone Overview</Text>
            </VStack>
          </VStack>

          <Button
            leftIcon={<FiTrendingUp />}
            colorScheme="blue"
            variant="outline"
            rounded="full"
            mt={6}
            size="lg"
            _hover={{
              transform: "translateY(-2px)",
              shadow: "lg",
            }}
            transition="all 0.2s"
          >
            Stay Tuned
          </Button>
        </VStack>

        {/* Decorative Elements */}
        <Box
          position="absolute"
          top="20%"
          left="10%"
          w={4}
          h={4}
          bg={colorMode === "light" ? "blue.200" : "blue.600"}
          rounded="full"
          opacity={0.6}
          animation="pulse 2s infinite"
        />
        <Box
          position="absolute"
          top="30%"
          right="15%"
          w={3}
          h={3}
          bg={colorMode === "light" ? "purple.200" : "purple.600"}
          rounded="full"
          opacity={0.4}
          animation="pulse 3s infinite"
        />
        <Box
          position="absolute"
          bottom="25%"
          left="20%"
          w={2}
          h={2}
          bg={colorMode === "light" ? "pink.200" : "pink.600"}
          rounded="full"
          opacity={0.5}
          animation="pulse 2.5s infinite"
        />
      </Flex>
    </TabPanel>
  );
};
