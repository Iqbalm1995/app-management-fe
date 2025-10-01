"use client";

import { ProjectDataResponse } from "@/app/services/useProjects";
import {
  TabPanel,
  useColorMode,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Box,
} from "@chakra-ui/react";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { FiCalendar, FiPlus, FiRefreshCcw, FiClock } from "react-icons/fi";

interface TimelineTabProps {
  DataProject: ProjectDataResponse | null;
}

const TimelineTab = ({ DataProject }: TimelineTabProps) => {
  const { colorMode } = useColorMode();

  return (
    <TabPanel
      p={8}
      bg={colorMode === "light" ? "gray.50" : "gray.900"}
      roundedBottom={radiusStyle}
    >
      <VStack spacing={8} align="stretch">
        {/* Header Section */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading
              size="lg"
              color={colorMode === "light" ? "gray.800" : "white"}
            >
              Project Timeline
            </Heading>
            <Text color="gray.600" fontSize="sm">
              Track project milestones and important dates
            </Text>
          </VStack>
          <HStack spacing={3}>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<FiRefreshCcw />}
              colorScheme="gray"
              rounded="full"
            >
              Refresh
            </Button>
          </HStack>
        </HStack>

        {/* Calendar/Timeline Content */}
        <Card shadow="lg" rounded="xl" border="1px" borderColor="gray.100">
          <CardHeader bg="blue.50" roundedTop="xl">
            <HStack spacing={3}>
              <Box
                w={10}
                h={10}
                bgGradient="linear(135deg, blue.400, blue.600)"
                rounded="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FiCalendar size={20} color="white" />
              </Box>
              <Heading size="md" color="blue.700">
                Project Calendar
              </Heading>
            </HStack>
          </CardHeader>
          <CardBody p={6}>
            <Box
              h="500px"
              bg={colorMode === "light" ? "gray.50" : "gray.800"}
              rounded="lg"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              border="2px dashed"
              borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
            >
              <FiCalendar size={48} color="gray" />
              <Text color="gray.500" fontSize="lg" fontWeight="medium" mt={4}>
                Calendar Component
              </Text>
              <Text color="gray.400" fontSize="sm" textAlign="center" mt={2}>
                FullCalendar integration will be implemented here
                <br />
                to show project timeline and milestones
              </Text>
            </Box>
          </CardBody>
        </Card>

        {/* Timeline Events */}
        <Card shadow="lg" rounded="xl" border="1px" borderColor="gray.100">
          <CardHeader bg="green.50" roundedTop="xl">
            <HStack spacing={3}>
              <Box
                w={10}
                h={10}
                bgGradient="linear(135deg, green.400, green.600)"
                rounded="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FiClock size={20} color="white" />
              </Box>
              <Heading size="md" color="green.700">
                Recent Timeline Events
              </Heading>
            </HStack>
          </CardHeader>
          <CardBody p={6}>
            <VStack spacing={4} align="stretch">
              {/* Sample Timeline Events */}
              <HStack spacing={4}>
                <Box w={3} h={3} bg="blue.400" rounded="full" mt={1} />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium">Project Started</Text>
                  <Text fontSize="sm" color="gray.600">
                    {DataProject?.projectRegisterDate
                      ? new Date(
                          DataProject.projectRegisterDate
                        ).toLocaleDateString()
                      : "Date not available"}
                  </Text>
                </VStack>
              </HStack>

              <HStack spacing={4}>
                <Box w={3} h={3} bg="green.400" rounded="full" mt={1} />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium">Team Assembled</Text>
                  <Text fontSize="sm" color="gray.600">
                    {DataProject?.userAssignment?.length || 0} members assigned
                  </Text>
                </VStack>
              </HStack>

              <HStack spacing={4}>
                <Box w={3} h={3} bg="orange.400" rounded="full" mt={1} />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium">Current Progress</Text>
                  <Text fontSize="sm" color="gray.600">
                    {DataProject?.projectStatusPercentage || 0}% completed
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </TabPanel>
  );
};

export default TimelineTab;
