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
import { FiBarChart, FiTrendingUp, FiPieChart } from "react-icons/fi";

interface AnalyticsTabProps {
  DataProject: ProjectDataResponse | null;
}

const AnalyticsTab = ({ DataProject }: AnalyticsTabProps) => {
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
        <Box position="relative" mb={6}>
          <Icon
            as={FiBarChart}
            boxSize={20}
            color={colorMode === "light" ? "blue.500" : "blue.400"}
            opacity={0.8}
          />
          <Icon
            as={FiTrendingUp}
            boxSize={8}
            color={colorMode === "light" ? "green.500" : "green.400"}
            position="absolute"
            top={-2}
            right={-2}
          />
        </Box>

        <VStack spacing={4} maxW="md">
          <Text
            fontSize="3xl"
            fontWeight="bold"
            bgGradient="linear(to-r, blue.500, green.600)"
            bgClip="text"
          >
            Coming Soon
          </Text>
          
          <Text
            fontSize="lg"
            color={colorMode === "light" ? "gray.600" : "gray.400"}
            lineHeight="tall"
          >
            Advanced analytics dashboard with comprehensive project metrics 
            and performance insights is under development.
          </Text>

          <VStack spacing={2} mt={4}>
            <Text
              fontSize="sm"
              color={colorMode === "light" ? "gray.500" : "gray.500"}
              fontWeight="medium"
            >
              Analytics features coming soon:
            </Text>
            <VStack spacing={1} fontSize="sm" color={colorMode === "light" ? "gray.600" : "gray.400"}>
              <Text>• Performance Metrics & KPIs</Text>
              <Text>• Resource Utilization Charts</Text>
              <Text>• Progress Trend Analysis</Text>
              <Text>• Team Productivity Reports</Text>
            </VStack>
          </VStack>

          <Button
            leftIcon={<FiPieChart />}
            colorScheme="green"
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
            View Analytics
          </Button>
        </VStack>
      </Flex>
    </TabPanel>
  );
};

export default AnalyticsTab;
