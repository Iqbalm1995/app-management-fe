"use client";

import {
    HeaderContent,
    HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { TableComponentFull } from "@/app/components/tableComponents";
import {
    DELAY_LOW,
    radiusStyle,
    RES_CODE_OK,
    RES_GENERIC_ERROR_MSG,
    PROJECT_TYPES,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useSdlcFlow, {
    SdlcFlowResponse,
    SdlcFlowInsertPayload,
    SdlcFlowUpdatePayload,
} from "@/app/services/useSdlcFlow";
import { PaggingListPayload } from "@/app/types/masterTypes";
import { Search2Icon } from "@chakra-ui/icons";
import {
    Box,
    Badge,
    Button,
    Card,
    CardBody,
    Flex,
    FormControl,
    FormLabel,
    HStack,
    IconButton,
    Input,
    InputGroup,
    InputLeftElement,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    Spacer,
    Text,
    Textarea,
    useColorMode,
    useDisclosure,
    VStack,
} from "@chakra-ui/react";
import {
    ColumnDef,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    PaginationState,
    useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import { FiRefreshCw, FiSearch, FiX, FiPlus, FiEdit2, FiTrash2, FiEye } from "react-icons/fi";
import { useRouter } from "next/navigation";

function SdlcFlowPage() {
    useDocumentTitle("SDLC Flow Management");
    const showToast = useToastHelper();
    const { colorMode } = useColorMode();
    const router = useRouter();

    const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
    const [tokenData, setTokenData] = useState<string>("");
    const [Data, setData] = useState<SdlcFlowResponse[]>([]);
    const [RefreshData, setRefreshData] = useState<number>(0);
    const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
    const [totalPages, setTotalPageData] = useState<number>(0);
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const pagination = useMemo(() => ({ pageIndex, pageSize }), [pageIndex, pageSize]);

    const { ListSdlcFlow, InsertSdlcFlow, DeleteSdlcFlow } = useSdlcFlow();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [formData, setFormData] = useState<SdlcFlowInsertPayload>({
        projectType: "",
        sdlcCode: "",
        sdlcName: "",
        sdlcDesc: "",
        isActive: "Y",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const columnsData = useMemo<ColumnDef<SdlcFlowResponse>[]>(
        () => [
            {
                accessorKey: "numbData",
                cell: (info) => (
                    <Flex justifyContent={"center"} alignItems="flex-start" h={"full"}>
                        <Text>{pageIndex * pageSize + info.row.index + 1}.</Text>
                    </Flex>
                ),
                header: () => <Flex justifyContent={"center"}>No.</Flex>,
                footer: (props) => props.column.id,
            },
            {
                accessorKey: "sdlcCode",
                cell: (info) => (
                    <Text fontSize="sm" fontWeight="medium">
                        {info.getValue() as string}
                    </Text>
                ),
                header: () => <Text>Code</Text>,
                footer: (props) => props.column.id,
            },
            {
                accessorKey: "sdlcName",
                cell: (info) => (
                    <Text fontSize="sm" fontWeight="medium">
                        {info.getValue() as string}
                    </Text>
                ),
                header: () => <Text>Name</Text>,
                footer: (props) => props.column.id,
            },
            {
                accessorKey: "projectType",
                cell: (info) => (
                    <Text fontSize="sm">{info.getValue() as string}</Text>
                ),
                header: () => <Text>Project Type</Text>,
                footer: (props) => props.column.id,
            },
            {
                accessorKey: "stageCount",
                cell: (info) => (
                    <Flex justifyContent="center">
                        <Badge colorScheme="blue" variant="subtle" px={2} py={1} rounded="md">
                            {info.getValue() as number} Stages
                        </Badge>
                    </Flex>
                ),
                header: () => <Flex justifyContent="center"><Text>Stages</Text></Flex>,
                footer: (props) => props.column.id,
            },
            {
                accessorKey: "isActive",
                cell: (info) => (
                    <Text fontSize="sm">
                        {(info.getValue() as string) === "Y" ? "Active" : "Inactive"}
                    </Text>
                ),
                header: () => <Text>Status</Text>,
                footer: (props) => props.column.id,
            },
            {
                accessorKey: "actions",
                cell: (info) => {
                    const row = info.row.original;
                    return (
                        <HStack spacing={2}>
                            <IconButton
                                aria-label="View/Edit SDLC Flow"
                                icon={<FiEye />}
                                size="sm"
                                colorScheme="green"
                                variant="ghost"
                                onClick={() => router.push(`/master-data/sdlc-flow/detail?flowId=${row.id}`)}
                            />
                            <IconButton
                                aria-label="Delete SDLC Flow"
                                icon={<FiTrash2 />}
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => handleDelete(row.id)}
                            />
                        </HStack>
                    );
                },
                header: () => <Text>Actions</Text>,
                footer: (props) => props.column.id,
            },
        ],
        [pageIndex, pageSize]
    );

    const table = useReactTable({
        data: Data,
        columns: columnsData,
        pageCount: totalPages ?? 1,
        state: { globalFilter, pagination },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        debugTable: false,
        manualFiltering: true,
        manualPagination: true,
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
        if (DataAuth && tokenData) {
            fetchData();
        }
    }, [DataAuth, tokenData, RefreshData, pageIndex, pageSize, globalFilter]);

    const fetchData = async () => {
        if (!DataAuth || !tokenData) return;

        setIsLoadingProcess(true);

        try {
            const PayloadList: PaggingListPayload = {
                page: pageIndex,
                limit: pageSize,
                search: globalFilter,
                filterWhere: [],
                fieldOrder: ["sdlcName"],
                orderDir: "asc",
            };

            const requestData = await ListSdlcFlow(PayloadList, tokenData);

            if (requestData?.statusCode === RES_CODE_OK && requestData.data) {
                setData(requestData.data);
                setTotalPageData(Math.ceil((requestData.countTotal || 0) / pageSize));
            } else {
                showToast({
                    description: requestData?.message || RES_GENERIC_ERROR_MSG,
                    statusToast: "error",
                });
            }
        } catch (error) {
            console.error("Error fetching SDLC flows:", error);
            showToast({
                description: "Failed to fetch SDLC flow data",
                statusToast: "error",
            });
        } finally {
            setIsLoadingProcess(false);
        }
    };

    const refreshAction = () => {
        setRefreshData((prev) => prev + 1);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this SDLC Flow?")) {
            return;
        }

        try {
            const result = await DeleteSdlcFlow(id, tokenData);

            if (result?.statusCode === RES_CODE_OK) {
                showToast({
                    description: "SDLC Flow deleted successfully",
                    statusToast: "success",
                });
                refreshAction();
            } else {
                showToast({
                    description: result?.message || RES_GENERIC_ERROR_MSG,
                    statusToast: "error",
                });
            }
        } catch (error) {
            console.error("Error deleting SDLC flow:", error);
            showToast({
                description: "Failed to delete SDLC flow",
                statusToast: "error",
            });
        }
    };

    const handleSubmit = async () => {
        if (!formData.sdlcCode || !formData.sdlcName || !formData.projectType) {
            showToast({
                description: "Code, Name, and Project Type are required",
                statusToast: "error",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await InsertSdlcFlow(formData, tokenData);

            if (result && result.statusCode >= 200 && result.statusCode < 300) {
                showToast({
                    description: "SDLC Flow created successfully",
                    statusToast: "success",
                });
                onClose();
                setFormData({
                    projectType: "",
                    sdlcCode: "",
                    sdlcName: "",
                    sdlcDesc: "",
                    isActive: "Y",
                });
                refreshAction();
            } else {
                showToast({
                    description: result?.message || RES_GENERIC_ERROR_MSG,
                    statusToast: "error",
                });
            }
        } catch (error) {
            console.error("Error saving SDLC flow:", error);
            showToast({
                description: "Failed to save SDLC flow",
                statusToast: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSearch = () => {
        setPagination({ pageIndex: 0, pageSize });
        refreshAction();
    };

    const handleClearFilters = () => {
        setGlobalFilter("");
        setPagination({ pageIndex: 0, pageSize });
        setTimeout(() => refreshAction(), DELAY_LOW);
    };

    const handleOpenModal = () => {
        setFormData({
            projectType: "",
            sdlcCode: "",
            sdlcName: "",
            sdlcDesc: "",
            isActive: "Y",
        });
        onOpen();
    };

    const HeaderContentData: HeaderContentProps = {
        titleName: "SDLC Flow Management",
        breadCrumb: ["Dashboard", "Master Data", "SDLC Flow"],
    };

    return (
        <LayoutAdmin>
            <HeaderContent {...HeaderContentData} />

            <Box p={6}>
                <Card
                    shadow="sm"
                    rounded={radiusStyle}
                    bgColor={colorMode == "light" ? "white" : "gray.800"}
                >
                    <CardBody>
                        <VStack spacing={4} align="stretch" mb={6}>
                            <Flex gap={4} wrap="wrap">
                                <InputGroup maxW="300px">
                                    <InputLeftElement>
                                        <Search2Icon color="gray.400" />
                                    </InputLeftElement>
                                    <Input
                                        placeholder="Search SDLC flows..."
                                        value={globalFilter}
                                        onChange={(e) => setGlobalFilter(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                                    />
                                </InputGroup>

                                <Button
                                    colorScheme="blue"
                                    onClick={handleSearch}
                                    leftIcon={<FiSearch />}
                                >
                                    Search
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={handleClearFilters}
                                    leftIcon={<FiX />}
                                >
                                    Clear
                                </Button>

                                <Spacer />

                                <Button
                                    colorScheme="green"
                                    leftIcon={<FiPlus />}
                                    onClick={handleOpenModal}
                                >
                                    Add SDLC Flow
                                </Button>

                                <Button
                                    colorScheme="gray"
                                    onClick={refreshAction}
                                    leftIcon={<FiRefreshCw />}
                                >
                                    Refresh
                                </Button>
                            </Flex>
                        </VStack>

                        <HStack mb={4}>
                            <Text fontSize="sm" color="gray.600">
                                Showing {Data.length} SDLC flows
                            </Text>
                            <Spacer />
                            <Text fontSize="sm" color="gray.600">
                                Page {pageIndex + 1} of {totalPages}
                            </Text>
                        </HStack>

                        <TableComponentFull table={table} isLoading={IsLoadingProcess} />
                    </CardBody>
                </Card>
            </Box>

            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add New SDLC Flow</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Project Type</FormLabel>
                                <Select
                                    placeholder="Select project type"
                                    value={formData.projectType}
                                    onChange={(e) =>
                                        setFormData({ ...formData, projectType: e.target.value })
                                    }
                                >
                                    {PROJECT_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>SDLC Name</FormLabel>
                                <Input
                                    placeholder="e.g., Agile Development"
                                    value={formData.sdlcName}
                                    onChange={(e) => {
                                        const name = e.target.value.toUpperCase();
                                        const code = name
                                            .trim()
                                            .replace(/\s+/g, "-")
                                            .replace(/[^A-Z0-9-]/g, "");
                                        setFormData({ ...formData, sdlcName: name, sdlcCode: code });
                                    }}
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>SDLC Code</FormLabel>
                                <Input
                                    placeholder="Auto-generated from name"
                                    value={formData.sdlcCode}
                                    onChange={(e) =>
                                        setFormData({ ...formData, sdlcCode: e.target.value.toUpperCase() })
                                    }
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Description</FormLabel>
                                <Textarea
                                    placeholder="Enter description..."
                                    value={formData.sdlcDesc}
                                    onChange={(e) =>
                                        setFormData({ ...formData, sdlcDesc: e.target.value })
                                    }
                                    rows={4}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Status</FormLabel>
                                <Select
                                    value={formData.isActive}
                                    onChange={(e) =>
                                        setFormData({ ...formData, isActive: e.target.value })
                                    }
                                >
                                    <option value="Y">Active</option>
                                    <option value="N">Inactive</option>
                                </Select>
                            </FormControl>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="blue"
                            onClick={handleSubmit}
                            isLoading={isSubmitting}
                        >
                            Create
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </LayoutAdmin>
    );
}

export default SdlcFlowPage;
