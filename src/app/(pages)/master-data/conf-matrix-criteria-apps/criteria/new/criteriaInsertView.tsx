"use client";

import { HeaderContent } from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { InputLayout, InputLayoutFull } from "@/app/components/layoutContentBody";
import { radiusStyle, RES_CODE_OK } from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useMstAppsCriteria, { MstAppsCriteriaInsertRequest, MstAppsCriteriaValueInputRequest } from "@/app/services/useMstAppsCriteria";
import {
  Badge, Box, Button, Card, CardBody, CardHeader, Divider, Flex,
  FormControl, FormErrorMessage, FormLabel, Heading, HStack, Icon,
  IconButton, Input, Stack, Text, Textarea, useColorMode, VStack,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { FiGrid, FiPlus, FiSave, FiTrash2, FiChevronUp, FiChevronDown } from "react-icons/fi";
import * as Yup from "yup";

const schema = Yup.object({
  criteriaName: Yup.string().required("Criteria name is required"),
  criteriaPos: Yup.number().required("Position is required").min(0),
});

export default function CriteriaInsertView() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const showToast = useToastHelper();
  const router = useRouter();
  const { Insert, List } = useMstAppsCriteria();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState("");
  const [saving, setSaving] = useState(false);
  const [nextPos, setNextPos] = useState(1);
  const [valueRows, setValueRows] = useState<MstAppsCriteriaValueInputRequest[]>([
    { scaleValue: 1, scaleLabel: "Scale-1", scaleDesc: "" },
  ]);

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;
    if (DataAuth == null && storedData) setDataAuth((JSON.parse(storedData) as AuthDataModelInterface).dataLogin as AuthDataResponse);
    if (token) {
      setTokenData(token);
      // Fetch latest position
      List({ search: "", limit: 1000, page: 0, filterWhere: [], fieldOrder: ["criteriaPos"], orderDir: "desc" }, token)
        .then(res => {
          if (res?.statusCode === RES_CODE_OK && res.data?.length > 0) {
            const maxPos = Math.max(...res.data.map((d: any) => d.criteriaPos || 0));
            setNextPos(maxPos + 1);
          }
        });
    }
  }, [DataAuth]);

  const formik = useFormik<MstAppsCriteriaInsertRequest>({
    initialValues: { criteriaName: "", criteriaDesc: "", criteriaPos: nextPos, values: [] },
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (values) => {
      setSaving(true);
      const res = await Insert({ ...values, criteriaName: values.criteriaName.toUpperCase(), values: valueRows }, tokenData);
      setSaving(false);
      if (res?.statusCode === RES_CODE_OK) {
        showToast({ description: "Criteria created successfully", statusToast: "success" });
        router.push("/master-data/conf-matrix-criteria-apps?tab=CRITERIA");
      } else {
        showToast({ description: res?.message || "Failed to create criteria", statusToast: "error" });
      }
    },
  });

  const addValueRow = () => setValueRows(prev => {
    const next = prev.length + 1;
    return [...prev, { scaleValue: next, scaleLabel: `Scale-${next}`, scaleDesc: "" }];
  });

  const removeValueRow = (i: number) => setValueRows(prev => {
    const updated = prev.filter((_, idx) => idx !== i);
    return updated.map((row, idx) => ({ ...row, scaleValue: idx + 1 }));
  });

  const moveRow = (i: number, dir: -1 | 1) => setValueRows(prev => {
    const next = [...prev];
    const target = i + dir;
    if (target < 0 || target >= next.length) return prev;
    [next[i], next[target]] = [next[target], next[i]];
    return next.map((row, idx) => ({ ...row, scaleValue: idx + 1 }));
  });

  const updateValueRow = (i: number, key: keyof MstAppsCriteriaValueInputRequest, val: any) =>
    setValueRows(prev => prev.map((row, idx) => idx === i ? { ...row, [key]: val } : row));

  return (
    <LayoutAdmin>
      <HeaderContent titleName="Add New Apps Criteria" breadCrumb={["Home", "Master Data", "Criteria Apps", "Add New"]} />
      <Box p={4}>
        <form onSubmit={formik.handleSubmit}>
          <VStack spacing={5} align="stretch">

            {/* Page Header */}
            <HStack spacing={3}>
              <IconButton aria-label="Back" icon={<FaArrowLeft />} variant="ghost" size="sm" onClick={() => router.back()} />
              <Box w={9} h={9} bg="purple.500" rounded="lg" display="flex" alignItems="center" justifyContent="center" color="white">
                <Icon as={FiGrid} boxSize={4} />
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size="md" color={isDark ? "white" : "gray.800"}>Add New Apps Criteria</Heading>
                <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>Fill in criteria information and scale values</Text>
              </VStack>
            </HStack>

            {/* Criteria Information Card */}
            <Card rounded={radiusStyle} shadow="md" border="1px" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.800" : "white"}>
              <CardHeader py={4} px={6}>
                <Heading size="sm" color={isDark ? "gray.100" : "gray.700"}>Criteria Information</Heading>
              </CardHeader>
              <Divider borderColor={isDark ? "gray.700" : "gray.100"} />
              <CardBody>
                <Flex as={Stack} w="full" spacing={5} p={2}>

                  <FormControl isInvalid={!!(formik.errors.criteriaName && formik.touched.criteriaName)}>
                    <InputLayoutFull>
                      <FormLabel h="full" mt={2} fontSize="sm" fontWeight="semibold" color={isDark ? "gray.300" : "gray.600"}>
                        Criteria Name <Text as="span" color="red.400">*</Text>
                      </FormLabel>
                      <Stack spacing={1}>
                        <Input name="criteriaName" value={formik.values.criteriaName}
                          onChange={(e) => formik.setFieldValue("criteriaName", e.target.value.toUpperCase())}
                          onBlur={formik.handleBlur} placeholder="e.g. PERFORMANCE"
                          variant="filled" bg={isDark ? "gray.700" : "gray.50"} />
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
                          isReadOnly variant="filled" bg={isDark ? "gray.600" : "gray.100"}
                          color={isDark ? "gray.400" : "gray.500"} cursor="not-allowed" />
                        <Text fontSize="xs" color={isDark ? "gray.500" : "gray.400"}>Auto-assigned position</Text>
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
                        onChange={formik.handleChange} rows={3} placeholder="Optional description"
                        variant="filled" bg={isDark ? "gray.700" : "gray.50"} />
                    </InputLayoutFull>
                  </FormControl>

                </Flex>
              </CardBody>
            </Card>

            {/* Scale Values Card */}
            <Card rounded={radiusStyle} shadow="md" border="1px" borderColor={isDark ? "gray.700" : "gray.200"} bg={isDark ? "gray.800" : "white"}>
              <CardHeader py={4} px={6}>
                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Heading size="sm" color={isDark ? "gray.100" : "gray.700"}>Scale Values</Heading>
                    <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>{valueRows.length} value(s) configured</Text>
                  </VStack>
                  <Button size="sm" colorScheme="purple" variant="outline" leftIcon={<FiPlus />} onClick={addValueRow}>Add Value</Button>
                </HStack>
              </CardHeader>
              <Divider borderColor={isDark ? "gray.700" : "gray.100"} />
              <CardBody>
                <Flex as={Stack} w="full" spacing={3} p={2}>
                  {valueRows.map((row, i) => (
                    <Flex key={i} gap={4} align="flex-end" p={4} bg={isDark ? "gray.750" : "gray.50"}
                      rounded="lg" border="1px" borderColor={isDark ? "gray.600" : "gray.200"}>
                      {/* Up/Down nav */}
                      <VStack spacing={0}>
                        <IconButton aria-label="Move up" icon={<FiChevronUp />} size="xs" variant="ghost"
                          onClick={() => moveRow(i, -1)} isDisabled={i === 0} />
                        <Badge colorScheme="purple" variant="solid" fontSize="sm" px={2} py={1} minW="30px" textAlign="center">{row.scaleValue}</Badge>
                        <IconButton aria-label="Move down" icon={<FiChevronDown />} size="xs" variant="ghost"
                          onClick={() => moveRow(i, 1)} isDisabled={i === valueRows.length - 1} />
                      </VStack>
                      <FormControl flex="0 0 110px">
                        <FormLabel fontSize="xs" mb={1} color={isDark ? "gray.400" : "gray.500"} fontWeight="semibold">Scale Value</FormLabel>
                        <Input type="number" size="sm" value={row.scaleValue} isReadOnly
                          variant="filled" bg={isDark ? "gray.600" : "gray.100"} color={isDark ? "gray.400" : "gray.500"} cursor="not-allowed" />
                      </FormControl>
                      <FormControl flex={2}>
                        <FormLabel fontSize="xs" mb={1} color={isDark ? "gray.400" : "gray.500"} fontWeight="semibold">Scale Label</FormLabel>
                        <Input size="sm" value={row.scaleLabel}
                          onChange={(e) => updateValueRow(i, "scaleLabel", e.target.value.toUpperCase())}
                          placeholder="e.g. EXCELLENT" variant="filled" bg={isDark ? "gray.700" : "white"} />
                      </FormControl>
                      <FormControl flex={3}>
                        <FormLabel fontSize="xs" mb={1} color={isDark ? "gray.400" : "gray.500"} fontWeight="semibold">Description</FormLabel>
                        <Input size="sm" value={row.scaleDesc || ""}
                          onChange={(e) => updateValueRow(i, "scaleDesc", e.target.value)}
                          placeholder="Optional" variant="filled" bg={isDark ? "gray.700" : "white"} />
                      </FormControl>
                      <IconButton aria-label="Remove" icon={<FiTrash2 />} size="sm" colorScheme="red" variant="ghost"
                        onClick={() => removeValueRow(i)} isDisabled={valueRows.length === 1} />
                    </Flex>
                  ))}
                </Flex>
              </CardBody>
            </Card>

            {/* Actions */}
            <Flex justify="flex-end" gap={3}>
              <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" colorScheme="purple" leftIcon={<FiSave />} isLoading={saving} loadingText="Saving...">Save Criteria</Button>
            </Flex>

          </VStack>
        </form>
      </Box>
    </LayoutAdmin>
  );
}
