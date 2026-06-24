"use client";

import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import { radiusStyle, RES_CODE_OK } from "@/app/constants/applicationConstants";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import useMstAppsCriteria, {
  MstAppsCriteriaValueInsertRequest,
  MstAppsCriteriaValueResponse,
  MstAppsCriteriaValueUpdateRequest,
} from "@/app/services/useMstAppsCriteria";
import {
  Button, FormControl, FormErrorMessage, FormLabel, Grid, GridItem,
  HStack, Input, Modal, ModalBody, ModalCloseButton, ModalContent,
  ModalFooter, ModalHeader, ModalOverlay, Stack, Text, Textarea, useColorMode,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import { useState } from "react";
import * as Yup from "yup";

const valueSchema = Yup.object({
  scaleLabel: Yup.string().required("Label is required"),
  scaleValue: Yup.number().required("Value is required"),
});

export function CriteriaValueInsertModal({ isOpen, onClose, token, criteriaId, onSuccess }:
  { isOpen: boolean; onClose: () => void; token: string; criteriaId: string; onSuccess: () => void }) {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const { InsertValue } = useMstAppsCriteria();
  const [loading, setLoading] = useState(false);

  const formik = useFormik<Omit<MstAppsCriteriaValueInsertRequest, "criteriaId">>({
    initialValues: { scaleValue: 0, scaleLabel: "", scaleDesc: "" },
    validationSchema: valueSchema,
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      const res = await InsertValue({ ...values, criteriaId, scaleLabel: values.scaleLabel.toUpperCase() }, token);
      setLoading(false);
      if (res?.statusCode === RES_CODE_OK) {
        showToast({ description: "Value added successfully", statusToast: "success" });
        resetForm();
        onSuccess();
        onClose();
      } else {
        showToast({ description: res?.message || "Failed to add value", statusToast: "error" });
      }
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={() => { formik.resetForm(); onClose(); }} size="md">
      <ModalOverlay />
      <ModalContent rounded={radiusStyle}>
        <form onSubmit={formik.handleSubmit}>
          <ModalHeader>Add Scale Value</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <Grid templateColumns="1fr 1fr" gap={4}>
                <GridItem>
                  <FormControl isInvalid={!!(formik.errors.scaleValue && formik.touched.scaleValue)}>
                    <FormLabel fontSize="sm">Scale Value <Text as="span" color="red.400">*</Text></FormLabel>
                    <Input type="number" step="0.001" name="scaleValue" value={formik.values.scaleValue}
                      onChange={(e) => { const v = e.target.value; const d = v.includes(".") ? v.split(".")[1].length : 0; if (d <= 3) formik.setFieldValue("scaleValue", parseFloat(v) || 0); }}
                      onBlur={formik.handleBlur} bg={isDark ? "gray.700" : "white"} />
                    <FormErrorMessage>{formik.errors.scaleValue}</FormErrorMessage>
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl isInvalid={!!(formik.errors.scaleLabel && formik.touched.scaleLabel)}>
                    <FormLabel fontSize="sm">Scale Label <Text as="span" color="red.400">*</Text></FormLabel>
                    <Input name="scaleLabel" value={formik.values.scaleLabel}
                      onChange={(e) => formik.setFieldValue("scaleLabel", e.target.value.toUpperCase())}
                      onBlur={formik.handleBlur} placeholder="e.g. EXCELLENT" bg={isDark ? "gray.700" : "white"} />
                    <FormErrorMessage>{formik.errors.scaleLabel}</FormErrorMessage>
                  </FormControl>
                </GridItem>
              </Grid>
              <FormControl>
                <FormLabel fontSize="sm">Description</FormLabel>
                <Textarea name="scaleDesc" value={formik.values.scaleDesc || ""} onChange={formik.handleChange} rows={2} bg={isDark ? "gray.700" : "white"} />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" onClick={() => { formik.resetForm(); onClose(); }}>Cancel</Button>
            <Button type="submit" colorScheme="purple" isLoading={loading}>Add Value</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

export function CriteriaValueEditModal({ isOpen, onClose, token, data, onSuccess }:
  { isOpen: boolean; onClose: () => void; token: string; data: MstAppsCriteriaValueResponse | null; onSuccess: () => void }) {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const { UpdateValue } = useMstAppsCriteria();
  const [loading, setLoading] = useState(false);

  const formik = useFormik<MstAppsCriteriaValueUpdateRequest>({
    initialValues: { id: data?.id || "", scaleValue: data?.scaleValue || 0, scaleLabel: data?.scaleLabel || "", scaleDesc: data?.scaleDesc || "" },
    enableReinitialize: true,
    validationSchema: valueSchema,
    onSubmit: async (values) => {
      setLoading(true);
      const res = await UpdateValue({ ...values, scaleLabel: values.scaleLabel.toUpperCase() }, token);
      setLoading(false);
      if (res?.statusCode === RES_CODE_OK) {
        showToast({ description: "Value updated successfully", statusToast: "success" });
        onSuccess();
        onClose();
      } else {
        showToast({ description: res?.message || "Failed to update value", statusToast: "error" });
      }
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent rounded={radiusStyle}>
        <form onSubmit={formik.handleSubmit}>
          <ModalHeader>Edit Scale Value</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <Grid templateColumns="1fr 1fr" gap={4}>
                <GridItem>
                  <FormControl isInvalid={!!(formik.errors.scaleValue && formik.touched.scaleValue)}>
                    <FormLabel fontSize="sm">Scale Value <Text as="span" color="red.400">*</Text></FormLabel>
                    <Input type="number" step="0.001" name="scaleValue" value={formik.values.scaleValue}
                      onChange={(e) => { const v = e.target.value; const d = v.includes(".") ? v.split(".")[1].length : 0; if (d <= 3) formik.setFieldValue("scaleValue", parseFloat(v) || 0); }}
                      onBlur={formik.handleBlur} bg={isDark ? "gray.700" : "white"} />
                    <FormErrorMessage>{formik.errors.scaleValue}</FormErrorMessage>
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl isInvalid={!!(formik.errors.scaleLabel && formik.touched.scaleLabel)}>
                    <FormLabel fontSize="sm">Scale Label <Text as="span" color="red.400">*</Text></FormLabel>
                    <Input name="scaleLabel" value={formik.values.scaleLabel}
                      onChange={(e) => formik.setFieldValue("scaleLabel", e.target.value.toUpperCase())}
                      onBlur={formik.handleBlur} bg={isDark ? "gray.700" : "white"} />
                    <FormErrorMessage>{formik.errors.scaleLabel}</FormErrorMessage>
                  </FormControl>
                </GridItem>
              </Grid>
              <FormControl>
                <FormLabel fontSize="sm">Description</FormLabel>
                <Textarea name="scaleDesc" value={formik.values.scaleDesc || ""} onChange={formik.handleChange} rows={2} bg={isDark ? "gray.700" : "white"} />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" colorScheme="orange" isLoading={loading}>Update Value</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

export function CriteriaValueDeleteConfirm({ isOpen, trigger, token, deletingId, onSuccess }:
  { isOpen: boolean; trigger: (v: boolean) => void; token: string; deletingId: string; onSuccess: () => void }) {
  const showToast = useToastHelper();
  const { DeleteValue } = useMstAppsCriteria();

  return (
    <ConfirmationDialog isOpenTrigger={isOpen} trigger={trigger}
      action={async () => {
        const res = await DeleteValue(deletingId, token);
        if (res?.statusCode === RES_CODE_OK) { showToast({ description: "Value deleted", statusToast: "success" }); onSuccess(); }
        else showToast({ description: res?.message || "Failed to delete value", statusToast: "error" });
      }}
      captionMsg="Delete Scale Value" questionMsg="Are you sure you want to delete this scale value?" />
  );
}
