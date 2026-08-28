"use client";

import {
    HeaderContent,
    HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { TableComponentFull } from "@/app/components/tableComponents";
import {
    radiusStyle,
    RES_CODE_OK,
    RES_GENERIC_ERROR_MSG,
    DELAY_LOW,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useSysModuleGroup, {
    SysModuleGroupResponse,
    SysModuleGroupInsertPayload,
    SysModuleGroupUpdatePayload,
} from "@/app/services/useSysModuleGroup";
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
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import { FiRefreshCw, FiSearch, FiX, FiPlus, FiEdit2, FiTrash2, FiEye } from "react-icons/fi";

function SysModuleGroupPage() {
    useDocumentTitle("System Module Group Management");
    const showToast = useToastHelper();
    const { colorMode } = useColorMode();
    const router = useRouter();

    const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
    const [tokenData, setTokenData] = useState<string>("");
    const [Data, setData] = useState<SysModuleGroupResponse[]>([]);
    const [RefreshData, setRefreshData] = useState<number>(0);
    const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
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

    const { List, Insert, Update, Delete } = useSysModuleGroup();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [formData, setFormData] = useState<SysModuleGroupInsertPayload>({
        modCode: "",
        modName: "",
        modDescriptions: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingIsActive, setEditingIsActive] = useState<string>("Y");

    const columnsData = useMemo<ColumnDef<SysModuleGroupResponse>[]>(
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
                accessorKey: "modCode",
                cell: (info) => (
                    <Text fontSize="sm" fontWeight="medium">
                        {info.getValue() as string}
                    </Text>
                ),
                header: () => <Text>Code</Text>,
                footer: (props) => props.column.id,
            },
            {
                accessorKey: "modName",
                cell: (info) => (
                    <Text fontSize="sm" fontWeight="medium">
                        {info.getValue() as string}
                    </Text>
                ),
                header: () => <Text>Name</Text>,
                footer: (props) => props.column.id,
            },
            {
                accessorKey: "modDescriptions",
                cell: (info) => (
                    <Text fontSize="sm" noOfLines={2}>
                        {(info.getValue() as string) || "-"}
                    </Text>
                ),
                header: () => <Text>Description</Text>,
                footer: (props) => props.column.id,
            },
            {
                accessorKey: "isActive",
                cell: (info) => (
                    <Badge
                        colorScheme={info.getValue() === "Y" ? "green" : "red"}
                        fontSize="xs"
                    >
                        {info.getValue() === "Y" ? "Active" : "Inactive"}
                    </Badge>
                ),
                header: () => <Text>Status</Text>,
                footer: (props) => props.column.id,
            },
            {
                accessorKey: "actions",
                cell: (info) => (
                    <HStack spacing={2}>
                        <IconButton
                            aria-label="View"
                            icon={<FiEye />}
                            size="sm"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => router.push(`/master-data/sys-module-group/detail?id=${info.row.original.id}`)}
                        />
                        <IconButton
                            aria-label="Edit"
                            icon={<FiEdit2 />}
                            size="sm"
                            colorScheme="green"
                            variant="ghost"
                            onClick={() => handleEdit(info.row.original)}
                        />
                        <IconButton
                            aria-label="Delete"
                            icon={<FiTrash2 />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleDelete(info.row.original.id)}
                        />
                    </HStack>
                ),
                header: () => <Text>Actions</Text>,
                footer: (props) => props.column.id,
            },
        ],
        [pageIndex, pageSize]
    );

    const table = useReactTable({
        data: Data,
        columns: columnsData,
        pageCount: totalPages,
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
                fieldOrder: ["modName"],
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
            console.error("Error fetching module groups:", error);
            showToast({
                description: "Failed to fetch module group data",
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
        setEditingIsActive("Y");
        setFormData({
            modCode: "",
            modName: "",
            modDescriptions: "",
        });
        onOpen();
    };

    const handleEdit = (module: SysModuleGroupResponse) => {
        setEditingId(module.id);
        setEditingIsActive(module.isActive);
        setFormData({
            modCode: module.modCode,
            modName: module.modName,
            modDescriptions: module.modDescriptions || "",
        });
        onOpen();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this module group?")) {
            return;
        }

        try {
            const result = await Delete(id, tokenData);

            if (result?.statusCode === RES_CODE_OK) {
                showToast({
                    description: "Module group deleted successfully",
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
            console.error("Error deleting module group:", error);
            showToast({
                description: "Failed to delete module group",
                statusToast: "error",
            });
        }
    };

    const handleSubmit = async () => {
        if (!formData.modCode || !formData.modName) {
            showToast({
                description: "Code and Name are required",
                statusToast: "error",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            let result;

            if (editingId) {
                const updatePayload: SysModuleGroupUpdatePayload = {
                    id: editingId,
                    modCode: formData.modCode,
                    modName: formData.modName,
                    modDescriptions: formData.modDescriptions || null,
                    isActive: editingIsActive,
                };
                result = await Update(updatePayload, tokenData);
            } else {
                result = await Insert(formData, tokenData);
            }

            if (result?.statusCode === RES_CODE_OK) {
                showToast({
                    description: `Module group ${editingId ? "updated" : "created"} successfully`,
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
            console.error("Error saving module group:", error);
            showToast({
                description: "Failed to save module group",
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
        titleName: "System Module Group Management",
        breadCrumb: ["Dashboard", "Master Data", "System Module Group"],
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
                                        placeholder="Search module groups..."
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
                                    Add Module Group
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
                                Showing {Data.length} module groups
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

            {/* Add/Edit Module Group Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        {editingId ? "Edit Module Group" : "Add New Module Group"}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Module Code</FormLabel>
                                <Input
                                    placeholder="e.g., MOD_001"
                                    value={formData.modCode}
                                    onChange={(e) =>
                                        setFormData({ ...formData, modCode: e.target.value })
                                    }
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Module Name</FormLabel>
                                <Input
                                    placeholder="e.g., User Management"
                                    value={formData.modName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, modName: e.target.value })
                                    }
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Description</FormLabel>
                                <Textarea
                                    placeholder="Enter description..."
                                    value={formData.modDescriptions || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            modDescriptions: e.target.value,
                                        })
                                    }
                                    rows={4}
                                />
                            </FormControl>

                            {editingId && (
                                <FormControl isRequired>
                                    <FormLabel>Status</FormLabel>
                                    <Select
                                        value={editingIsActive}
                                        onChange={(e) => setEditingIsActive(e.target.value)}
                                    >
                                        <option value="Y">Active</option>
                                        <option value="N">Inactive</option>
                                    </Select>
                                </FormControl>
                            )}
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

export default SysModuleGroupPage;
