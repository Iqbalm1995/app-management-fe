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
  SimpleGrid,
  Card,
  CardBody,
  Avatar,
  Badge,
} from "@chakra-ui/react";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { FiUsers, FiUserPlus, FiSettings } from "react-icons/fi";

interface TeamTabProps {
  DataProject: ProjectDataResponse | null;
}

const TeamTab = ({ DataProject }: TeamTabProps) => {
  const { colorMode } = useColorMode();

  return (
    <TabPanel
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
              Team Management
            </Heading>
            <Text color="gray.600" fontSize="sm">
              Manage project team members and their roles
            </Text>
          </VStack>
          <HStack spacing={3}>
            <Button
              size="sm"
              colorScheme="blue"
              leftIcon={<FiUserPlus />}
              rounded="full"
            >
              Add Member
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<FiSettings />}
              colorScheme="gray"
              rounded="full"
            >
              Settings
            </Button>
          </HStack>
        </HStack>

        {/* Team Members Grid */}
        {DataProject?.userAssignment &&
        DataProject.userAssignment.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {DataProject.userAssignment.map((member, index) => (
              <Card
                key={index}
                shadow="lg"
                rounded="xl"
                border="1px"
                borderColor="gray.100"
                _hover={{
                  transform: "translateY(-2px)",
                  shadow: "xl",
                }}
                transition="all 0.2s"
              >
                <CardBody p={6}>
                  <VStack spacing={4}>
                    <Avatar
                      size="lg"
                      name={member.userData?.nama || "Team Member"}
                      bg="blue.500"
                    />
                    <VStack spacing={1}>
                      <Text fontWeight="bold" fontSize="lg">
                        {member.userData?.nama || "Team Member"}
                      </Text>
                      <Badge colorScheme="blue" px={3} py={1} rounded="full">
                        Member
                      </Badge>
                    </VStack>
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      {member.userData?.email || "No email provided"}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <Card
            p={8}
            textAlign="center"
            bg={colorMode === "light" ? "gray.50" : "gray.800"}
            rounded="lg"
            border="2px dashed"
            borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
          >
            <VStack spacing={4}>
              <FiUsers size={48} color="gray" />
              <Text color="gray.500" fontSize="lg" fontWeight="medium">
                No team members assigned
              </Text>
              <Text color="gray.400" fontSize="sm">
                Add team members to start collaborating on this project
              </Text>
              <Button
                colorScheme="blue"
                leftIcon={<FiUserPlus />}
                rounded="full"
                mt={4}
              >
                Add First Member
              </Button>
            </VStack>
          </Card>
        )}
      </VStack>
    </TabPanel>
  );
};

export default TeamTab;
