"use client";

import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  Box,
  Text,
  Badge,
  HStack,
  useColorMode,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  ButtonGroup,
  Grid,
  GridItem,
  Flex,
  Stack,
  Divider,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { FiLayers, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { BacklogDataResponse } from "@/app/services/useRequirements";
import { useState } from "react";
import { InputLayoutFull } from "@/app/components/layoutContentBody";
import { radiusStyle } from "@/app/constants/applicationConstants";

interface BacklogsSectionProps {
  backlogList: BacklogDataResponse[];
  backlogStats?: any;
  requirementType?: string | null;
}

export const BacklogsSection = ({
  backlogList,
  requirementType,
}: BacklogsSectionProps) => {
  const { colorMode } = useColorMode();
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  if (!backlogList || backlogList.length === 0) {
    return null;
  }

  const isRfc = requirementType === "RFC";

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case "CRITICAL":
        return "red";
      case "HIGH":
        return "orange";
      case "MEDIUM":
        return "yellow";
      case "LOW":
        return "green";
      default:
        return "gray";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "DONE":
        return "green";
      case "IN_PROGRESS":
        return "blue";
      case "TODO":
        return "gray";
      default:
        return "gray";
    }
  };

  return (
    <Card
      shadow="sm"
      rounded="xl"
      border="1px"
      borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
    >
      <CardHeader
        bg={colorMode === "light" ? "cyan.50" : "cyan.900"}
        roundedTop="xl"
        py={4}
      >
        <HStack spacing={3} justify="space-between">
          <HStack spacing={3}>
            <Box
              w={10}
              h={10}
              bgGradient="linear(135deg, cyan.400, cyan.600)"
              rounded="xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <FiLayers size={20} color="white" />
            </Box>
            <Heading
              size="md"
              color={colorMode === "light" ? "cyan.700" : "cyan.200"}
            >
              Data Scope Projects
            </Heading>
          </HStack>
          <Badge colorScheme="cyan" fontSize="sm" px={3} py={1} rounded="full">
            {backlogList.length} Total
          </Badge>
        </HStack>
      </CardHeader>
      <CardBody p={isRfc ? 6 : 0}>
        {isRfc ? (
          <RfcBacklogView backlogList={backlogList} colorMode={colorMode} />
        ) : (
          <StandardBacklogView
            backlogList={backlogList}
            colorMode={colorMode}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
          />
        )}
      </CardBody>
    </Card>
  );
};

// Standard view for BRD/No Requirement
interface StandardBacklogViewProps {
  backlogList: BacklogDataResponse[];
  colorMode: string;
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  itemsPerPage: number;
}

