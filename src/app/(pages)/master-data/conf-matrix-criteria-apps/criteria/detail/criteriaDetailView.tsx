"use client";

import { HeaderContent } from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { TableComponentFull } from "@/app/components/tableComponents";
import { InputLayout, InputLayoutFull } from "@/app/components/layoutContentBody";
import { radiusStyle, RES_CODE_OK, RES_GENERIC_ERROR_MSG } from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useMstAppsCriteria, {
  MstAppsCriteriaResponse, MstAppsCriteriaValueResponse,
} from "@/app/services/useMstAppsCriteria";
import {
  Badge, Box, Card, CardBody, CardHeader, Divider, Flex,
  FormControl, FormLabel, Heading, HStack, Icon,
  IconButton, Input, Text, Textarea, useColorMode, VStack,
} from "@chakra-ui/react";
import {
  ColumnDef, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, useReactTable,
} from "@tanstack/react-table";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { FiGrid } from "react-icons/fi";

export default function CriteriaDetailView() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const showToast = useToastHelper();
  const router = useRouter();
  const searchParams = useSearchParams();
  const criteriaId = searchParams.get("id");

  const { GetById } = useMstAppsCriteria();
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState("");
  const [data, setData] = useState<MstAppsCriteriaResponse | null>(null);

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;
    if (DataAuth == null && storedData) setDataAuth((JSON.parse(storedData) as AuthDataModelInterface).dataLogin as AuthDataResponse);
    if (token) setTokenData(token);
  }, [DataAuth]);

  useEffect(() => {
    if (!tokenData || !criteriaId) return;
    GetById(criteriaId, tokenData).then(res => {
      if (res?.statusCode === RES_CODE_OK && res.data) setData(res.data);
      else showToast({ description: res?.message || RES_GENERIC_ERROR_MSG, statusToast: "error" });
    });
  }, [tokenData]);

  const valueColumns = useMemo<ColumnDef<MstAppsCriteriaValueResponse>[]>(() => [
    {
      accessorKey: "numbData",
      cell: (info) => <Flex justifyContent="center"><Text fontSize="sm">{info.row.index + 1}.</Text></Flex>,
      header: () => <Flex justifyContent="center">No.</Flex>,
      footer: (props) => props.column.id,
    },
    {
      accessorKey: "scaleValue",
      cell: (info) => (
        <Badge colorScheme="purple" fontFamily="mono" fontSize="sm">
          {Number(info.getValue() as number).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 3 })}
        </Badge>
      ),
      header: () => <Text>Scale Value</Text>,
      footer: (props) => props.column.id,
    },
    {
      accessorKey: "scaleLabel",
      cell: (info) => <Text fontSize="sm" fontWeight="semibold">{info.getValue() as string}</Text>,
      header: () => <Text>Scale Label</Text>,
      footer: (props) => props.column.id,
    },
    {
      accessorKey: "scaleDesc",
      cell: (info) => (
        <Text fontSize="sm" color={isDark ? "gray.400" : "gray.600"}>
          {(info.getValue() as string) || "-"}
        </Text>
      ),
      header: () => <Text>Description</Text>,
      footer: (props) => props.column.id,
    },
  ], [isDark]);

  const valuesTable = useReactTable({
    data: (data?.values || []).slice().sort((a, b) => a.scaleValue - b.scaleValue),
    columns: valueColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <LayoutAdmin>
      <HeaderContent titleName="Criteria Detail" breadCrumb={["Home", "Master Data", "Criteria Apps", "Detail"]} />
      <Box p={4}>
        <VStack spacing={5} align="stretch">

          {/* Page Header */}
          <HStack spacing={3}>
            <IconButton
              as="a"
              href="/master-data/conf-matrix-criteria-apps?tab=CRITERIA"
              aria-label="Back"
              icon={<FaArrowLeft />}
              variant="ghost"
              size="sm"
            />
            <Box w={9} h={9} bg="purple.500" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white">
              <Icon as={FiGrid} boxSize={4} />
            </Box>
            <VStack align="start" spacing={0}>
              <Heading size="md" color={isDark ? "white" : "gray.800"}>{data?.criteriaName || "Loading..."}</Heading>
              <Badge colorScheme="purple" variant="subtle" fontSize="xs">{data?.criteriaCode}</Badge>
            </VStack>
          </HStack>

          {/* Criteria Info Card */}
          <Card rounded={radiusStyle} shadow="md" border="1px" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.800" : "white"}>
            <CardHeader py={4} px={6}>
              <Heading size="sm" color={isDark ? "gray.100" : "gray.700"}>Criteria Information</Heading>
            </CardHeader>
            <Divider borderColor={isDark ? "gray.700" : "gray.100"} />
            <CardBody>
              <VStack spacing={4} align="stretch" px={2}>

                <FormControl>
                  <InputLayout>
                    <FormLabel fontSize="sm" fontWeight="semibold" color={isDark ? "gray.300" : "gray.600"}>
                      Criteria Code
                    </FormLabel>
                    <Input value={data?.criteriaCode || ""} isReadOnly variant="filled"
                      bg={isDark ? "gray.700" : "gray.100"} color={isDark ? "gray.400" : "gray.500"} />
                  </InputLayout>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel fontSize="sm" fontWeight="semibold" color={isDark ? "gray.300" : "gray.600"}>
                      Criteria Name
                    </FormLabel>
                    <Input value={data?.criteriaName || ""} isReadOnly variant="filled"
                      bg={isDark ? "gray.700" : "gray.100"} fontWeight="semibold" />
                  </InputLayoutFull>
                </FormControl>

                <FormControl>
                  <InputLayout>
                    <FormLabel fontSize="sm" fontWeight="semibold" color={isDark ? "gray.300" : "gray.600"}>
                      Position
                    </FormLabel>
                    <Input value={data?.criteriaPos ?? ""} isReadOnly variant="filled"
                      bg={isDark ? "gray.700" : "gray.100"} />
                  </InputLayout>
                </FormControl>

                <FormControl>
                  <InputLayoutFull>
                    <FormLabel fontSize="sm" fontWeight="semibold" color={isDark ? "gray.300" : "gray.600"}>
                      Description
                    </FormLabel>
                    <Textarea value={data?.criteriaDesc || ""} isReadOnly variant="filled"
                      bg={isDark ? "gray.700" : "gray.100"} rows={3} resize="none"
                      placeholder={!data?.criteriaDesc ? "No description" : ""} />
                  </InputLayoutFull>
                </FormControl>

              </VStack>
            </CardBody>
          </Card>

          {/* Values Card */}
          <Card rounded={radiusStyle} shadow="md" border="1px" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.800" : "white"}>
            <CardHeader py={4} px={6}>
              <HStack justify="space-between">
                <VStack align="start" spacing={0}>
                  <Heading size="sm" color={isDark ? "gray.100" : "gray.700"}>Scale Values</Heading>
                  <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>{data?.values?.length || 0} value(s) configured</Text>
                </VStack>
              </HStack>
            </CardHeader>
            <Divider borderColor={isDark ? "gray.700" : "gray.100"} />
            <CardBody>
              <TableComponentFull table={valuesTable} />
            </CardBody>
          </Card>

        </VStack>
      </Box>
    </LayoutAdmin>
  );
}
