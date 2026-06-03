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
} from "@chakra-ui/react";
import { FiEdit3, FiSave, FiX, FiSettings, FiRefreshCcw } from "react-icons/fi";
import { useState, useEffect } from "react";
import { radiusStyle, RES_CODE_OK, RES_GENERIC_ERROR_MSG, MAX_SIZE_TABLE } from "@/app/constants/applicationConstants";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import { PaggingListPayload } from "@/app/types/masterTypes";

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
  const { UpdateProjects } = useProjects();
  const { List: ListOrganizations } = useOrganization();
  const { ListConstantData } = useConstants();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

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
            Edit Project
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Manage project information and settings
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

      <Card shadow="lg" rounded="xl" border="1px" borderColor="gray.100">
        <CardHeader bg="blue.50" roundedTop="xl">
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
                <FiSettings size={20} color="white" />
              </Box>
              <Heading size="md" color="blue.700">
                Project Information
              </Heading>
            </HStack>
            <Button
              size="sm"
              colorScheme={isEditing ? "red" : "blue"}
              leftIcon={isEditing ? <FiX /> : <FiEdit3 />}
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "solid"}
              rounded="full"
              // isDisabled={isSaving || !canMake}
              isDisabled={true}
            >
              {isEditing ? "Cancel" : "Edit Project"}
            </Button>
          </HStack>
        </CardHeader>

        <CardBody p={6}>
          <VStack spacing={6} align="stretch">
            {/* Project Number */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
                Nomor Project
              </FormLabel>
              <Input
                value={formData.projectNo}
                onChange={(e) => setFormData(prev => ({ ...prev, projectNo: e.target.value }))}
                isReadOnly={!isEditing}
                bg={isEditing ? "white" : "gray.50"}
                rounded="lg"
              />
            </FormControl>

            {/* Jenis Pengadaan - Only for PROCUREMENT */}
            {DataProject?.projectType === "PROCUREMENT" && (
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
                  Jenis Pengadaan
                </FormLabel>
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
                />
              </FormControl>
            )}

            {/* Project Name */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
                Nama Project
              </FormLabel>
              <Input
                value={formData.projectName}
                onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value.toUpperCase() }))}
                isReadOnly={!isEditing}
                bg={isEditing ? "white" : "gray.50"}
                rounded="lg"
              />
            </FormControl>

            {/* Divisi Yang Menginisiasi */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
                Divisi Yang Menginisiasi
              </FormLabel>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {/* Direktorat */}
                <FormControl>
                  <FormLabel fontSize="xs" color="gray.600">Direktorat</FormLabel>
                  <Select
                    options={organizations.filter(o => o.orgType === "DIRECTORATE").map(o => ({
                      label: `${o.orgName} | ${o.orgType}`,
                      value: o.id,
                    }))}
                    value={organizations.filter(o => o.id === formData.proOwnerDirectorateId).map(o => ({
                      label: `${o.orgName} | ${o.orgType}`,
                      value: o.id,
                    }))[0]}
                    isDisabled={true}
                    placeholder="Pilih Direktorat"
                    size="sm"
                  />
                </FormControl>

                {/* Divisi */}
                <FormControl>
                  <FormLabel fontSize="xs" color="gray.600">Divisi</FormLabel>
                  <Select
                    options={organizations.filter(o => o.orgType === "DIVISION").map(o => ({
                      label: `${o.orgName} | ${o.orgType}`,
                      value: o.id,
                    }))}
                    value={organizations.filter(o => o.id === formData.proOwnerDivisionId).map(o => ({
                      label: `${o.orgName} | ${o.orgType}`,
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
                    placeholder="Pilih Divisi"
                    size="sm"
                    isClearable
                  />
                </FormControl>

                {/* Grup */}
                <FormControl gridColumn={{ base: "1", md: "1 / -1" }}>
                  <FormLabel fontSize="xs" color="gray.600">Grup</FormLabel>
                  <Select
                    options={organizations.filter(o => o.orgType === "GROUP" && o.parentId === formData.proOwnerDivisionId).map(o => ({
                      label: `${o.orgName} | ${o.orgType}`,
                      value: o.id,
                    }))}
                    value={organizations.filter(o => o.id === formData.proOwnerGroupId).map(o => ({
                      label: `${o.orgName} | ${o.orgType}`,
                      value: o.id,
                    }))[0]}
                    onChange={(e) => {
                      if (e) {
                        setFormData(prev => ({ ...prev, proOwnerGroupId: e.value }));
                      }
                    }}
                    isDisabled={!isEditing || !formData.proOwnerDivisionId}
                    placeholder="Pilih Grup"
                    size="sm"
                    isClearable
                  />
                </FormControl>
              </SimpleGrid>
            </FormControl>

            {/* Karakteristik Project */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
                Karakteristik Project
              </FormLabel>
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
                placeholder="Pilih Karakteristik Project"
                isClearable
              />
            </FormControl>

            {/* Sub Karakteristik Project */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
                Sub Karakteristik Project
              </FormLabel>
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
                placeholder="Pilih Sub Karakteristik Project"
                isClearable
              />
            </FormControl>

            {/* Deskripsi */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
                Deskripsi
              </FormLabel>
              <Textarea
                value={formData.projectDesc}
                onChange={(e) => setFormData(prev => ({ ...prev, projectDesc: e.target.value }))}
                isReadOnly={!isEditing}
                bg={isEditing ? "white" : "gray.50"}
                rounded="lg"
                rows={3}
                maxLength={300}
              />
            </FormControl>

            {/* Tanggal Register Project */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
                Tanggal Register Project
              </FormLabel>
              <Input
                type="date"
                value={formData.projectRegisterDate}
                onChange={(e) => setFormData(prev => ({ ...prev, projectRegisterDate: e.target.value }))}
                isDisabled={!isEditing}
                bg={isEditing ? "white" : "gray.50"}
                rounded="lg"
              />
            </FormControl>

            {/* Note */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
                Note
              </FormLabel>
              <Textarea
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                isReadOnly={!isEditing}
                bg={isEditing ? "white" : "gray.50"}
                rounded="lg"
                rows={2}
                maxLength={300}
              />
            </FormControl>

            {/* Save Button */}
            {isEditing && (
              <HStack justify="flex-end" pt={4}>
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
    </VStack>
  );
};

export default ProjectEditSection;