const StandardBacklogView = ({
  backlogList,
  colorMode,
  getPriorityColor,
  getStatusColor,
  currentPage,
  setCurrentPage,
  itemsPerPage,
}: StandardBacklogViewProps) => {
  const totalPages = Math.ceil(backlogList.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = backlogList.slice(startIndex, endIndex);

  return (
    <>
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead bg={colorMode === "light" ? "gray.50" : "gray.700"}>
            <Tr>
              <Th>Name</Th>
              <Th>Description</Th>
              <Th>Urgency</Th>
              <Th>Impact</Th>
              <Th>Priority</Th>
            </Tr>
          </Thead>
          <Tbody>
            {currentData.map((backlog) => (
              <Tr
                key={backlog.id}
                _hover={{
                  bg: colorMode === "light" ? "gray.50" : "gray.700",
                }}
              >
                <Td>
                  <Text fontSize="sm" fontWeight="medium">
                    {backlog.backlogName}
                  </Text>
                </Td>
                <Td>
                  <Text fontSize="sm" noOfLines={2}>
                    {backlog.backlogDesc || "-"}
                  </Text>
                </Td>
                <Td>
                  <Badge colorScheme="orange" fontSize="xs">
                    {backlog.urgency || "LOW"}
                  </Badge>
                </Td>
                <Td>
                  <Badge colorScheme="red" fontSize="xs">
                    {backlog.impact || "LOW"}
                  </Badge>
                </Td>
                <Td>
                  <Badge
                    colorScheme={getPriorityColor(backlog.priority)}
                    fontSize="xs"
                  >
                    {backlog.priority || "LOW"}
                  </Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {totalPages > 1 && (
        <Box
          p={4}
          borderTop="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        >
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, backlogList.length)} of {backlogList.length}{" "}
              entries
            </Text>
            <ButtonGroup size="sm" variant="outline">
              <Button
                leftIcon={<FiChevronLeft />}
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                isDisabled={currentPage === 0}
              >
                Previous
              </Button>
              <Button isDisabled>
                Page {currentPage + 1} of {totalPages}
              </Button>
              <Button
                rightIcon={<FiChevronRight />}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                }
                isDisabled={currentPage === totalPages - 1}
              >
                Next
              </Button>
            </ButtonGroup>
          </HStack>
        </Box>
      )}
    </>
  );
};

// RFC view with two-column layout
interface RfcBacklogViewProps {
  backlogList: BacklogDataResponse[];
  colorMode: string;
}

const RfcBacklogView = ({ backlogList, colorMode }: RfcBacklogViewProps) => {
  const sortedBacklogs = [...backlogList].sort(
    (a, b) => (b.posOrder || 0) - (a.posOrder || 0)
  );

  return (
    <Flex as={Stack} w={"full"} spacing={5}>
      {sortedBacklogs.map((backlog, index) => {
        const latestHistory =
          backlog.backlogHistories && backlog.backlogHistories.length > 0
            ? backlog.backlogHistories[backlog.backlogHistories.length - 1]
            : null;

        return (
          <Grid
            key={backlog.id}
            templateColumns="repeat(2, 1fr)"
            gap={4}
            w={"full"}
          >
            <GridItem colSpan={2} w={"full"}>
              <Flex as={HStack} w={"full"} justifyContent={"space-between"}>
                <Heading as="h5" size="sm">
                  Perubahan Sistem - {index + 1}
                </Heading>
                <Badge colorScheme="blue" size="sm">
                  {backlog.posOrder || index + 1}
                </Badge>
              </Flex>
            </GridItem>

            {/* Kondisi Eksisting - Left Column */}
            <GridItem colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }} w={"full"}>
              <Flex
                as={Stack}
                w={"full"}
                p={5}
                rounded={radiusStyle}
                border={"2px"}
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                spacing={2}
                boxShadow={"md"}
                h={"full"}
              >
                <Flex w={"full"} as={HStack} justifyContent={"space-between"}>
                  <Heading as="h5" size="sm">
                    Kondisi Eksisting
                  </Heading>
                  <Badge
                    colorScheme={"gray"}
                    fontSize={"medium"}
                    px={2}
                    rounded={"md"}
                  >
                    Lama
                  </Badge>
                </Flex>
                <Divider borderColor={"gray.300"} />

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Nama Scope
                    </FormLabel>
                    <Text>{latestHistory?.backlogName || "-"}</Text>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Deskripsi
                    </FormLabel>
                    <Text>{latestHistory?.backlogDesc || "-"}</Text>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Catatan
                    </FormLabel>
                    <Text>{latestHistory?.note || "-"}</Text>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Order Position
                    </FormLabel>
                    <Badge colorScheme="gray">
                      {latestHistory?.posOrder || 0}
                    </Badge>
                  </InputLayoutFull>
                </FormControl>
              </Flex>
            </GridItem>

            {/* Kondisi Perubahan - Right Column */}
            <GridItem colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }} w={"full"}>
              <Flex
                as={Stack}
                w={"full"}
                p={5}
                rounded={radiusStyle}
                border={"2px"}
                borderColor={"secondary.300"}
                spacing={2}
                boxShadow={"md"}
                minH={"280px"}
              >
                <Flex w={"full"} as={HStack} justifyContent={"space-between"}>
                  <Heading as="h5" size="sm">
                    Kondisi Perubahan
                  </Heading>
                  <Badge
                    colorScheme={"secondary"}
                    fontSize={"medium"}
                    px={2}
                    rounded={"md"}
                  >
                    Baru
                  </Badge>
                </Flex>
                <Divider borderColor={"gray.300"} />

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Nama Scope
                    </FormLabel>
                    <Text>{backlog.backlogName || "-"}</Text>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Deskripsi
                    </FormLabel>
                    <Text>{backlog.backlogDesc || "-"}</Text>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Catatan
                    </FormLabel>
                    <Text>{backlog.note || "-"}</Text>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Order Position
                    </FormLabel>
                    <Badge colorScheme="secondary">
                      {backlog.posOrder || 0}
                    </Badge>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Jenis Perubahan
                    </FormLabel>
                    <Badge colorScheme="blue">
                      {backlog.rfcBacklogChanges || "-"}
                    </Badge>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Tingkat Kepentingan
                    </FormLabel>
                    <Badge colorScheme="cyan">
                      {backlog.rfcBacklogImportant || "-"}
                    </Badge>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Dampak Terhadap Sistem Lain
                    </FormLabel>
                    <Badge colorScheme="teal">
                      {backlog.rfcBacklogImpactOthers || "-"}
                    </Badge>
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Priority
                    </FormLabel>
                    <Badge colorScheme="pink">
                      {backlog.rfcPriorities || "-"}
                    </Badge>
                  </InputLayoutFull>
                </FormControl>
              </Flex>
            </GridItem>
          </Grid>
        );
      })}
    </Flex>
  );
};
