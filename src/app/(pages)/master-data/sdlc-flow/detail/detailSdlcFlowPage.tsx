"use client";

import {
    HeaderContent,
    HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import {
    RES_CODE_OK,
    RES_GENERIC_ERROR_MSG,
    PROJECT_TYPES,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useSdlcFlow, {
    SdlcFlowResponse,
    SdlcFlowUpdatePayload,
} from "@/app/services/useSdlcFlow";
import useSdlcFlowStage, {
    SdlcFlowStageResponse,
    SdlcFlowStageInsertPayload,
    SdlcFlowStageUpdatePayload,
} from "@/app/services/useSdlcFlowStage";
import {
    Box,
    Button,
    Card,
    CardBody,
    CardHeader,
    Divider,
    FormControl,
    FormLabel,
    Grid,
    GridItem,
    Heading,
    HStack,
    Icon,
    IconButton,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    Text,
    Textarea,
    useColorMode,
    useDisclosure,
    VStack,
    Badge,
    FormErrorMessage,
} from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FiEdit, FiPlus, FiSave, FiTrash2, FiX, FiChevronUp, FiChevronDown } from "react-icons/fi";
import { FaArrowLeft, FaProjectDiagram } from "react-icons/fa";
import { useFormik } from "formik";
import * as Yup from "yup";

function SdlcFlowDetailView() {
    const { colorMode } = useColorMode();
    const showToast = useToastHelper();
    const router = useRouter();
    const searchParams = useSearchParams();
    const flowId = searchParams.get("flowId");

    const { GetSdlcFlowById, UpdateSdlcFlow } = useSdlcFlow();
    const { ListByFlowId, Insert, Update, Delete } = useSdlcFlowStage();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
    const [tokenData, setTokenData] = useState<string>("");
    const [flowData, setFlowData] = useState<SdlcFlowResponse | null>(null);
    const [stages, setStages] = useState<SdlcFlowStageResponse[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoadingFlow, setIsLoadingFlow] = useState(true);
    const [isLoadingStages, setIsLoadingStages] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingStageId, setEditingStageId] = useState<string | null>(null);

    const [stageFormData, setStageFormData] = useState<SdlcFlowStageInsertPayload>({
        sdlcFlowId: "",
        stageCode: "",
        stageName: "",
        stagePosOrder: 1,
        stageStatusBeforeTiggerChange: "",
        stageStatusAfterTriggerChange: "",
        stageTriggerStatus: "",
        isRequired: "Y",
    });

    const ValidationSchema = Yup.object().shape({
        projectType: Yup.string().required("Project type is required"),
        sdlcCode: Yup.string().required("SDLC code is required"),
        sdlcName: Yup.string().required("SDLC name is required"),
        sdlcDesc: Yup.string(),
        isActive: Yup.string().required("Status is required"),
    });

    const formik = useFormik({
        initialValues: {
            projectType: "",
            sdlcCode: "",
            sdlcName: "",
            sdlcDesc: "",
            isActive: "Y",
        },
        validationSchema: ValidationSchema,
        validateOnChange: false,
        validateOnBlur: false,
        onSubmit: async (values) => {
            await handleSaveFlow(values);
        },
    });

    const [HeaderDataContent, setHeaderDataContent] = useState<HeaderContentProps>({
        titleName: "SDLC Flow Details",
        breadCrumb: ["Home", "Master Data", "SDLC Flow", "Details"],
    });

    useEffect(() => {
        const storedData = localStorage.getItem("authData");
        const token = localStorage.getItem("tokenData") as string;

        if (DataAuth == null && storedData) {
            const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
            setDataAuth(StorageAuth.dataLogin as AuthDataResponse);
        }

        if (token) setTokenData(token);
    }, [DataAuth]);

    useEffect(() => {
        if (flowId && tokenData && DataAuth) {
            fetchFlowData();
            fetchStages();
        }
    }, [flowId, tokenData, DataAuth]);

    useEffect(() => {
        if (flowData) {
            formik.setValues({
                projectType: flowData.projectType,
                sdlcCode: flowData.sdlcCode,
                sdlcName: flowData.sdlcName,
                sdlcDesc: flowData.sdlcDesc,
                isActive: flowData.isActive,
            });
            setHeaderDataContent({
                titleName: flowData.sdlcName,
                breadCrumb: ["Home", "Master Data", "SDLC Flow", flowData.sdlcName],
            });
        }
    }, [flowData]);

    const fetchFlowData = async () => {
        if (!flowId || !tokenData) return;

        setIsLoadingFlow(true);
        try {
            const result = await GetSdlcFlowById(flowId, tokenData);
            if (result?.statusCode === RES_CODE_OK && result.data) {
                setFlowData(result.data);
            } else {
                showToast({
                    description: result?.message || "Failed to load SDLC Flow",
                    statusToast: "error",
                });
            }
        } catch (error) {
            showToast({
                description: "Error loading SDLC Flow",
                statusToast: "error",
            });
        } finally {
            setIsLoadingFlow(false);
        }
    };

    const fetchStages = async () => {
        if (!flowId || !tokenData) return;

        setIsLoadingStages(true);
        try {
            const result = await ListByFlowId(flowId, tokenData);
            if (result?.statusCode === RES_CODE_OK && result.data) {
                setStages(result.data.sort((a, b) => a.stagePosOrder - b.stagePosOrder));
            }
        } catch (error) {
            showToast({
                description: "Error loading stages",
                statusToast: "error",
            });
        } finally {
            setIsLoadingStages(false);
        }
    };

    const handleSaveFlow = async (values: typeof formik.values) => {
        if (!flowId) return;

        setIsSaving(true);
        try {
            const payload: SdlcFlowUpdatePayload = {
                id: flowId,
                ...values,
            };

            const result = await UpdateSdlcFlow(payload, tokenData);
            if (result && result.statusCode >= 200 && result.statusCode < 300) {
                showToast({
                    description: "SDLC Flow updated successfully",
                    statusToast: "success",
                });
                setIsEditMode(false);
                fetchFlowData();
            } else {
                showToast({
                    description: result?.message || RES_GENERIC_ERROR_MSG,
                    statusToast: "error",
                });
            }
        } catch (error) {
            showToast({
                description: "Failed to update SDLC Flow",
                statusToast: "error",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleOpenStageModal = (stage?: SdlcFlowStageResponse) => {
        if (stage) {
            setEditingStageId(stage.id);
            setStageFormData({
                sdlcFlowId: stage.sdlcFlowId,
                stageCode: stage.stageCode,
                stageName: stage.stageName,
                stagePosOrder: stage.stagePosOrder,
                stageStatusBeforeTiggerChange: stage.stageStatusBeforeTiggerChange,
                stageStatusAfterTriggerChange: stage.stageStatusAfterTriggerChange,
                stageTriggerStatus: stage.stageTriggerStatus,
                isRequired: stage.isRequired,
            });
        } else {
            setEditingStageId(null);
            setStageFormData({
                sdlcFlowId: flowId || "",
                stageCode: "",
                stageName: "",
                stagePosOrder: stages.length + 1,
                stageStatusBeforeTiggerChange: "",
                stageStatusAfterTriggerChange: "",
                stageTriggerStatus: "",
                isRequired: "Y",
            });
        }
        onOpen();
    };

    const handleSaveStage = async () => {
        if (!stageFormData.stageCode || !stageFormData.stageName) {
            showToast({
                description: "Code and Name are required",
                statusToast: "error",
            });
            return;
        }

        setIsSaving(true);
        try {
            let result;
            if (editingStageId) {
                const payload: SdlcFlowStageUpdatePayload = {
                    id: editingStageId,
                    ...stageFormData,
                };
                result = await Update(payload, tokenData);
            } else {
                result = await Insert(stageFormData, tokenData);
            }

            if (result && result.statusCode >= 200 && result.statusCode < 300) {
                showToast({
                    description: `Stage ${editingStageId ? "updated" : "created"} successfully`,
                    statusToast: "success",
                });
                onClose();
                fetchStages();
            } else {
                showToast({
                    description: result?.message || RES_GENERIC_ERROR_MSG,
                    statusToast: "error",
                });
            }
        } catch (error) {
            showToast({
                description: "Failed to save stage",
                statusToast: "error",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteStage = async (id: string) => {
        if (!confirm("Are you sure you want to delete this stage?")) return;

        try {
            const result = await Delete(id, tokenData);
            if (result && result.statusCode >= 200 && result.statusCode < 300) {
                showToast({
                    description: "Stage deleted successfully",
                    statusToast: "success",
                });
                fetchStages();
            } else {
                showToast({
                    description: result?.message || RES_GENERIC_ERROR_MSG,
                    statusToast: "error",
                });
            }
        } catch (error) {
            showToast({
                description: "Failed to delete stage",
                statusToast: "error",
            });
        }
    };

    const handleMoveStage = async (index: number, direction: "up" | "down") => {
        if (
            (direction === "up" && index === 0) ||
            (direction === "down" && index === stages.length - 1)
        ) {
            return;
        }

        const newStages = [...stages];
        const targetIndex = direction === "up" ? index - 1 : index + 1;

        // Swap positions
        const currentStage = newStages[index];
        const targetStage = newStages[targetIndex];

        const tempOrder = currentStage.stagePosOrder;
        currentStage.stagePosOrder = targetStage.stagePosOrder;
        targetStage.stagePosOrder = tempOrder;

        // Update both stages in backend
        setIsSaving(true);
        try {
            const payload1: SdlcFlowStageUpdatePayload = {
                id: currentStage.id,
                sdlcFlowId: currentStage.sdlcFlowId,
                stageCode: currentStage.stageCode,
                stageName: currentStage.stageName,
                stagePosOrder: currentStage.stagePosOrder,
                stageStatusBeforeTiggerChange: currentStage.stageStatusBeforeTiggerChange,
                stageStatusAfterTriggerChange: currentStage.stageStatusAfterTriggerChange,
                stageTriggerStatus: currentStage.stageTriggerStatus,
                isRequired: currentStage.isRequired,
            };

            const payload2: SdlcFlowStageUpdatePayload = {
                id: targetStage.id,
                sdlcFlowId: targetStage.sdlcFlowId,
                stageCode: targetStage.stageCode,
                stageName: targetStage.stageName,
                stagePosOrder: targetStage.stagePosOrder,
                stageStatusBeforeTiggerChange: targetStage.stageStatusBeforeTiggerChange,
                stageStatusAfterTriggerChange: targetStage.stageStatusAfterTriggerChange,
                stageTriggerStatus: targetStage.stageTriggerStatus,
                isRequired: targetStage.isRequired,
            };

            await Update(payload1, tokenData);
            await Update(payload2, tokenData);

            showToast({
                description: "Stage order updated successfully",
                statusToast: "success",
            });
            fetchStages();
        } catch (error) {
            showToast({
                description: "Failed to update stage order",
                statusToast: "error",
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoadingFlow) {
        return (
            <LayoutAdmin>
                <HeaderContent {...HeaderDataContent} />
                <Box p={6}>
                    <Text>Loading...</Text>
                </Box>
            </LayoutAdmin>
        );
    }

    if (!flowData) {
        return (
            <LayoutAdmin>
                <HeaderContent {...HeaderDataContent} />
                <Box p={6}>
                    <Text>SDLC Flow not found</Text>
                </Box>
            </LayoutAdmin>
        );
    }

    return (
        <LayoutAdmin>
            <HeaderContent {...HeaderDataContent} />

            <Box p={6}>
                <VStack spacing={8} align="stretch">
                    {/* Hero Card */}
                    <Card
                        rounded="3xl"
                        shadow="xl"
                        border="0"
                        bgGradient={
                            colorMode === "light"
                                ? "linear(135deg, secondary.500, purple.500)"
                                : "linear(135deg, secondary.600, purple.600)"
                        }
                        overflow="hidden"
                    >
                        <CardBody p={8}>
                            <HStack spacing={4} mb={4}>
                                <Button
                                    leftIcon={<FaArrowLeft />}
                                    variant="ghost"
                                    color="white"
                                    _hover={{ bg: "whiteAlpha.200" }}
                                    onClick={() => router.push("/master-data/sdlc-flow")}
                                    rounded="xl"
                                >
                                    Back
                                </Button>
                            </HStack>

                            <HStack spacing={6} align="start">
                                <Box
                                    p={4}
                                    bg="whiteAlpha.200"
                                    rounded="2xl"
                                    backdropFilter="blur(10px)"
                                >
                                    <Icon as={FaProjectDiagram} fontSize="4xl" color="white" />
                                </Box>

                                <VStack align="start" spacing={2} flex={1}>
                                    <Heading size="lg" color="white">
                                        {flowData.sdlcName}
                                    </Heading>
                                    <Text fontSize="sm" color="whiteAlpha.800" fontWeight="medium">
                                        {flowData.sdlcCode}
                                    </Text>
                                    <HStack spacing={3} mt={2}>
                                        <Badge
                                            colorScheme={flowData.isActive === "Y" ? "green" : "red"}
                                            variant="subtle"
                                            px={3}
                                            py={1}
                                            rounded="full"
                                            fontSize="xs"
                                            fontWeight="semibold"
                                        >
                                            {flowData.isActive === "Y" ? "Active" : "Inactive"}
                                        </Badge>
                                        <Badge
                                            colorScheme="blue"
                                            variant="subtle"
                                            px={3}
                                            py={1}
                                            rounded="full"
                                            fontSize="xs"
                                            fontWeight="semibold"
                                        >
                                            {flowData.projectType}
                                        </Badge>
                                    </HStack>

                                    <HStack spacing={6} mt={4}>
                                        <VStack spacing={0} align="start">
                                            <Text fontSize="2xl" fontWeight="bold" color="white">
                                                {stages.length}
                                            </Text>
                                            <Text
                                                fontSize="xs"
                                                color="whiteAlpha.700"
                                                fontWeight="medium"
                                                textTransform="uppercase"
                                            >
                                                Stages
                                            </Text>
                                        </VStack>
                                    </HStack>
                                </VStack>

                                {!isEditMode ? (
                                    <Button
                                        leftIcon={<Icon as={FiEdit} />}
                                        colorScheme="whiteAlpha"
                                        variant="solid"
                                        bg="whiteAlpha.200"
                                        _hover={{ bg: "whiteAlpha.300" }}
                                        color="white"
                                        rounded="xl"
                                        onClick={() => setIsEditMode(true)}
                                    >
                                        Edit
                                    </Button>
                                ) : (
                                    <HStack>
                                        <Button
                                            leftIcon={<Icon as={FiSave} />}
                                            colorScheme="green"
                                            rounded="xl"
                                            onClick={() => formik.handleSubmit()}
                                            isLoading={isSaving}
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            leftIcon={<Icon as={FiX} />}
                                            variant="ghost"
                                            color="white"
                                            _hover={{ bg: "whiteAlpha.200" }}
                                            rounded="xl"
                                            onClick={() => {
                                                setIsEditMode(false);
                                                formik.resetForm();
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </HStack>
                                )}
                            </HStack>
                        </CardBody>
                    </Card>

                    {/* Content Grid */}
                    <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
                        {/* Left Column */}
                        <GridItem>
                            <VStack spacing={8} align="stretch">
                                {/* Description Card */}
                                <Card
                                    rounded="3xl"
                                    shadow="xl"
                                    border="0"
                                    bg={colorMode === "light" ? "white" : "gray.800"}
                                    overflow="hidden"
                                    position="relative"
                                    _before={{
                                        content: '""',
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        h: "4px",
                                        bgGradient: "linear(to-r, secondary.400, purple.400)",
                                    }}
                                >
                                    <CardHeader
                                        bgGradient={
                                            colorMode === "light"
                                                ? "linear(135deg, gray.50, blue.50)"
                                                : "linear(135deg, gray.700, gray.600)"
                                        }
                                        py={8}
                                    >
                                        <HStack spacing={3}>
                                            <Box w="8px" h="8px" rounded="full" bg="secondary.400" />
                                            <Heading size="sm" color={colorMode === "light" ? "gray.800" : "white"}>
                                                SDLC Flow Information
                                            </Heading>
                                        </HStack>
                                    </CardHeader>
                                    <CardBody p={8}>
                                        {isEditMode ? (
                                            <VStack spacing={6} align="stretch">
                                                <FormControl isInvalid={!!formik.errors.sdlcName}>
                                                    <FormLabel fontWeight="bold">SDLC Name</FormLabel>
                                                    <Input
                                                        name="sdlcName"
                                                        value={formik.values.sdlcName}
                                                        onChange={(e) => {
                                                            const name = e.target.value.toUpperCase();
                                                            const code = name.trim().replace(/\s+/g, "-").replace(/[^A-Z0-9-]/g, "");
                                                            formik.setFieldValue("sdlcName", name);
                                                            formik.setFieldValue("sdlcCode", code);
                                                        }}
                                                        rounded="xl"
                                                        border="2px"
                                                    />
                                                    <FormErrorMessage>{formik.errors.sdlcName}</FormErrorMessage>
                                                </FormControl>

                                                <FormControl isInvalid={!!formik.errors.sdlcCode}>
                                                    <FormLabel fontWeight="bold">SDLC Code</FormLabel>
                                                    <Input
                                                        name="sdlcCode"
                                                        value={formik.values.sdlcCode}
                                                        onChange={(e) => formik.setFieldValue("sdlcCode", e.target.value.toUpperCase())}
                                                        rounded="xl"
                                                        border="2px"
                                                        placeholder="Auto-generated from name"
                                                    />
                                                    <FormErrorMessage>{formik.errors.sdlcCode}</FormErrorMessage>
                                                </FormControl>

                                                <FormControl isInvalid={!!formik.errors.projectType}>
                                                    <FormLabel fontWeight="bold">Project Type</FormLabel>
                                                    <Select
                                                        name="projectType"
                                                        value={formik.values.projectType}
                                                        onChange={formik.handleChange}
                                                        rounded="xl"
                                                        border="2px"
                                                    >
                                                        {PROJECT_TYPES.map((type) => (
                                                            <option key={type} value={type}>{type}</option>
                                                        ))}
                                                    </Select>
                                                    <FormErrorMessage>{formik.errors.projectType}</FormErrorMessage>
                                                </FormControl>

                                                <FormControl>
                                                    <FormLabel fontWeight="bold">Description</FormLabel>
                                                    <Textarea
                                                        name="sdlcDesc"
                                                        value={formik.values.sdlcDesc}
                                                        onChange={formik.handleChange}
                                                        rounded="xl"
                                                        border="2px"
                                                        rows={4}
                                                    />
                                                </FormControl>

                                                <FormControl isInvalid={!!formik.errors.isActive}>
                                                    <FormLabel fontWeight="bold">Status</FormLabel>
                                                    <Select
                                                        name="isActive"
                                                        value={formik.values.isActive}
                                                        onChange={formik.handleChange}
                                                        rounded="xl"
                                                        border="2px"
                                                    >
                                                        <option value="Y">Active</option>
                                                        <option value="N">Inactive</option>
                                                    </Select>
                                                    <FormErrorMessage>{formik.errors.isActive}</FormErrorMessage>
                                                </FormControl>
                                            </VStack>
                                        ) : (
                                            <VStack spacing={4} align="stretch">
                                                <Box>
                                                    <Text fontSize="sm" color="gray.500" mb={1}>Project Type</Text>
                                                    <Text fontWeight="medium">{flowData.projectType}</Text>
                                                </Box>
                                                <Divider />
                                                <Box>
                                                    <Text fontSize="sm" color="gray.500" mb={1}>Description</Text>
                                                    <Text>{flowData.sdlcDesc || "No description available"}</Text>
                                                </Box>
                                            </VStack>
                                        )}
                                    </CardBody>
                                </Card>

                                {/* Stages Card */}
                                <Card
                                    rounded="3xl"
                                    shadow="xl"
                                    border="0"
                                    bg={colorMode === "light" ? "white" : "gray.800"}
                                    overflow="hidden"
                                >
                                    <CardHeader bg={colorMode === "light" ? "gray.50" : "gray.700"} py={8}>
                                        <HStack justify="space-between">
                                            <HStack spacing={3}>
                                                <Box w="8px" h="8px" rounded="full" bg="secondary.400" />
                                                <Heading size="sm" color={colorMode === "light" ? "gray.800" : "white"}>
                                                    Flow Stages ({stages.length})
                                                </Heading>
                                            </HStack>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                colorScheme="secondary"
                                                leftIcon={<Icon as={FiPlus} />}
                                                rounded="xl"
                                                onClick={() => handleOpenStageModal()}
                                                _hover={{ transform: "translateY(-1px)", bg: "secondary.50" }}
                                                transition="all 0.2s"
                                            >
                                                Add Stage
                                            </Button>
                                        </HStack>
                                    </CardHeader>
                                    <CardBody p={8}>
                                        {isLoadingStages ? (
                                            <Text>Loading stages...</Text>
                                        ) : stages.length === 0 ? (
                                            <VStack spacing={4} py={8}>
                                                <Text fontSize="sm" color="gray.500">No stages defined yet</Text>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    colorScheme="secondary"
                                                    leftIcon={<Icon as={FiPlus} />}
                                                    rounded="xl"
                                                    onClick={() => handleOpenStageModal()}
                                                >
                                                    Add First Stage
                                                </Button>
                                            </VStack>
                                        ) : (
                                            <VStack
                                                spacing={4}
                                                align="stretch"
                                                maxH="500px"
                                                overflowY="auto"
                                                pr={2}
                                                css={{
                                                    "&::-webkit-scrollbar": { width: "6px" },
                                                    "&::-webkit-scrollbar-track": {
                                                        background: colorMode === "light" ? "#f1f1f1" : "#2d3748",
                                                        borderRadius: "10px",
                                                    },
                                                    "&::-webkit-scrollbar-thumb": {
                                                        background: colorMode === "light" ? "#c1c1c1" : "#4a5568",
                                                        borderRadius: "10px",
                                                    },
                                                }}
                                            >
                                                {stages.map((stage, index) => (
                                                    <Box
                                                        key={stage.id}
                                                        p={4}
                                                        bg={colorMode === "light" ? "gray.50" : "gray.700"}
                                                        rounded="xl"
                                                        border="2px"
                                                        borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
                                                        _hover={{ borderColor: "secondary.400", shadow: "md" }}
                                                        transition="all 0.2s"
                                                    >
                                                        <HStack justify="space-between" align="start">
                                                            <HStack spacing={4} flex={1}>
                                                                <Box
                                                                    w="40px"
                                                                    h="40px"
                                                                    bg="secondary.100"
                                                                    rounded="lg"
                                                                    display="flex"
                                                                    alignItems="center"
                                                                    justifyContent="center"
                                                                >
                                                                    <Text fontWeight="bold" color="secondary.600">
                                                                        {stage.stagePosOrder}
                                                                    </Text>
                                                                </Box>
                                                                <VStack align="start" spacing={1} flex={1}>
                                                                    <HStack spacing={2}>
                                                                        <Text fontWeight="bold" fontSize="sm">
                                                                            {stage.stageName}
                                                                        </Text>
                                                                        {stage.isRequired === "Y" && (
                                                                            <Badge colorScheme="red" variant="solid" fontSize="xs">
                                                                                Required
                                                                            </Badge>
                                                                        )}
                                                                    </HStack>
                                                                    <Text fontSize="xs" color="gray.500">
                                                                        {stage.stageCode}
                                                                    </Text>
                                                                </VStack>
                                                            </HStack>
                                                            <HStack spacing={1}>
                                                                <VStack spacing={0}>
                                                                    <IconButton
                                                                        aria-label="Move up"
                                                                        icon={<FiChevronUp />}
                                                                        size="xs"
                                                                        variant="ghost"
                                                                        colorScheme="gray"
                                                                        rounded="md"
                                                                        isDisabled={index === 0}
                                                                        onClick={() => handleMoveStage(index, "up")}
                                                                    />
                                                                    <IconButton
                                                                        aria-label="Move down"
                                                                        icon={<FiChevronDown />}
                                                                        size="xs"
                                                                        variant="ghost"
                                                                        colorScheme="gray"
                                                                        rounded="md"
                                                                        isDisabled={index === stages.length - 1}
                                                                        onClick={() => handleMoveStage(index, "down")}
                                                                    />
                                                                </VStack>
                                                                <IconButton
                                                                    aria-label="Edit"
                                                                    icon={<FiEdit />}
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    colorScheme="blue"
                                                                    rounded="lg"
                                                                    onClick={() => handleOpenStageModal(stage)}
                                                                />
                                                                <IconButton
                                                                    aria-label="Delete"
                                                                    icon={<FiTrash2 />}
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    colorScheme="red"
                                                                    rounded="lg"
                                                                    onClick={() => handleDeleteStage(stage.id)}
                                                                />
                                                            </HStack>
                                                        </HStack>
                                                    </Box>
                                                ))}
                                            </VStack>
                                        )}
                                    </CardBody>
                                </Card>
                            </VStack>
                        </GridItem>

                        {/* Right Column */}
                        <GridItem>
                            <Card
                                rounded="3xl"
                                shadow="xl"
                                border="0"
                                bg={colorMode === "light" ? "white" : "gray.800"}
                                overflow="hidden"
                            >
                                <CardHeader bg={colorMode === "light" ? "gray.50" : "gray.700"} py={6}>
                                    <HStack spacing={3}>
                                        <Box w="8px" h="8px" rounded="full" bg="secondary.400" />
                                        <Heading size="sm" color={colorMode === "light" ? "gray.800" : "white"}>
                                            Quick Info
                                        </Heading>
                                    </HStack>
                                </CardHeader>
                                <CardBody p={6}>
                                    <VStack spacing={4} align="stretch">
                                        <Box>
                                            <Text fontSize="xs" color="gray.500" mb={1}>Created At</Text>
                                            <Text fontSize="sm" fontWeight="medium">
                                                {new Date(flowData.createdAt).toLocaleDateString()}
                                            </Text>
                                        </Box>
                                        <Divider />
                                        <Box>
                                            <Text fontSize="xs" color="gray.500" mb={1}>Created By</Text>
                                            <Text fontSize="sm" fontWeight="medium">{flowData.createdBy}</Text>
                                        </Box>
                                        {flowData.updatedAt && (
                                            <>
                                                <Divider />
                                                <Box>
                                                    <Text fontSize="xs" color="gray.500" mb={1}>Last Updated</Text>
                                                    <Text fontSize="sm" fontWeight="medium">
                                                        {new Date(flowData.updatedAt).toLocaleDateString()}
                                                    </Text>
                                                </Box>
                                            </>
                                        )}
                                    </VStack>
                                </CardBody>
                            </Card>
                        </GridItem>
                    </Grid>
                </VStack>
            </Box>

            {/* Stage Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay />
                <ModalContent rounded="2xl">
                    <ModalHeader>{editingStageId ? "Edit Stage" : "Add New Stage"}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Stage Name</FormLabel>
                                <Input
                                    value={stageFormData.stageName}
                                    onChange={(e) => {
                                        const name = e.target.value.toUpperCase();
                                        const code = name
                                            .trim()
                                            .replace(/\s+/g, "-")
                                            .replace(/[^A-Z0-9-]/g, "");
                                        setStageFormData({ ...stageFormData, stageName: name, stageCode: code });
                                    }}
                                    rounded="xl"
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Stage Code</FormLabel>
                                <Input
                                    value={stageFormData.stageCode}
                                    onChange={(e) => setStageFormData({ ...stageFormData, stageCode: e.target.value.toUpperCase() })}
                                    rounded="xl"
                                    placeholder="Auto-generated from name"
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Is Required</FormLabel>
                                <Select
                                    value={stageFormData.isRequired}
                                    onChange={(e) => setStageFormData({ ...stageFormData, isRequired: e.target.value })}
                                    rounded="xl"
                                >
                                    <option value="Y">Yes</option>
                                    <option value="N">No</option>
                                </Select>
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose} rounded="xl">
                            Cancel
                        </Button>
                        <Button colorScheme="secondary" onClick={handleSaveStage} isLoading={isSaving} rounded="xl">
                            {editingStageId ? "Update" : "Create"}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </LayoutAdmin>
    );
}

export default SdlcFlowDetailView;
