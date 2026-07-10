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
  MstAppsCriteriaResponse, MstAppsCriteriaUpdateRequest, MstAppsCriteriaValueResponse,
} from "@/app/services/useMstAppsCriteria";
import {
  Badge, Box, Button, Card, CardBody, CardHeader, Divider, Flex,
  FormControl, FormErrorMessage, FormLabel, Heading, HStack, Icon,
  IconButton, Input, Stack, Text, Textarea, useColorMode, useDisclosure, VStack,
} from "@chakra-ui/react";
import {
  ColumnDef, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, useReactTable,
} from "@tanstack/react-table";
import { useFormik } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { FiEdit, FiGrid, FiPlus, FiSave, FiTrash2, FiX } from "react-icons/fi";
import * as Yup from "yup";
import { CriteriaValueDeleteConfirm, CriteriaValueEditModal, CriteriaValueInsertModal } from "./CriteriaValueModals";

const schema = Yup.object({
  criteriaName: Yup.string().required("Criteria name is required"),
  criteriaPos: Yup.number().required("Position is required").min(0),
});

export default function CriteriaDetailView() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const showToast = useToastHelper();
  const router = useRouter();
  const searchParams = useSearchParams();
  const criteriaId = searchParams.get("id");

  const { GetById, Update } = useMstAppsCriteria();
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState("");
  const [data, setData] = useState<MstAppsCriteriaResponse | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [valuesRefresh, setValuesRefresh] = useState(0);

  const { isOpen: isInsertValOpen, onOpen: onInsertValOpen, onClose: onInsertValClose } = useDisclosure();
  const { isOpen: isEditValOpen, onOpen: onEditValOpen, onClose: onEditValClose } = useDisclosure();
  const [isDeleteValOpen, setIsDeleteValOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<MstAppsCriteriaValueResponse | null>(null);
  const [deletingValId, setDeletingValId] = useState("");

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;
    if (DataAuth == null && storedData) setDataAuth((JSON.parse(storedData) as AuthDataModelInterface).dataLogin as AuthDataResponse);
    if (token) setTokenData(token);
  }, [DataAuth]);

  const loadData = async () => {
    if (!tokenData || !criteriaId) return;
    const res = await GetById(criteriaId, tokenData);
    if (res?.statusCode === RES_CODE_OK && res.data) setData(res.data);
    else showToast({ description: res?.message || RES_GENERIC_ERROR_MSG, statusToast: "error" });
  };

  useEffect(() => { if (tokenData) loadData(); }, [tokenData, valuesRefresh]);

  const formik = useFormik<MstAppsCriteriaUpdateRequest>({
    initialValues: { id: data?.id || "", criteriaName: data?.criteriaName || "", criteriaDesc: data?.criteriaDesc || "", criteriaPos: data?.criteriaPos || 1 },
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (values) => {
      setIsSaving(true);
      const res = await Update({ ...values, criteriaName: values.criteriaName.toUpperCase() }, tokenData);
      setIsSaving(false);
      if (res?.statusCode === RES_CODE_OK) {
        showToast({ description: "Criteria updated successfully", statusToast: "success" });
        setIsEditMode(false);
        setValuesRefresh(p => p + 1);
      } else {
        showToast({ description: res?.message || "Failed to update", statusToast: "error" });
      }
    },
  });

  const valueColumns = useMemo<ColumnDef<MstAppsCriteriaValueResponse>[]>(() => [
    {
      accessorKey: "numbData",
      cell: (info) => <Flex justifyContent="center"><Text fontSize="sm">{info.row.index + 1}.</Text></Flex>,
      header: () => <Flex justifyContent="center">No.</Flex>,
      footer: (props) => props.column.id,
    },
    {
      accessorKey: "scaleValue",
      cell: (info) => <Badge colorScheme="purple" fontFamily="mono" fontSize="sm">{Number(info.getValue() as number).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 3 })}</Badge>,
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
      cell: (info) => <Text fontSize="sm" color={isDark ? "gray.400" : "gray.600"}>{(info.getValue() as string) || "-"}</Text>,
      header: () => <Text>Description</Text>,
      footer: (props) => props.column.id,
    },
    {
      id: "actions",
      header: () => <Text>Actions</Text>,
      cell: (info) => (
        <HStack spacing={1}>
          <IconButton aria-label="Edit" icon={<FiEdit />} size="sm" variant="ghost" colorScheme="blue"
            onClick={() => { setSelectedValue(info.row.original); onEditValOpen(); }} />
          <IconButton aria-label="Delete" icon={<FiTrash2 />} size="sm" variant="ghost" colorScheme="red"
            isDisabled={(data?.values?.length || 0) <= 5}
            title={(data?.values?.length || 0) <= 5 ? "Minimum 5 values required" : "Delete"}
            onClick={() => { setDeletingValId(info.row.original.id); setIsDeleteValOpen(true); }} />
        </HStack>
      ),
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
              <HStack justify="space-between">
                <Heading size="sm" color={isDark ? "gray.100" : "gray.700"}>Criteria Information</Heading>
                {!isEditMode ? (
                  <Button leftIcon={<FiEdit />} colorScheme="blue" size="sm" onClick={() => setIsEditMode(true)}>Edit</Button>
                ) : (
                  <HStack>
                    <Button leftIcon={<FiSave />} colorScheme="green" size="sm" isLoading={isSaving} onClick={() => formik.handleSubmit()}>Save</Button>
                    <Button leftIcon={<FiX />} variant="outline" size="sm" onClick={() => { formik.resetForm(); setIsEditMode(false); }}>Cancel</Button>
                  </HStack>
                )}
              </HStack>
            </CardHeader>
            <Divider borderColor={isDark ? "gray.700" : "gray.100"} />
            <CardBody>
              <form onSubmit={formik.handleSubmit}>
                <Flex as={Stack} w="full" spacing={5} p={2}>

                  <FormControl>
                    <InputLayout>
                      <FormLabel h="full" mt={2} fontSize="sm" fontWeight="semibold" color={isDark ? "gray.300" : "gray.600"}>
                        Criteria Code
                      </FormLabel>
                      <Input value={data?.criteriaCode || ""} isReadOnly variant="filled"
                        bg={isDark ? "gray.700" : "gray.100"} color={isDark ? "gray.400" : "gray.500"} />
                    </InputLayout>
                  </FormControl>

                  <FormControl isInvalid={!!(formik.errors.criteriaName && formik.touched.criteriaName)}>
                    <InputLayoutFull>
                      <FormLabel h="full" mt={2} fontSize="sm" fontWeight="semibold" color={isDark ? "gray.300" : "gray.600"}>
                        Criteria Name <Text as="span" color="red.400">*</Text>
                      </FormLabel>
                      <Stack spacing={1}>
                        <Input name="criteriaName" value={formik.values.criteriaName}
                          onChange={(e) => formik.setFieldValue("criteriaName", e.target.value.toUpperCase())}
                          onBlur={formik.handleBlur} isDisabled={!isEditMode}
                          variant={isEditMode ? "filled" : "unstyled"}
                          fontWeight={isEditMode ? "normal" : "semibold"}
                          bg={isEditMode ? (isDark ? "gray.700" : "gray.50") : "transparent"}
                          px={isEditMode ? 3 : 0} />
                        <FormErrorMessage>{formik.errors.criteriaName}</FormErrorMessage>
                      </Stack>
                    </InputLayoutFull>
                  </FormControl>

                  <FormControl isInvalid={!!(formik.errors.criteriaPos && formik.touched.criteriaPos)}>
                    <InputLayout>
                      <FormLabel h="full" mt={2} fontSize="sm" fontWeight="semibold" color={isDark ? "gray.300" : "gray.600"}>
                        Position <Text as="span" color="red.400">*</Text>
                      </FormLabel>
                      <Stack spacing={1}>
                        <Input type="number" name="criteriaPos" value={formik.values.criteriaPos}
                          onChange={formik.handleChange} onBlur={formik.handleBlur} isDisabled={!isEditMode}
                          variant={isEditMode ? "filled" : "unstyled"}
                          bg={isEditMode ? (isDark ? "gray.700" : "gray.50") : "transparent"}
                          px={isEditMode ? 3 : 0} />
                        <FormErrorMessage>{formik.errors.criteriaPos}</FormErrorMessage>
                      </Stack>
                    </InputLayout>
                  </FormControl>

                  <FormControl>
                    <InputLayoutFull>
                      <FormLabel h="full" mt={2} fontSize="sm" fontWeight="semibold" color={isDark ? "gray.300" : "gray.600"}>
                        Description
                      </FormLabel>
                      <Textarea name="criteriaDesc" value={formik.values.criteriaDesc || ""}
                        onChange={formik.handleChange} rows={3} isDisabled={!isEditMode}
                        variant={isEditMode ? "filled" : "unstyled"}
                        bg={isEditMode ? (isDark ? "gray.700" : "gray.50") : "transparent"}
                        px={isEditMode ? 3 : 0}
                        placeholder={!isEditMode && !formik.values.criteriaDesc ? "No description" : ""} />
                    </InputLayoutFull>
                  </FormControl>

                </Flex>
              </form>
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
                <Button size="sm" colorScheme="purple" variant="outline" leftIcon={<FiPlus />}
                  isDisabled={(data?.values?.length || 0) >= 5}
                  title={(data?.values?.length || 0) >= 5 ? "Maximum 5 values allowed" : "Add Value"}
                  onClick={onInsertValOpen}>Add Value</Button>
              </HStack>
            </CardHeader>
            <Divider borderColor={isDark ? "gray.700" : "gray.100"} />
            <CardBody>
              <TableComponentFull table={valuesTable} />
            </CardBody>
          </Card>

        </VStack>
      </Box>

      <CriteriaValueInsertModal isOpen={isInsertValOpen} onClose={onInsertValClose}
        token={tokenData} criteriaId={criteriaId || ""} onSuccess={() => setValuesRefresh(p => p + 1)} />
      <CriteriaValueEditModal isOpen={isEditValOpen} onClose={onEditValClose}
        token={tokenData} data={selectedValue} onSuccess={() => setValuesRefresh(p => p + 1)} />
      <CriteriaValueDeleteConfirm isOpen={isDeleteValOpen} trigger={setIsDeleteValOpen}
        token={tokenData} deletingId={deletingValId} onSuccess={() => setValuesRefresh(p => p + 1)} />
    </LayoutAdmin>
  );
}
