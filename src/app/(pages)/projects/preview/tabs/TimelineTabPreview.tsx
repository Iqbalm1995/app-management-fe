"use client";

import { ProjectDataResponse } from "@/app/services/useProjects";
import {
  TabPanel,
  useColorMode,
  VStack,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  Box,
  HStack,
} from "@chakra-ui/react";
import { FiCalendar } from "react-icons/fi";

interface TimelineTabPreviewProps {
  DataProject: ProjectDataResponse | null;
}

const TimelineTabPreview = ({ DataProject }: TimelineTabPreviewProps) => {
  const { colorMode } = useColorMode();

  return (
    <TabPanel>
      <VStack spacing={8} align="stretch">
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

        <Card shadow="md" rounded="xl" border="1px" borderColor="gray.100">
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
      </VStack>
    </TabPanel>
  );
};

export default TimelineTabPreview;
