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
import { FiClock, FiCalendar, FiActivity } from "react-icons/fi";

interface TimelineTabProps {
  DataProject: ProjectDataResponse | null;
}

const TimelineTab = ({ DataProject }: TimelineTabProps) => {
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
            as={FiCalendar}
            boxSize={20}
            color={colorMode === "light" ? "purple.500" : "purple.400"}
            opacity={0.8}
          />
          <Icon
            as={FiActivity}
            boxSize={8}
            color={colorMode === "light" ? "orange.500" : "orange.400"}
            position="absolute"
            top={-2}
            right={-2}
          />
        </Box>

        <VStack spacing={4} maxW="md">
          <Text
            fontSize="3xl"
            fontWeight="bold"
            bgGradient="linear(to-r, purple.500, orange.600)"
            bgClip="text"
          >
            Coming Soon
          </Text>
          
          <Text
            fontSize="lg"
            color={colorMode === "light" ? "gray.600" : "gray.400"}
            lineHeight="tall"
          >
            Interactive project timeline with milestones, deadlines, 
            and activity tracking is being developed.
          </Text>

          <VStack spacing={2} mt={4}>
            <Text
              fontSize="sm"
              color={colorMode === "light" ? "gray.500" : "gray.500"}
              fontWeight="medium"
            >
              Timeline features coming soon:
            </Text>
            <VStack spacing={1} fontSize="sm" color={colorMode === "light" ? "gray.600" : "gray.400"}>
              <Text>• Project Milestones & Deadlines</Text>
              <Text>• Activity Timeline Visualization</Text>
              <Text>• Critical Path Analysis</Text>
              <Text>• Schedule Management Tools</Text>
            </VStack>
          </VStack>

          <Button
            leftIcon={<FiClock />}
            colorScheme="purple"
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
            View Timeline
          </Button>
        </VStack>
      </Flex>
    </TabPanel>
  );
};

export default TimelineTab;
