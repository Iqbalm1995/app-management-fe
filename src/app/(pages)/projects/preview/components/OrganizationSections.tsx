"use client";

import { ProjectUserAssignmentResponse, ProjectDataResponse } from "@/app/services/useProjects";
import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  SimpleGrid,
  Box,
  Text,
  Badge,
  HStack,
  VStack,
  Avatar,
  useColorMode,
} from "@chakra-ui/react";
import { FiUsers, FiUser } from "react-icons/fi";

interface UserAssignmentsSectionProps {
  projectMembers: ProjectUserAssignmentResponse[];
}

export const UserAssignmentsSection = ({ projectMembers }: UserAssignmentsSectionProps) => {
  const { colorMode } = useColorMode();

  if (!projectMembers || projectMembers.length === 0) {
    return null;
  }

  // Group by status first
  const statusGroups = projectMembers.reduce((acc, assignment) => {
    const status = assignment.userAssignStatus || "UNKNOWN";
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(assignment);
    return acc;
  }, {} as Record<string, typeof projectMembers>);

  return (
    <Card shadow="sm" rounded="xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
      <CardHeader bg={colorMode === "light" ? "green.50" : "green.900"} roundedTop="xl" py={4}>
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
            <FiUsers size={20} color="white" />
          </Box>
          <Heading size="md" color={colorMode === "light" ? "green.700" : "green.200"}>
            Tim Project
          </Heading>
        </HStack>
      </CardHeader>
      <CardBody p={6}>
        <VStack spacing={6} align="stretch">
          {Object.entries(statusGroups).map(([status, statusMembers]) => (
            <Box key={status}>
              <HStack mb={4} spacing={3}>
                <Heading size="md" color={colorMode === "light" ? "gray.800" : "white"}>
                  {status} MEMBERS
                </Heading>
                <Badge
                  colorScheme={status === "ACTIVE" ? "green" : "red"}
                  fontSize="md"
                  px={3}
                  py={1}
                  rounded="full"
                >
                  {statusMembers.length}
                </Badge>
              </HStack>

              <VStack spacing={6} align="stretch" pl={4}>
                {(() => {
                  const orgGroups = statusMembers.reduce(
                    (acc, assignment) => {
                      const member = assignment.userData;
                      const groupCode =
                        member?.team?.organization?.group?.orgCode ||
                        "UNREGISTERED";
                      const groupName =
                        member?.team?.organization?.group?.orgName ||
                        "UNREGISTERED MEMBER GROUP";
                      if (!acc[groupCode]) {
                        acc[groupCode] = { groupName, members: [] };
                      }
                      acc[groupCode].members.push(assignment);
                      return acc;
                    },
                    {} as Record<
                      string,
                      { groupName: string; members: typeof statusMembers }
                    >
                  );

                  return Object.entries(orgGroups).map(
                    ([groupCode, { groupName, members }]) => (
                      <Box key={groupCode}>
                        <HStack mb={3} spacing={3}>
                          <Text fontSize="lg" fontWeight="bold" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                            {groupName}
                          </Text>
                          <Badge colorScheme="blue" fontSize="sm" px={2} py={1} rounded="full">
                            {members.length}
                          </Badge>
                        </HStack>
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
                          {members.map((assignment) => {
                            const member = assignment.userData;
                            return (
                              <Box
                                key={assignment.id}
                                p={4}
                                bg={colorMode === "light" ? "white" : "gray.800"}
                                rounded="lg"
                                border="1px"
                                borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                                _hover={{ shadow: "md", borderColor: "green.400" }}
                                transition="all 0.2s"
                              >
                                <HStack spacing={3} mb={3}>
                                  <Avatar
                                    size="sm"
                                    name={member?.nama || assignment.userId}
                                    bg="green.500"
                                  />
                                  <VStack align="start" spacing={0} flex={1}>
                                    <Text fontSize="sm" fontWeight="semibold">
                                      {member?.nama || assignment.userId}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                      {assignment.userId}
                                    </Text>
                                  </VStack>
                                </HStack>
                                <VStack align="stretch" spacing={2}>
                                  {member?.team && (
                                    <Box>
                                      <Text fontSize="xs" color="gray.500">Team:</Text>
                                      <Text fontSize="xs" fontWeight="medium">
                                        {member.team.teamName}
                                      </Text>
                                    </Box>
                                  )}
                                  {member?.teamRole && (
                                    <Box>
                                      <Text fontSize="xs" color="gray.500">Role:</Text>
                                      <Text fontSize="xs" fontWeight="medium">
                                        {member.teamRole.specName}
                                      </Text>
                                    </Box>
                                  )}
                                </VStack>
                              </Box>
                            );
                          })}
                        </SimpleGrid>
                      </Box>
                    )
                  );
                })()}
              </VStack>
            </Box>
          ))}
        </VStack>
      </CardBody>
    </Card>
  );
};

interface OrganizationSectionProps {
  DataProject: ProjectDataResponse;
  title: string;
  colorScheme: "purple" | "orange" | "blue" | "cyan";
  type: "initiated" | "managed" | "requirement-initiated" | "requirement-managed";
}

export const OrganizationSection = ({ DataProject, title, colorScheme, type }: OrganizationSectionProps) => {
  const { colorMode } = useColorMode();

  const directorateName = type === "requirement-initiated" 
    ? DataProject.requirementData?.senderDirectorateName || "-"
    : type === "requirement-managed"
      ? DataProject.proManageByDirectorateName
      : type === "initiated" 
        ? DataProject.proOwnerDirectorateName 
        : DataProject.proManageByDirectorateName;
  
  const divisionName = type === "requirement-initiated" 
    ? DataProject.requirementData?.senderDivisionName || "-"
    : type === "requirement-managed"
      ? DataProject.proManageByDivisionName
      : type === "initiated" 
        ? DataProject.proOwnerDivisionName 
        : DataProject.proManageByDivisionName;
  
  const groupName = type === "requirement-initiated" 
    ? null
    : type === "requirement-managed"
      ? DataProject.proManageByGroupName
      : type === "initiated" 
        ? DataProject.proOwnerGroupName 
        : DataProject.proManageByGroupName;
  
  const teamName = (type === "managed" || type === "requirement-managed")
    ? DataProject.proManageByTeamName 
    : null;

  const InfoItem = ({ label, value }: { label: string; value: string | null | undefined }) => (
    <Box>
      <Text fontSize="xs" color="gray.500" mb={1} fontWeight="medium">
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="semibold" color={colorMode === "light" ? "gray.800" : "white"}>
        {value || "-"}
      </Text>
    </Box>
  );

  return (
    <Card shadow="sm" rounded="xl" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
      <CardHeader 
        bg={colorMode === "light" ? `${colorScheme}.50` : `${colorScheme}.900`} 
        roundedTop="xl" 
        py={4}
      >
        <HStack spacing={3}>
          <Box
            w={10}
            h={10}
            bgGradient={`linear(135deg, ${colorScheme}.400, ${colorScheme}.600)`}
            rounded="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <FiUser size={20} color="white" />
          </Box>
          <Heading size="md" color={colorMode === "light" ? `${colorScheme}.700` : `${colorScheme}.200`}>
            {title}
          </Heading>
        </HStack>
      </CardHeader>
      <CardBody p={6}>
        <VStack spacing={4} align="stretch">
          <InfoItem label="Direktorat" value={directorateName} />
          <InfoItem label="Divisi" value={divisionName} />
          <InfoItem label="Group" value={groupName} />
          {teamName && <InfoItem label="Team" value={teamName} />}
        </VStack>
      </CardBody>
    </Card>
  );
};
