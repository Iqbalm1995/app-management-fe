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
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useSpecialization, {
    SpecializationResponse,
    SpecializationInsertPayload,
    SpecializationUpdatePayload,
} from "@/app/services/useSpecialization";
import { PaggingListPayload } from "@/app/types/masterTypes";
import { Search2Icon } from "@chakra-ui/icons";
import {
    Badge,
    Box,
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
import { FiRefreshCw, FiSearch, FiX, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";

function SpecializationPage() {
    useDocumentTitle("Specialization Management");
    const showToast = useToastHelper();
    const { colorMode } = useColorMode();

    // Auth Setup
    const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
    const [tokenData, setTokenData] = useState<string>("");

    // Data State
    const [Data, setData] = useState<SpecializationResponse[]>([]);
    const [RefreshData, setRefreshData] = useState<number>(0);
    const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

    // Pagination
    const [totalPages, setTotalPageData] = useState<number>(0);
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const pagination = useMemo(
        () => ({
            pageIndex,
            pageSize,
        }),
        [pageIndex, pageSize]
    );

    // Services
    const { List, Insert, Update, Delete } = useSpecialization();

    // Modal State
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [formData, setFormData] = useState<SpecializationInsertPayload>({
        parentId: null,
        category: "",
        specName: "",
        specDesc: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Column Definitions
    const columnsData = useMemo<ColumnDef<SpecializationResponse>[]>(
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
                accessorKey: "specCode",
                cell: (info) => (
                    <Text fontSize="sm" fontWeight="medium">
                        {info.getValue() as string}
                    </Text>
                ),
                header: () => <Text>Code</Text>,
                footer: (props) => props.column.id,
            },
            {
                accessorKey: "specName",
                cell: (info) => (
                    <Text fontSize="sm" fontWeight="medium">
                        {info.getValue() as string}
                    </Text>
                ),
                header: () => <Text>Name</Text>,
                footer: (props) => props.column.id,
            },
            {
                accessorKey: "specDesc",
                cell: (info) => (
                    <Text fontSize="sm" noOfLines={2}>
                        {(info.getValue() as string) || "-"}
                    </Text>
                ),
                header: () => <Text>Description</Text>,
                footer: (props) => props.column.id,
            },
            {
                accessorKey: "createdAt",
                cell: (info) => (
                    <Text fontSize="sm">
                        {new Date(info.getValue() as string).toLocaleDateString()}
                    </Text>
                ),
                header: () => <Text>Created</Text>,
                footer: (props) => props.column.id,
            },
            {
                accessorKey: "actions",
                cell: (info) => {
                    const row = info.row.original;
                    return (
                        <HStack spacing={2}>
                            <IconButton
                                aria-label="Edit specialization"
                                icon={<FiEdit2 />}
                                size="sm"
                                colorScheme="blue"
                                variant="ghost"
                                onClick={() => handleEdit(row)}
                            />
                            <IconButton
                                aria-label="Delete specialization"
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

    // React Table
    const table = useReactTable({
        data: Data,
        columns: columnsData,
        pageCount: totalPages ?? 1,
        state: {
            globalFilter,
            pagination,
        },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        debugTable: false,
        manualFiltering: true,
        manualPagination: true,
    });

    // Auth Effect
    useEffect(() => {
        const storedData = localStorage.getItem("authData");
        const token = localStorage.getItem("tokenData") as string;

        if (DataAuth == null && storedData) {
            const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
            const UserData: AuthDataResponse =
                StorageAuth.dataLogin as AuthDataResponse;
            setDataAuth(UserData);
        }

        if (token) setTokenData(token);
    }, [DataAuth]);

    // Data Fetching Effect
    useEffect(() => {
        if (DataAuth && tokenData) {
            fetchData();
        }
    }, [
        DataAuth,
        tokenData,
        RefreshData,
        pageIndex,
        pageSize,
        globalFilter,
    ]);

    const fetchData = async () => {
        if (!DataAuth || !tokenData) return;

        setIsLoadingProcess(true);

        try {
            const PayloadList: PaggingListPayload = {
                page: pageIndex,
                limit: pageSize,
                search: globalFilter,
                filterWhere: [],
                fieldOrder: ["specName"],
                orderDir: "asc",
            };

            const requestData = await List(PayloadList, tokenData);

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
            console.error("Error fetching specializations:", error);
            showToast({
                description: "Failed to fetch specialization data",
                statusToast: "error",
            });
        } finally {
            setIsLoadingProcess(false);
        }
    };

    const refreshAction = () => {
        setRefreshData((prev) => prev + 1);
    };

    const handleOpenModal = () => {
        setEditingId(null);
        setFormData({
            parentId: null,
            category: "ROLE",
            specName: "",
            specDesc: "",
        });
        onOpen();
    };

    const handleEdit = (spec: SpecializationResponse) => {
        setEditingId(spec.id);
        setFormData({
            parentId: spec.parentId || null,
            category: spec.category,
            specName: spec.specName,
            specDesc: spec.specDesc || "",
        });
        onOpen();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this specialization?")) {
            return;
        }

        try {
            const result = await Delete(id, tokenData);

            if (result?.statusCode === RES_CODE_OK) {
                showToast({
                    description: "Specialization deleted successfully",
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
            console.error("Error deleting specialization:", error);
            showToast({
                description: "Failed to delete specialization",
                statusToast: "error",
            });
        }
    };

    const handleSubmit = async () => {
        if (!formData.specName) {
            showToast({
                description: "Name is required",
                statusToast: "error",
            });
            return;
        }

        if (!editingId && !formData.category) {
            showToast({
                description: "Category is required",
                statusToast: "error",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            let result;

            if (editingId) {
                // Update existing
                const updatePayload: SpecializationUpdatePayload = {
                    id: editingId,
                    specName: formData.specName,
                    specDesc: formData.specDesc || null,
                };
                result = await Update(updatePayload, tokenData);
            } else {
                // Create new
                result = await Insert(formData, tokenData);
            }

            if (result?.statusCode === RES_CODE_OK) {
                showToast({
                    description: `Specialization ${editingId ? "updated" : "created"} successfully`,
                    statusToast: "success",
                });
                onClose();
                refreshAction();
            } else {
                showToast({
                    description: result?.message || RES_GENERIC_ERROR_MSG,
                    statusToast: "error",
                });
            }
        } catch (error) {
            console.error("Error saving specialization:", error);
            showToast({
                description: "Failed to save specialization",
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

    const HeaderContentData: HeaderContentProps = {
        titleName: "Specialization Management",
        breadCrumb: ["Dashboard", "Master Data", "Specialization"],
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
                        {/* Filters */}
                        <VStack spacing={4} align="stretch" mb={6}>
                            <Flex gap={4} wrap="wrap">
                                <InputGroup maxW="300px">
                                    <InputLeftElement>
                                        <Search2Icon color="gray.400" />
                                    </InputLeftElement>
                                    <Input
                                        placeholder="Search specializations..."
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
                                    Add Specialization
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

                        {/* Results Info */}
                        <HStack mb={4}>
                            <Text fontSize="sm" color="gray.600">
                                Showing {Data.length} specializations
                            </Text>
                            <Spacer />
                            <Text fontSize="sm" color="gray.600">
                                Page {pageIndex + 1} of {totalPages}
                            </Text>
                        </HStack>

                        {/* Table */}
                        <TableComponentFull table={table} />
                    </CardBody>
                </Card>
            </Box>

            {/* Add Specialization Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        {editingId ? "Edit Specialization" : "Add New Specialization"}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl>
                                <FormLabel>Category</FormLabel>
                                <Input
                                    placeholder="e.g., Technical, Management"
                                    value={formData.category}
                                    onChange={(e) =>
                                        setFormData({ ...formData, category: e.target.value })
                                    }
                                    isDisabled={true}
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Specialization Name</FormLabel>
                                <Input
                                    placeholder="e.g., Frontend Developer"
                                    value={formData.specName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, specName: e.target.value })
                                    }
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Description</FormLabel>
                                <Textarea
                                    placeholder="Enter description..."
                                    value={formData.specDesc || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, specDesc: e.target.value })
                                    }
                                    rows={4}
                                />
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
                            {editingId ? "Update" : "Create"}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </LayoutAdmin>
    );
}

export default SpecializationPage;
