"use client";

import { ProjectDataResponse } from "@/app/services/useProjects";
import useProjects, { ProjectUpdatePayload } from "@/app/services/useProjects";
import useOrganization, { OrganizationResponse } from "@/app/services/useOrganization";
import useConstants, { ConstantDataResponse } from "@/app/services/useConstants";
import { Select } from "chakra-react-select";
import {
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useColorMode,
  Box,
  SimpleGrid,
  Alert,
  AlertIcon,
  Divider,
  Icon,
} from "@chakra-ui/react";
import { FiEdit3, FiSave, FiX, FiSettings, FiRefreshCcw, FiAlertTriangle, FiPauseCircle, FiXCircle, FiPlayCircle } from "react-icons/fi";
import { useState, useEffect } from "react";
import { radiusStyle, RES_CODE_OK, RES_GENERIC_ERROR_MSG, MAX_SIZE_TABLE } from "@/app/constants/applicationConstants";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import { PaggingListPayload } from "@/app/types/masterTypes";
import { ConfirmationDialog } from "@/app/components/confirmationDialog";

interface ProjectEditSectionProps {
  DataProject: ProjectDataResponse | null;
  canMake: boolean;
  onRefresh?: () => void;
}

const ProjectEditSection = ({ DataProject, canMake, onRefresh }: ProjectEditSectionProps) => {
  const { colorMode } = useColorMode();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const showToast = useToastHelper();
  const { UpdateProjects, RequestHoldProject, RequestCancelProject, ResumeProject } = useProjects();
  const { List: ListOrganizations } = useOrganization();
  const { ListConstantData } = useConstants();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // Hold/Cancel/Resume state
  const [isRequestingHold, setIsRequestingHold] = useState(false);
  const [isRequestingCancel, setIsRequestingCancel] = useState(false);
  const [isRequestingResume, setIsRequestingResume] = useState(false);
  const [openConfirmHold, setOpenConfirmHold] = useState(false);
  const [openConfirmCancel, setOpenConfirmCancel] = useState(false);
  const [openConfirmResume, setOpenConfirmResume] = useState(false);

  const handleRequestHold = async () => {
    if (!DataProject?.id || !tokenData) return;
    setIsRequestingHold(true);
    const response = await RequestHoldProject({ projectId: DataProject.id }, tokenData);
    if (response?.statusCode === RES_CODE_OK) {
      showToast({ description: response.message || "Request On Hold submitted", statusToast: "success" });
      if (onRefresh) onRefresh();
    } else {
      showToast({ description: response?.message || "Failed to request hold", statusToast: "error" });
    }
    setIsRequestingHold(false);
  };

  const handleRequestCancel = async () => {
    if (!DataProject?.id || !tokenData) return;
    setIsRequestingCancel(true);
    const response = await RequestCancelProject({ projectId: DataProject.id }, tokenData);
    if (response?.statusCode === RES_CODE_OK) {
      showToast({ description: response.message || "Request Cancel submitted", statusToast: "success" });
      if (onRefresh) onRefresh();
    } else {
      showToast({ description: response?.message || "Failed to request cancel", statusToast: "error" });
    }
    setIsRequestingCancel(false);
  };

  const handleResumeProject = async () => {
    if (!DataProject?.id || !tokenData) return;
    setIsRequestingResume(true);
    const response = await ResumeProject({ projectId: DataProject.id }, tokenData);
    if (response?.statusCode === RES_CODE_OK) {
      showToast({ description: response.message || "Resume submitted. Waiting for approval.", statusToast: "success" });
      if (onRefresh) onRefresh();
    } else {
      showToast({ description: response?.message || "Failed to resume project", statusToast: "error" });
    }
    setIsRequestingResume(false);
  };

  const [organizations, setOrganizations] = useState<OrganizationResponse[]>([]);
  const [acquisitionCodes, setAcquisitionCodes] = useState<ConstantDataResponse[]>([]);
  const [characteristicCodes, setCharacteristicCodes] = useState<ConstantDataResponse[]>([]);
  const [subCharacteristicCodes, setSubCharacteristicCodes] = useState<ConstantDataResponse[]>([]);

  const [formData, setFormData] = useState({
    projectNo: "",
    projectAcquisitionCode: "",
    projectName: "",
    proOwnerDirectorateId: "",
    proOwnerDivisionId: "",
    proOwnerGroupId: "",
    projectCharasteristicCode: "",
    projectSubCharasteristicCode: "",
    projectDesc: "",
    projectRegisterDate: "",
    note: "",
  });

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;
    
    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse = StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }
    
    if (token) setTokenData(token);
  }, [DataAuth]);

  useEffect(() => {
    const loadData = async () => {
      if (!tokenData) return;

      const payload: PaggingListPayload = {
        page: 0,
        limit: MAX_SIZE_TABLE,
        search: "",
        filterWhere: [],
        fieldOrder: ["orgName"],
        orderDir: "asc",
      };

      const acqPayload: PaggingListPayload = {
        page: 0,
        limit: MAX_SIZE_TABLE,
        search: "",
        filterWhere: [
          { field: "groupCode", operator: "=", value: "PROJECT_ACQUISITION" },
          { field: "parentGroupCode", operator: "is null", value: "null" }
        ],
        fieldOrder: ["createdAt"],
        orderDir: "desc",
      };

      const charPayload: PaggingListPayload = {
        page: 0,
        limit: MAX_SIZE_TABLE,
        search: "",
        filterWhere: [
          { field: "groupCode", operator: "=", value: "PROJECT_CHARACTERISTICS" },
          { field: "parentGroupCode", operator: "is null", value: "null" }
        ],
        fieldOrder: ["createdAt"],
        orderDir: "desc",
      };

      try {
        const [orgsRes, acqRes, charRes] = await Promise.all([
          ListOrganizations(payload, tokenData),
          ListConstantData(acqPayload, tokenData),
          ListConstantData(charPayload, tokenData),
        ]);

        if (orgsRes?.data) setOrganizations(orgsRes.data);
        if (acqRes?.data) setAcquisitionCodes(acqRes.data);
        if (charRes?.data) setCharacteristicCodes(charRes.data);
      } catch (error) {
        console.error("Error loading dropdown data:", error);
      }
    };

    loadData();
  }, [tokenData]);

  useEffect(() => {
    const loadSubChars = async () => {
      if (!tokenData || !formData.projectCharasteristicCode) {
        setSubCharacteristicCodes([]);
        return;
      }

      const subCharPayload: PaggingListPayload = {
        page: 0,
        limit: MAX_SIZE_TABLE,
        search: "",
        filterWhere: [
          { field: "groupCode", operator: "=", value: "PROJECT_CHARACTERISTICS" },
          { field: "parentGroupCode", operator: "=", value: formData.projectCharasteristicCode }
        ],
        fieldOrder: ["createdAt"],
        orderDir: "desc",
      };

      try {
        const subCharRes = await ListConstantData(subCharPayload, tokenData);
        if (subCharRes?.data) setSubCharacteristicCodes(subCharRes.data);
      } catch (error) {
        console.error("Error loading sub-characteristics:", error);
      }
    };

    loadSubChars();
  }, [formData.projectCharasteristicCode, tokenData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Reload dropdown data
      const payload: PaggingListPayload = {
        page: 0,
        limit: MAX_SIZE_TABLE,
        search: "",
        filterWhere: [],
        fieldOrder: ["orgName"],
        orderDir: "asc",
      };

      const acqPayload: PaggingListPayload = {
        page: 0,
        limit: MAX_SIZE_TABLE,
        search: "",
        filterWhere: [
          { field: "groupCode", operator: "=", value: "PROJECT_ACQUISITION" },
          { field: "parentGroupCode", operator: "is null", value: "null" }
        ],
        fieldOrder: ["createdAt"],
        orderDir: "desc",
      };

      const charPayload: PaggingListPayload = {
        page: 0,
        limit: MAX_SIZE_TABLE,
        search: "",
        filterWhere: [
          { field: "groupCode", operator: "=", value: "PROJECT_CHARACTERISTICS" },
          { field: "parentGroupCode", operator: "is null", value: "null" }
        ],
        fieldOrder: ["createdAt"],
        orderDir: "desc",
      };

      const [orgsRes, acqRes, charRes] = await Promise.all([
        ListOrganizations(payload, tokenData),
        ListConstantData(acqPayload, tokenData),
        ListConstantData(charPayload, tokenData),
      ]);

      if (orgsRes?.data) setOrganizations(orgsRes.data);
      if (acqRes?.data) setAcquisitionCodes(acqRes.data);
      if (charRes?.data) setCharacteristicCodes(charRes.data);

      // Call parent refresh
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (DataProject) {
      setFormData({
        projectNo: DataProject.projectNo || "",
        projectAcquisitionCode: DataProject.projectAcquisitionCode || "",
        projectName: DataProject.projectName || "",
        proOwnerDirectorateId: DataProject.proOwnerDirectorateId || "",
        proOwnerDivisionId: DataProject.proOwnerDivisionId || "",
        proOwnerGroupId: DataProject.proOwnerGroupId || "",
        projectCharasteristicCode: DataProject.projectCharasteristicCode || "",
        projectSubCharasteristicCode: DataProject.projectSubCharasteristicCode || "",
        projectDesc: DataProject.projectDesc || "",
        projectRegisterDate: DataProject.projectRegisterDate ? DataProject.projectRegisterDate.split('T')[0] : "",
        note: DataProject.note || "",
      });
    }
  }, [DataProject]);

  const handleSave = async () => {
    if (!DataProject || !tokenData) return;

    setIsSaving(true);
    try {
      const payload: ProjectUpdatePayload = {
        id: DataProject.id,
        projectNo: formData.projectNo,
        projectName: formData.projectName,
        projectDesc: formData.projectDesc || null,
        note: formData.note || null,
        projectCategory: DataProject.projectCategory,
        projectType: DataProject.projectType,
        projectRegisterDate: formData.projectRegisterDate || null,
        projectClosedDate: DataProject.projectClosedDate,
        projectAcquisitionCode: formData.projectAcquisitionCode || null,
        projectCharasteristicCode: formData.projectCharasteristicCode || null,
        projectSubCharasteristicCode: formData.projectSubCharasteristicCode || null,
        proOwnerDirectorateId: formData.proOwnerDirectorateId || null,
        proManageByDirectorateId: DataProject.proManageByDirectorateId,
        proOwnerDivisionId: formData.proOwnerDivisionId || null,
        proOwnerGroupId: formData.proOwnerGroupId || null,
        proManageByDivisionId: DataProject.proManageByDivisionId,
        proManageByGroupId: DataProject.proManageByGroupId,
        proManageByTeamId: DataProject.proManageByTeamId,
      };

      const response = await UpdateProjects(payload, tokenData);

      if (response?.statusCode === RES_CODE_OK) {
        showToast({
          description: "Project updated successfully",
          statusToast: "success",
        });
        setIsEditing(false);
        if (onRefresh) onRefresh();
      } else {
        showToast({
          description: response?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
      }
    } catch (error) {
      console.error("Error updating project:", error);
      showToast({
        description: "Failed to update project",
        statusToast: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!DataProject) {
    return <Text color="gray.500">No project data available.</Text>;
  }

  return (
    <VStack spacing={8} align="stretch">
      <HStack justify="space-between" align="center">
        <VStack align="start" spacing={1}>
          <Heading size="lg" color={colorMode === "light" ? "gray.800" : "white"}>
            Project Options
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Manage project settings, edit information, and project actions
          </Text>
        </VStack>
        <HStack spacing={3}>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<FiRefreshCcw />}
            colorScheme="gray"
            rounded="full"
            onClick={handleRefresh}
            isLoading={isRefreshing}
          >
            Refresh
          </Button>
        </HStack>
      </HStack>

      <Card shadow="lg" rounded="xl" border="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
        <CardHeader bg={colorMode === "light" ? "gray.50" : "gray.900"} roundedTop="xl" borderBottom="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
          <HStack justify="space-between" align="center">
            <HStack spacing={3}>
              <Box
                w={10}
                h={10}
                bgGradient="linear(135deg, blue.400, blue.600)"
                rounded="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FiEdit3 size={20} color="white" />
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size="sm" color={colorMode === "light" ? "gray.800" : "gray.100"}>
                  Project Information
                </Heading>
                <Text fontSize="xs" color="gray.500">
                  Detail dan konfigurasi informasi project
                </Text>
              </VStack>
            </HStack>
            <Button
              size="sm"
              colorScheme={isEditing ? "red" : "blue"}
              leftIcon={isEditing ? <FiX /> : <FiEdit3 />}
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "solid"}
              rounded="full"
              isDisabled={true}
            >
              {isEditing ? "Cancel" : "Edit Information"}
            </Button>
          </HStack>
        </CardHeader>

        <CardBody p={0}>
          <VStack spacing={0} align="stretch" divider={<Divider borderColor={colorMode === "light" ? "gray.100" : "gray.700"} />}>
            {/* Project Number */}
            <HStack justify="space-between" align="center" px={6} py={4} _hover={{ bg: colorMode === "light" ? "gray.50" : "gray.750" }}>
              <VStack align="start" spacing={0} minW="200px">
                <Text fontSize="sm" fontWeight="600" color={colorMode === "light" ? "gray.700" : "gray.200"}>Nomor Project</Text>
                <Text fontSize="xs" color="gray.500">Kode unik identifikasi project</Text>
              </VStack>
              <Box flex={1} maxW="400px">
                <Input
                  value={formData.projectNo}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectNo: e.target.value }))}
                  isReadOnly={!isEditing}
                  bg={isEditing ? "white" : colorMode === "light" ? "gray.50" : "gray.700"}
                  rounded="lg"
                  size="sm"
                />
              </Box>
            </HStack>

            {/* Jenis Pengadaan - Only for PROCUREMENT */}
            {DataProject?.projectType === "PROCUREMENT" && (
              <HStack justify="space-between" align="center" px={6} py={4} _hover={{ bg: colorMode === "light" ? "gray.50" : "gray.750" }}>
                <VStack align="start" spacing={0} minW="200px">
                  <Text fontSize="sm" fontWeight="600" color={colorMode === "light" ? "gray.700" : "gray.200"}>Jenis Pengadaan</Text>
                  <Text fontSize="xs" color="gray.500">Tipe akuisisi project</Text>
                </VStack>
                <Box flex={1} maxW="400px">
                  <Select
                    options={acquisitionCodes.map(acq => ({
                      label: acq.label,
                      value: acq.value,
                    }))}
                    value={acquisitionCodes.filter(a => a.value === formData.projectAcquisitionCode).map(a => ({
                      label: a.label,
                      value: a.value,
                    }))[0]}
                    onChange={(e) => {
                      if (e) {
                        setFormData(prev => ({ ...prev, projectAcquisitionCode: e.value }));
                      }
                    }}
                    isDisabled={!isEditing}
                    placeholder="Pilih Jenis Pengadaan"
                    isClearable
                    size="sm"
                  />
                </Box>
              </HStack>
            )}

            {/* Project Name */}
            <HStack justify="space-between" align="center" px={6} py={4} _hover={{ bg: colorMode === "light" ? "gray.50" : "gray.750" }}>
              <VStack align="start" spacing={0} minW="200px">
                <Text fontSize="sm" fontWeight="600" color={colorMode === "light" ? "gray.700" : "gray.200"}>Nama Project</Text>
                <Text fontSize="xs" color="gray.500">Nama lengkap project</Text>
              </VStack>
              <Box flex={1} maxW="400px">
                <Input
                  value={formData.projectName}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value.toUpperCase() }))}
                  isReadOnly={!isEditing}
                  bg={isEditing ? "white" : colorMode === "light" ? "gray.50" : "gray.700"}
                  rounded="lg"
                  size="sm"
                />
              </Box>
            </HStack>

            {/* Divisi Yang Menginisiasi */}
            <Box px={6} py={4} _hover={{ bg: colorMode === "light" ? "gray.50" : "gray.750" }}>
              <VStack align="start" spacing={3} w="full">
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" fontWeight="600" color={colorMode === "light" ? "gray.700" : "gray.200"}>Divisi Yang Menginisiasi</Text>
                  <Text fontSize="xs" color="gray.500">Organisasi penginisiasi project</Text>
                </VStack>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} w="full">
                  <FormControl>
                    <FormLabel fontSize="xs" color="gray.500">Direktorat</FormLabel>
                    <Select
                      options={organizations.filter(o => o.orgType === "DIRECTORATE").map(o => ({
                        label: `${o.orgName}`,
                        value: o.id,
                      }))}
                      value={organizations.filter(o => o.id === formData.proOwnerDirectorateId).map(o => ({
                        label: `${o.orgName}`,
                        value: o.id,
                      }))[0]}
                      isDisabled={true}
                      placeholder="Direktorat"
                      size="sm"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="xs" color="gray.500">Divisi</FormLabel>
                    <Select
                      options={organizations.filter(o => o.orgType === "DIVISION").map(o => ({
                        label: `${o.orgName}`,
                        value: o.id,
                      }))}
                      value={organizations.filter(o => o.id === formData.proOwnerDivisionId).map(o => ({
                        label: `${o.orgName}`,
                        value: o.id,
                      }))[0]}
                      onChange={(e) => {
                        if (e) {
                          setFormData(prev => ({ ...prev, proOwnerDivisionId: e.value, proOwnerGroupId: "" }));
                          const division = organizations.find(o => o.id === e.value);
                          if (division?.parentId) {
                            setFormData(prev => ({ ...prev, proOwnerDirectorateId: division.parentId || "" }));
                          }
                        }
                      }}
                      isDisabled={!isEditing}
                      placeholder="Divisi"
                      size="sm"
                      isClearable
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="xs" color="gray.500">Grup</FormLabel>
                    <Select
                      options={organizations.filter(o => o.orgType === "GROUP" && o.parentId === formData.proOwnerDivisionId).map(o => ({
                        label: `${o.orgName}`,
                        value: o.id,
                      }))}
                      value={organizations.filter(o => o.id === formData.proOwnerGroupId).map(o => ({
                        label: `${o.orgName}`,
                        value: o.id,
                      }))[0]}
                      onChange={(e) => {
                        if (e) {
                          setFormData(prev => ({ ...prev, proOwnerGroupId: e.value }));
                        }
                      }}
                      isDisabled={!isEditing || !formData.proOwnerDivisionId}
                      placeholder="Grup"
                      size="sm"
                      isClearable
                    />
                  </FormControl>
                </SimpleGrid>
              </VStack>
            </Box>

            {/* Karakteristik Project */}
            <HStack justify="space-between" align="center" px={6} py={4} _hover={{ bg: colorMode === "light" ? "gray.50" : "gray.750" }}>
              <VStack align="start" spacing={0} minW="200px">
                <Text fontSize="sm" fontWeight="600" color={colorMode === "light" ? "gray.700" : "gray.200"}>Karakteristik Project</Text>
                <Text fontSize="xs" color="gray.500">Kategori karakteristik</Text>
              </VStack>
              <Box flex={1} maxW="400px">
                <Select
                  options={characteristicCodes.map(c => ({
                    label: c.label,
                    value: c.value,
                  }))}
                  value={characteristicCodes.filter(c => c.value === formData.projectCharasteristicCode).map(c => ({
                    label: c.label,
                    value: c.value,
                  }))[0]}
                  onChange={(e) => {
                    if (e) {
                      setFormData(prev => ({ ...prev, projectCharasteristicCode: e.value, projectSubCharasteristicCode: "" }));
                    }
                  }}
                  isDisabled={!isEditing}
                  placeholder="Pilih Karakteristik"
                  isClearable
                  size="sm"
                />
              </Box>
            </HStack>

            {/* Sub Karakteristik */}
            <HStack justify="space-between" align="center" px={6} py={4} _hover={{ bg: colorMode === "light" ? "gray.50" : "gray.750" }}>
              <VStack align="start" spacing={0} minW="200px">
                <Text fontSize="sm" fontWeight="600" color={colorMode === "light" ? "gray.700" : "gray.200"}>Sub Karakteristik</Text>
                <Text fontSize="xs" color="gray.500">Detail sub kategori</Text>
              </VStack>
              <Box flex={1} maxW="400px">
                <Select
                  options={subCharacteristicCodes.map(c => ({
                    label: c.label,
                    value: c.value,
                  }))}
                  value={subCharacteristicCodes.filter(c => c.value === formData.projectSubCharasteristicCode).map(c => ({
                    label: c.label,
                    value: c.value,
                  }))[0]}
                  onChange={(e) => {
                    if (e) {
                      setFormData(prev => ({ ...prev, projectSubCharasteristicCode: e.value }));
                    }
                  }}
                  isDisabled={!isEditing || !formData.projectCharasteristicCode}
                  placeholder="Pilih Sub Karakteristik"
                  isClearable
                  size="sm"
                />
              </Box>
            </HStack>

            {/* Deskripsi */}
            <HStack justify="space-between" align="start" px={6} py={4} _hover={{ bg: colorMode === "light" ? "gray.50" : "gray.750" }}>
              <VStack align="start" spacing={0} minW="200px" pt={1}>
                <Text fontSize="sm" fontWeight="600" color={colorMode === "light" ? "gray.700" : "gray.200"}>Deskripsi</Text>
                <Text fontSize="xs" color="gray.500">Keterangan project</Text>
              </VStack>
              <Box flex={1} maxW="400px">
                <Textarea
                  value={formData.projectDesc}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectDesc: e.target.value }))}
                  isReadOnly={!isEditing}
                  bg={isEditing ? "white" : colorMode === "light" ? "gray.50" : "gray.700"}
                  rounded="lg"
                  rows={2}
                  maxLength={300}
                  size="sm"
                />
              </Box>
            </HStack>

            {/* Tanggal Register */}
            <HStack justify="space-between" align="center" px={6} py={4} _hover={{ bg: colorMode === "light" ? "gray.50" : "gray.750" }}>
              <VStack align="start" spacing={0} minW="200px">
                <Text fontSize="sm" fontWeight="600" color={colorMode === "light" ? "gray.700" : "gray.200"}>Tanggal Register</Text>
                <Text fontSize="xs" color="gray.500">Tanggal pendaftaran project</Text>
              </VStack>
              <Box flex={1} maxW="400px">
                <Input
                  type="date"
                  value={formData.projectRegisterDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectRegisterDate: e.target.value }))}
                  isDisabled={!isEditing}
                  bg={isEditing ? "white" : colorMode === "light" ? "gray.50" : "gray.700"}
                  rounded="lg"
                  size="sm"
                />
              </Box>
            </HStack>

            {/* Note */}
            <HStack justify="space-between" align="start" px={6} py={4} _hover={{ bg: colorMode === "light" ? "gray.50" : "gray.750" }}>
              <VStack align="start" spacing={0} minW="200px" pt={1}>
                <Text fontSize="sm" fontWeight="600" color={colorMode === "light" ? "gray.700" : "gray.200"}>Catatan</Text>
                <Text fontSize="xs" color="gray.500">Catatan tambahan</Text>
              </VStack>
              <Box flex={1} maxW="400px">
                <Textarea
                  value={formData.note}
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                  isReadOnly={!isEditing}
                  bg={isEditing ? "white" : colorMode === "light" ? "gray.50" : "gray.700"}
                  rounded="lg"
                  rows={2}
                  maxLength={300}
                  size="sm"
                />
              </Box>
            </HStack>

            {/* Save Button */}
            {isEditing && (
              <HStack justify="flex-end" px={6} py={4}>
                <Button
                  colorScheme="green"
                  leftIcon={<FiSave />}
                  size="md"
                  rounded="full"
                  onClick={handleSave}
                  isLoading={isSaving}
                  loadingText="Saving..."
                >
                  Save Changes
                </Button>
              </HStack>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Danger Zone - Hold/Cancel/Resume */}
      {DataProject && (DataProject.projectStatus === "INITIATING" || DataProject.projectStatus === "RUNNING" || DataProject.projectStatus === "ON HOLD") && (
        <Card
          w="full"
          shadow="md"
          rounded={radiusStyle}
          border="2px"
          borderColor={colorMode === "light" ? "red.200" : "red.700"}
          bg={colorMode === "light" ? "red.50" : "gray.800"}
        >
          <CardHeader pb={2}>
            <HStack spacing={3}>
              <Icon as={FiAlertTriangle} color="red.500" boxSize={5} />
              <Heading size="sm" color="red.600">
                Danger Zone
              </Heading>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color={colorMode === "light" ? "gray.600" : "gray.400"}>
                Aksi di bawah ini akan mengubah status project secara signifikan. Pastikan Anda memahami konsekuensi dari setiap aksi.
              </Text>

              <Divider borderColor={colorMode === "light" ? "red.200" : "red.700"} />

              {/* Request On Hold */}
              {(DataProject.projectStatus === "INITIATING" || DataProject.projectStatus === "RUNNING") && (
                <Box
                  p={4}
                  rounded={radiusStyle}
                  border="1px"
                  borderColor={colorMode === "light" ? "orange.200" : "orange.700"}
                  bg={colorMode === "light" ? "orange.50" : "gray.750"}
                >
                  <HStack justify="space-between" align="center" wrap="wrap" gap={3}>
                    <VStack align="start" spacing={1} flex={1}>
                      <HStack>
                        <Icon as={FiPauseCircle} color="orange.500" />
                        <Text fontWeight="600" fontSize="sm" color={colorMode === "light" ? "gray.800" : "gray.100"}>
                          Request On Hold
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        Mengajukan permohonan untuk menahan project. Memerlukan persetujuan approver.
                      </Text>
                    </VStack>
                    <Button
                      size="sm"
                      colorScheme="orange"
                      variant="outline"
                      leftIcon={<FiPauseCircle />}
                      isLoading={isRequestingHold}
                      onClick={() => setOpenConfirmHold(true)}
                    >
                      Request On Hold
                    </Button>
                  </HStack>
                </Box>
              )}

              {/* Request Cancel */}
              {(DataProject.projectStatus === "INITIATING" || DataProject.projectStatus === "RUNNING") && (
                <Box
                  p={4}
                  rounded={radiusStyle}
                  border="1px"
                  borderColor={colorMode === "light" ? "red.200" : "red.700"}
                  bg={colorMode === "light" ? "red.50" : "gray.750"}
                >
                  <HStack justify="space-between" align="center" wrap="wrap" gap={3}>
                    <VStack align="start" spacing={1} flex={1}>
                      <HStack>
                        <Icon as={FiXCircle} color="red.500" />
                        <Text fontWeight="600" fontSize="sm" color={colorMode === "light" ? "gray.800" : "gray.100"}>
                          Request Cancel Project
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        Mengajukan permohonan pembatalan project. Bersifat permanen setelah disetujui.
                      </Text>
                    </VStack>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      leftIcon={<FiXCircle />}
                      isLoading={isRequestingCancel}
                      onClick={() => setOpenConfirmCancel(true)}
                    >
                      Request Cancel
                    </Button>
                  </HStack>
                </Box>
              )}

              {/* Resume Project */}
              {DataProject.projectStatus === "ON HOLD" && (
                <Box
                  p={4}
                  rounded={radiusStyle}
                  border="1px"
                  borderColor={colorMode === "light" ? "green.200" : "green.700"}
                  bg={colorMode === "light" ? "green.50" : "gray.750"}
                >
                  <HStack justify="space-between" align="center" wrap="wrap" gap={3}>
                    <VStack align="start" spacing={1} flex={1}>
                      <HStack>
                        <Icon as={FiPlayCircle} color="green.500" />
                        <Text fontWeight="600" fontSize="sm" color={colorMode === "light" ? "gray.800" : "gray.100"}>
                          Resume Project
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.500">
                        Melanjutkan project yang sedang ditahan. Project akan masuk kembali ke proses approval.
                      </Text>
                    </VStack>
                    <Button
                      size="sm"
                      colorScheme="green"
                      variant="solid"
                      leftIcon={<FiPlayCircle />}
                      isLoading={isRequestingResume}
                      onClick={() => setOpenConfirmResume(true)}
                    >
                      Resume Project
                    </Button>
                  </HStack>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        key={"confirmRequestHoldEdit"}
        isOpenTrigger={openConfirmHold}
        action={handleRequestHold}
        trigger={setOpenConfirmHold}
        questionMsg={"Apakah Anda yakin ingin mengajukan permohonan On Hold untuk project ini?\n\nProject akan menunggu persetujuan dari approver sebelum status berubah menjadi ON HOLD."}
        captionMsg={"Request On Hold"}
      />
      <ConfirmationDialog
        key={"confirmRequestCancelEdit"}
        isOpenTrigger={openConfirmCancel}
        action={handleRequestCancel}
        trigger={setOpenConfirmCancel}
        questionMsg={"Apakah Anda yakin ingin mengajukan permohonan Cancel untuk project ini?\n\nProject akan menunggu persetujuan dari approver sebelum status berubah menjadi CANCELED. Aksi ini bersifat permanen setelah disetujui."}
        captionMsg={"Request Cancel"}
      />
      <ConfirmationDialog
        key={"confirmResumeProjectEdit"}
        isOpenTrigger={openConfirmResume}
        action={handleResumeProject}
        trigger={setOpenConfirmResume}
        questionMsg={"Apakah Anda yakin ingin melanjutkan (resume) project ini?\n\nProject akan masuk kembali ke proses approval dari awal (Waiting Approval 1) sebelum kembali berjalan."}
        captionMsg={"Resume Project"}
      />
    </VStack>
  );
};

export default ProjectEditSection;
