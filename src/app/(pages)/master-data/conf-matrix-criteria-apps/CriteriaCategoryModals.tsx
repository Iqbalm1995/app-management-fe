"use client";

import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import { CRITERIA_VALUE_OPERATORS, radiusStyle, RES_CODE_OK } from "@/app/constants/applicationConstants";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import useMstAppsCriteriaCategory, {
  MstAppsCriteriaCategoryInsertRequest,
  MstAppsCriteriaCategoryResponse,
  MstAppsCriteriaCategoryUpdateRequest,
} from "@/app/services/useMstAppsCriteriaCategory";
import {
  Badge, Box, Button, Divider, FormControl, FormErrorMessage, FormLabel,
  Grid, GridItem, HStack, Icon, IconButton, Input, Modal, ModalBody,
  ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
  Select, Stack, Text, Textarea, useColorMode, VStack,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import { useState } from "react";
import { FiHash, FiInfo, FiLayers, FiTag } from "react-icons/fi";
import * as Yup from "yup";

const insertSchema = Yup.object({
  crtCategoryName: Yup.string().required("Category name is required"),
  valueOperator: Yup.string().required("Operator is required"),
  valueTracehold: Yup.number().required("Tracehold is required").test("max-decimals", "Max 3 decimal places", v => v === undefined || Number.isInteger(v * 1000)),
});

// ---- INSERT MODAL ----
export function CriteriaCategoryInsertModal({
  isOpen, onClose, token, onSuccess,
}: { isOpen: boolean; onClose: () => void; token: string; onSuccess: () => void }) {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const { Insert } = useMstAppsCriteriaCategory();
  const [loading, setLoading] = useState(false);

  const formik = useFormik<MstAppsCriteriaCategoryInsertRequest>({
    initialValues: { crtCategoryName: "", crtCategoryDesc: "", valueOperator: "", valueTracehold: 0 },
    validationSchema: insertSchema,
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      const res = await Insert(values, token);
      setLoading(false);
      if (res?.statusCode === RES_CODE_OK) {
        showToast({ description: "Category created successfully", statusToast: "success" });
        resetForm();
        onSuccess();
        onClose();
      } else {
        showToast({ description: res?.message || "Failed to create category", statusToast: "error" });
      }
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={() => { formik.resetForm(); onClose(); }} size="lg">
      <ModalOverlay />
      <ModalContent rounded={radiusStyle}>
        <form onSubmit={formik.handleSubmit}>
          <ModalHeader>
            <HStack spacing={3}>
              <Box w={8} h={8} bg="blue.500" rounded="md" display="flex" alignItems="center" justifyContent="center" color="white">
                <Icon as={FiLayers} boxSize={4} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold" fontSize="md">Add Criteria Category</Text>
                <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"} fontWeight="normal">Create a new criteria category</Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isInvalid={!!(formik.errors.crtCategoryName && formik.touched.crtCategoryName)}>
                <FormLabel fontSize="sm">Category Name <Text as="span" color="red.400">*</Text></FormLabel>
                <Input name="crtCategoryName" value={formik.values.crtCategoryName} onChange={(e) => formik.setFieldValue("crtCategoryName", e.target.value.toUpperCase())} onBlur={formik.handleBlur} placeholder="Enter category name" bg={isDark ? "gray.700" : "white"} />
                <FormErrorMessage>{formik.errors.crtCategoryName}</FormErrorMessage>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Description</FormLabel>
                <Textarea name="crtCategoryDesc" value={formik.values.crtCategoryDesc || ""} onChange={formik.handleChange} placeholder="Optional description" rows={3} bg={isDark ? "gray.700" : "white"} />
              </FormControl>
              <Grid templateColumns="1fr 1fr" gap={4}>
                <GridItem>
                  <FormControl isInvalid={!!(formik.errors.valueOperator && formik.touched.valueOperator)}>
                    <FormLabel fontSize="sm">Value Operator <Text as="span" color="red.400">*</Text></FormLabel>
                    <Select name="valueOperator" value={formik.values.valueOperator} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder="Select operator" bg={isDark ? "gray.700" : "white"}>
                      {CRITERIA_VALUE_OPERATORS.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                    </Select>
                    <FormErrorMessage>{formik.errors.valueOperator}</FormErrorMessage>
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl isInvalid={!!(formik.errors.valueTracehold && formik.touched.valueTracehold)}>
                    <FormLabel fontSize="sm">Value Tracehold <Text as="span" color="red.400">*</Text></FormLabel>
                    <Input
                      type="number"
                      step="0.001"
                      min={0}
                      value={formik.values.valueTracehold}
                      onChange={(e) => {
                        const val = e.target.value;
                        const decimals = val.includes(".") ? val.split(".")[1].length : 0;
                        if (decimals <= 3) formik.setFieldValue("valueTracehold", parseFloat(val) || 0);
                      }}
                      onBlur={formik.handleBlur}
                      name="valueTracehold"
                      bg={isDark ? "gray.700" : "white"}
                    />
                    <FormErrorMessage>{formik.errors.valueTracehold}</FormErrorMessage>
                  </FormControl>
                </GridItem>
              </Grid>
            </Stack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" onClick={() => { formik.resetForm(); onClose(); }}>Cancel</Button>
            <Button type="submit" colorScheme="blue" isLoading={loading}>Create Category</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

// ---- EDIT MODAL ----
export function CriteriaCategoryEditModal({
  isOpen, onClose, token, data, onSuccess,
}: { isOpen: boolean; onClose: () => void; token: string; data: MstAppsCriteriaCategoryResponse | null; onSuccess: () => void }) {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const { Update } = useMstAppsCriteriaCategory();
  const [loading, setLoading] = useState(false);

  const formik = useFormik<MstAppsCriteriaCategoryUpdateRequest>({
    initialValues: {
      id: data?.id || "",
      crtCategoryName: data?.crtCategoryName || "",
      crtCategoryDesc: data?.crtCategoryDesc || "",
      valueOperator: data?.valueOperator || "",
      valueTracehold: data?.valueTracehold || 0,
    },
    enableReinitialize: true,
    validationSchema: insertSchema,
    onSubmit: async (values) => {
      setLoading(true);
      const res = await Update(values, token);
      setLoading(false);
      if (res?.statusCode === RES_CODE_OK) {
        showToast({ description: "Category updated successfully", statusToast: "success" });
        onSuccess();
        onClose();
      } else {
        showToast({ description: res?.message || "Failed to update category", statusToast: "error" });
      }
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent rounded={radiusStyle}>
        <form onSubmit={formik.handleSubmit}>
          <ModalHeader>
            <HStack spacing={3}>
              <Box w={8} h={8} bg="orange.500" rounded="md" display="flex" alignItems="center" justifyContent="center" color="white">
                <Icon as={FiLayers} boxSize={4} />
              </Box>
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold" fontSize="md">Edit Criteria Category</Text>
                <Badge colorScheme="blue" variant="subtle" fontWeight="normal" fontSize="xs">{data?.crtCategoryCode}</Badge>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm">Category Code</FormLabel>
                <Input value={data?.crtCategoryCode || ""} isReadOnly bg={isDark ? "gray.600" : "gray.50"} color={isDark ? "gray.300" : "gray.500"} />
                <Text fontSize="xs" color="gray.400" mt={1}>Auto-generated, cannot be changed</Text>
              </FormControl>
              <FormControl isInvalid={!!(formik.errors.crtCategoryName && formik.touched.crtCategoryName)}>
                <FormLabel fontSize="sm">Category Name <Text as="span" color="red.400">*</Text></FormLabel>
                <Input name="crtCategoryName" value={formik.values.crtCategoryName} onChange={(e) => formik.setFieldValue("crtCategoryName", e.target.value.toUpperCase())} onBlur={formik.handleBlur} bg={isDark ? "gray.700" : "white"} />
                <FormErrorMessage>{formik.errors.crtCategoryName}</FormErrorMessage>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Description</FormLabel>
                <Textarea name="crtCategoryDesc" value={formik.values.crtCategoryDesc || ""} onChange={formik.handleChange} rows={3} bg={isDark ? "gray.700" : "white"} />
              </FormControl>
              <Grid templateColumns="1fr 1fr" gap={4}>
                <GridItem>
                  <FormControl isInvalid={!!(formik.errors.valueOperator && formik.touched.valueOperator)}>
                    <FormLabel fontSize="sm">Value Operator <Text as="span" color="red.400">*</Text></FormLabel>
                    <Select name="valueOperator" value={formik.values.valueOperator} onChange={formik.handleChange} onBlur={formik.handleBlur} bg={isDark ? "gray.700" : "white"}>
                      {CRITERIA_VALUE_OPERATORS.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                    </Select>
                    <FormErrorMessage>{formik.errors.valueOperator}</FormErrorMessage>
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl isInvalid={!!(formik.errors.valueTracehold && formik.touched.valueTracehold)}>
                    <FormLabel fontSize="sm">Value Tracehold <Text as="span" color="red.400">*</Text></FormLabel>
                    <Input
                      type="number"
                      step="0.001"
                      min={0}
                      value={formik.values.valueTracehold}
                      onChange={(e) => {
                        const val = e.target.value;
                        const decimals = val.includes(".") ? val.split(".")[1].length : 0;
                        if (decimals <= 3) formik.setFieldValue("valueTracehold", parseFloat(val) || 0);
                      }}
                      onBlur={formik.handleBlur}
                      name="valueTracehold"
                      bg={isDark ? "gray.700" : "white"}
                    />
                    <FormErrorMessage>{formik.errors.valueTracehold}</FormErrorMessage>
                  </FormControl>
                </GridItem>
              </Grid>
            </Stack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" colorScheme="orange" isLoading={loading}>Update Category</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

// ---- DETAIL MODAL ----
export function CriteriaCategoryDetailModal({
  isOpen, onClose, data,
}: { isOpen: boolean; onClose: () => void; data: MstAppsCriteriaCategoryResponse | null }) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  if (!data) return null;

  const DetailRow = ({ icon, label, value, children }: { icon: any; label: string; value?: string; children?: React.ReactNode }) => (
    <HStack align="start" spacing={3} py={3} borderBottom="1px" borderColor={isDark ? "gray.700" : "gray.100"}>
      <Box w={8} h={8} bg={isDark ? "gray.700" : "gray.100"} rounded="md" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
        <Icon as={icon} boxSize={4} color={isDark ? "gray.400" : "gray.500"} />
      </Box>
      <VStack align="start" spacing={0} flex={1}>
        <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"} fontWeight="medium" textTransform="uppercase" letterSpacing="wider">{label}</Text>
        {children || <Text fontSize="sm" fontWeight="medium">{value || "-"}</Text>}
      </VStack>
    </HStack>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent rounded={radiusStyle}>
        <ModalHeader>
          <HStack spacing={3}>
            <Box w={8} h={8} bg="teal.500" rounded="md" display="flex" alignItems="center" justifyContent="center" color="white">
              <Icon as={FiInfo} boxSize={4} />
            </Box>
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold" fontSize="md">Criteria Category Detail</Text>
              <Badge colorScheme="teal" variant="subtle" fontWeight="normal" fontSize="xs">{data.crtCategoryCode}</Badge>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <DetailRow icon={FiTag} label="Code">
            <Badge colorScheme="blue" px={2} py={1} fontSize="sm" fontFamily="mono">{data.crtCategoryCode}</Badge>
          </DetailRow>
          <DetailRow icon={FiLayers} label="Category Name" value={data.crtCategoryName} />
          <DetailRow icon={FiInfo} label="Description" value={data.crtCategoryDesc || "No description provided"} />
          <DetailRow icon={FiHash} label="Value Condition">
            <HStack spacing={2}>
              <Badge colorScheme="orange" variant="solid" fontFamily="mono" fontSize="sm">{data.valueOperator}</Badge>
              <Text fontSize="sm" fontWeight="semibold">{data.valueTracehold}</Text>
            </HStack>
          </DetailRow>
          <Divider my={3} />
          <Grid templateColumns="1fr 1fr" gap={4}>
            <Box>
              <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"} mb={1}>Created At</Text>
              <Text fontSize="sm">{data.createdAt ? new Date(data.createdAt).toLocaleDateString("id-ID") : "-"}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"} mb={1}>Updated At</Text>
              <Text fontSize="sm">{data.updatedAt ? new Date(data.updatedAt).toLocaleDateString("id-ID") : "-"}</Text>
            </Box>
          </Grid>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// ---- DELETE CONFIRMATION ----
export function CriteriaCategoryDeleteConfirm({
  isOpen, trigger, token, deletingId, onSuccess,
}: { isOpen: boolean; trigger: (v: boolean) => void; token: string; deletingId: string; onSuccess: () => void }) {
  const showToast = useToastHelper();
  const { Delete } = useMstAppsCriteriaCategory();

  const handleConfirm = async () => {
    const res = await Delete(deletingId, token);
    if (res?.statusCode === RES_CODE_OK) {
      showToast({ description: "Category deleted successfully", statusToast: "success" });
      onSuccess();
    } else {
      showToast({ description: res?.message || "Failed to delete category", statusToast: "error" });
    }
  };

  return (
    <ConfirmationDialog
      isOpenTrigger={isOpen}
      trigger={trigger}
      action={handleConfirm}
      captionMsg="Delete Criteria Category"
      questionMsg="Are you sure you want to delete this category? This action cannot be undone."
    />
  );
}
