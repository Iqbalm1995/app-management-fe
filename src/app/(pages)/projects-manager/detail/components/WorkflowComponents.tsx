"use client";

import { radiusStyle } from "@/app/constants/applicationConstants";
import { convertToCustomDateFormat } from "@/app/helper/MasterHelper";
import { ProjectWorkflowResponse } from "@/app/services/useProjects";
import {
  Box,
  Card,
  CardHeader,
  CardBody,
  HStack,
  VStack,
  Text,
  Button,
  Collapse,
  useDisclosure,
  useColorMode,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Flex,
  Stack,
  Icon,
  Tooltip,
} from "@chakra-ui/react";
import {
  FiUpload,
  FiEye,
  FiAlertTriangle,
  FiCheckCircle,
} from "react-icons/fi";

// Workflow Level 2 Component
interface WorkflowLevel2Props {
  workflow: ProjectWorkflowResponse;
}

export const WorkflowLevel2Box = ({ workflow }: WorkflowLevel2Props) => {
  const { colorMode } = useColorMode();
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });

  return (
    <Box
      // border="1px solid"
      // borderColor={colorMode === "light" ? "gray.300" : "gray.600"}
      rounded={radiusStyle}
      overflow="hidden"
    >
      <Box
        p={4}
        bg={colorMode === "light" ? "gray.50" : "gray.700"}
        cursor="pointer"
        onClick={onToggle}
        _hover={{ bg: colorMode === "light" ? "gray.100" : "gray.700" }}
      >
        <HStack justify="space-between">
          <Text fontWeight={600} fontSize="sm">
            {workflow.wfgName} ({workflow.workflowChild.length})
          </Text>
          <Text fontSize="xs" color="gray.500">
            {isOpen ? "−" : "+"}
          </Text>
        </HStack>
      </Box>
      <Collapse in={isOpen}>
        <Flex
          mt={2}
          overflowX={"auto"}
          w={"full"}
          border={"1px solid"}
          borderRadius={radiusStyle}
          borderColor={colorMode == "light" ? "gray.100" : "gray.600"}
          boxShadow={"md"}
        >
          <Table size="sm" variant="unstyled">
            <Thead>
              <Tr
                bg={colorMode == "light" ? "secondary.50" : "gray.900"}
                color={colorMode == "light" ? "secondary.800" : "secondary.500"}
              >
                <Th py={3}>Jenis Dokumen</Th>
                <Th py={3}>Nama Dokumen</Th>
                <Th py={3}>Nomor Dokumen</Th>
                <Th py={3}>Tanggal Upload</Th>
                <Th py={3}>Versi</Th>
                <Th py={3}>Status</Th>
                <Th width="200px">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {workflow.workflowChild?.map((level3) => (
                <Tr key={level3.id} fontWeight="medium" fontSize="sm">
                  {/* Type Of Doc */}
                  <Td>
                    <Text>{level3.wfgName}</Text>
                  </Td>
                  <Td>
                    {level3.workflowValues.length > 0 ? (
                      <Text>{level3.workflowValues[0].documentName}</Text>
                    ) : (
                      <Text textAlign={"center"}>{"-"}</Text>
                    )}
                  </Td>
                  <Td>
                    {level3.workflowValues.length > 0 ? (
                      <Text>{level3.workflowValues[0].documentNumber}</Text>
                    ) : (
                      <Text textAlign={"center"}>{"-"}</Text>
                    )}
                  </Td>
                  <Td>
                    {level3.workflowValues.length > 0 ? (
                      <Text>
                        {convertToCustomDateFormat(
                          level3.workflowValues[0].documentDate
                        )}
                      </Text>
                    ) : (
                      <Text textAlign={"center"}>{"-"}</Text>
                    )}
                  </Td>
                  <Td>
                    {level3.workflowValues.length > 0 ? (
                      <Text textAlign={"center"}>
                        {level3.workflowValues[0].documentVersion}
                      </Text>
                    ) : (
                      <Text textAlign={"center"}>{"-"}</Text>
                    )}
                  </Td>
                  <Td>
                    <Flex
                      as={Stack}
                      textAlign={"center"}
                      justifyContent={"center"}
                      align={"center"}
                      w={"full"}
                    >
                      {level3.workflowValues.length > 0 ? (
                        <Tooltip
                          rounded={"md"}
                          hasArrow
                          label={"File sudah di upload"}
                          bg={"secondary.500"}
                          color={"white"}
                        >
                          <Icon as={FiCheckCircle} color={"green.500"} />
                        </Tooltip>
                      ) : (
                        <Tooltip
                          rounded={"md"}
                          hasArrow
                          label={"Belum ada upload files"}
                          bg={"yellow.300"}
                          color={"gray.800"}
                        >
                          <Icon as={FiAlertTriangle} color={"yellow.300"} />
                        </Tooltip>
                      )}
                    </Flex>
                  </Td>
                  {/* ACTION */}
                  <Td>
                    <HStack spacing={2}>
                      <Button
                        size="xs"
                        colorScheme="blue"
                        variant="outline"
                        leftIcon={<FiUpload />}
                      >
                        Upload
                      </Button>
                      <Button
                        size="xs"
                        colorScheme="gray"
                        variant="outline"
                        leftIcon={<FiEye />}
                      >
                        Detail
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Flex>
      </Collapse>
    </Box>
  );
};

// Workflow Level 1 Component
interface WorkflowLevel1Props {
  workflow: any;
}

export const WorkflowLevel1Box = ({ workflow }: WorkflowLevel1Props) => {
  const { colorMode } = useColorMode();
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });

  return (
    <Card
      shadow="md"
      rounded={radiusStyle}
      bgColor={colorMode === "light" ? "white" : "gray.800"}
    >
      <CardHeader
        p={4}
        cursor="pointer"
        onClick={onToggle}
        _hover={{
          rounded: radiusStyle,
          bg: colorMode === "light" ? "gray.50" : "secondary.200",
        }}
        mb={2}
      >
        <HStack justify="space-between">
          <Text fontWeight={600} color="secondary.600">
            {workflow.wfgName}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {isOpen ? "−" : "+"}
          </Text>
        </HStack>
      </CardHeader>
      <Collapse in={isOpen}>
        <CardBody pt={0}>
          <VStack spacing={3} align="stretch">
            {workflow.workflowChild?.map((level2: any) => (
              <WorkflowLevel2Box key={level2.id} workflow={level2} />
            ))}
          </VStack>
        </CardBody>
      </Collapse>
    </Card>
  );
};
