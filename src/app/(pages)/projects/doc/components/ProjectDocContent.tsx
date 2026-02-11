"use client";

import {
  Box,
  Card,
  CardBody,
  Divider,
  Heading,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import { ProjectDataResponse } from "@/app/services/useProjects";
import { radiusStyle } from "@/app/constants/applicationConstants";

interface ProjectDocContentProps {
  project: ProjectDataResponse;
}

export default function ProjectDocContent({ project }: ProjectDocContentProps) {
  const { colorMode } = useColorMode();

  const InfoRow = ({ label, value }: { label: string; value: string | number }) => (
    <SimpleGrid columns={2} spacing={0} borderWidth="1px" borderColor="gray.300">
      <Text fontWeight="bold" fontSize="sm" px={3} py={2}>
        {label}
      </Text>
      <Text fontSize="sm" px={3} py={2}>
        {value || "-"}
      </Text>
    </SimpleGrid>
  );

  return (
    <Box
      className="doc-container"
      maxW="210mm"
      mx="auto"
      bg={colorMode === "dark" ? "gray.800" : "white"}
      p={8}
      boxShadow="lg"
      borderRadius={radiusStyle}
    >
      {/* Document Header */}
      <VStack align="stretch" spacing={1} mb={6}>
        <Heading size="md" textAlign="center" fontWeight="bold">
          LAMPIRAN I
        </Heading>
        <Heading size="md" textAlign="center" fontWeight="bold">
          FORMULIR REGISTRASI IT PROJECT
        </Heading>
        <Text fontSize="xs" color="gray.500" textAlign="center" mt={2}>
          Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
        </Text>
      </VStack>

      <Divider mb={4} />

      {/* Project Information */}
      <VStack align="stretch" spacing={0}>
        <Box>
          <InfoRow label="Pengajuan Nama Project" value={project.projectName} />
          <InfoRow label="Project Number" value={project.projectNo} />
          <InfoRow label="Project Code" value={project.projectCode} />
          <InfoRow label="Divisi Yang Menginisiasikan" value={project.proOwnerDivisionName} />
          <InfoRow label="Tipe Project" value={project.projectType} />
          <InfoRow label="Category" value={project.projectCategory} />
          <InfoRow label="Status" value={project.projectStatus} />
          <InfoRow label="Approval Status" value={project.approvalStatus || "-"} />
          <InfoRow label="Progress" value={`${project.projectStatusPercentage || 0}%`} />
          <InfoRow label="Duration" value={`${project.projectDurationDays || 0} days`} />
          <InfoRow
            label="Register Date"
            value={
              project.projectRegisterDate
                ? new Date(project.projectRegisterDate).toLocaleDateString()
                : "-"
            }
          />
          <InfoRow
            label="Closed Date"
            value={
              project.projectClosedDate
                ? new Date(project.projectClosedDate).toLocaleDateString()
                : "-"
            }
          />
          <InfoRow label="Owner Directorate" value={project.proOwnerDirectorateName} />
          <InfoRow label="Owner Division" value={project.proOwnerDivisionName} />
          <InfoRow label="Owner Group" value={project.proOwnerGroupName} />
          <InfoRow label="Managed By Directorate" value={project.proManageByDirectorateName} />
          <InfoRow label="Managed By Division" value={project.proManageByDivisionName} />
          <InfoRow label="Managed By Group" value={project.proManageByGroupName} />
          <InfoRow label="Managed By Team" value={project.proManageByTeamName} />
        </Box>

        {/* Characteristics */}
        {(project.projectCharasteristicName ||
          project.projectSubCharasteristicName ||
          project.projectAcquisitionName) && (
          <Box>
            <Heading size="md" mb={4}>
              Characteristics
            </Heading>
            <Box>
              <InfoRow label="Acquisition" value={project.projectAcquisitionName || "-"} />
              <InfoRow label="Characteristic" value={project.projectCharasteristicName || "-"} />
              <InfoRow
                label="Sub-Characteristic"
                value={project.projectSubCharasteristicName || "-"}
              />
            </Box>
          </Box>
        )}

        {/* SDLC */}
        {(project.sdlcName || project.sdlcStageName) && (
          <Box>
            <Heading size="md" mb={4}>
              SDLC
            </Heading>
            <Box>
              <InfoRow label="SDLC" value={project.sdlcName || "-"} />
              <InfoRow label="Current Stage" value={project.sdlcStageName || "-"} />
            </Box>
          </Box>
        )}

        {/* Team Members */}
        {project.userAssignment && project.userAssignment.length > 0 && (
          <Box mt={4}>
            <Table variant="simple" size="sm" border="1px" borderColor="gray.300">
              <Thead bg="gray.50">
                <Tr>
                  <Th border="1px" borderColor="gray.300" fontWeight="bold" color="black">No</Th>
                  <Th border="1px" borderColor="gray.300" fontWeight="bold" color="black">Name</Th>
                  <Th border="1px" borderColor="gray.300" fontWeight="bold" color="black">User ID</Th>
                  <Th border="1px" borderColor="gray.300" fontWeight="bold" color="black">Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {project.userAssignment.map((assignment, index) => (
                  <Tr key={assignment.id || index}>
                    <Td border="1px" borderColor="gray.300" textAlign="center">{index + 1}</Td>
                    <Td border="1px" borderColor="gray.300">{assignment.userData?.nama || assignment.userId}</Td>
                    <Td border="1px" borderColor="gray.300">{assignment.userId}</Td>
                    <Td border="1px" borderColor="gray.300">{assignment.userAssignStatus || "-"}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}

        {/* Requirement Information */}
        {project.requirementData && (
          <Box>
            <Heading size="md" mb={4}>
              Requirement Information
            </Heading>
            <Box>
              <InfoRow label="Requirement Number" value={project.requirementData.reqNumber || "-"} />
              <InfoRow label="Requirement Type" value={project.requirementData.requirementType || "-"} />
              <InfoRow label="Status" value={project.requirementData.reqStatus || "-"} />
            </Box>
          </Box>
        )}

        {/* Work Programs */}
        {project.workPrograms && project.workPrograms.length > 0 && (
          <Box mt={4}>
            <InfoRow
              label="External Work Programs"
              value={project.workPrograms.filter((wp) => wp.workProgramSource === "EXTERNAL").length}
            />
            <InfoRow
              label="Internal Work Programs"
              value={project.workPrograms.filter((wp) => wp.workProgramSource === "INTERNAL").length}
            />
            <InfoRow label="Total Work Programs" value={project.workPrograms.length} />
          </Box>
        )}

        {/* Description */}
        {project.projectDesc && project.projectDesc.length > 50 && (
          <Box mt={4} borderWidth="1px" borderColor="gray.300">
            <Text fontWeight="bold" fontSize="sm" px={3} py={2} borderBottomWidth="1px" borderColor="gray.300">
              Project Description
            </Text>
            <Text fontSize="sm" px={3} py={2}>
              {project.projectDesc}
            </Text>
          </Box>
        )}
      </VStack>

      {/* Footer */}
      <Box mt={8} borderWidth="1px" borderColor="gray.300">
        <Text fontSize="sm" px={3} py={2}>
          Bandung, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
        </Text>
        <Text fontSize="xs" color="gray.500" textAlign="center" px={3} py={2} borderTopWidth="1px" borderColor="gray.300" fontStyle="italic">
          Generated by Project Management System
        </Text>
      </Box>
    </Box>
  );
}
