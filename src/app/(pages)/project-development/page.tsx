"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Grid,
  GridItem,
  HStack,
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
  Stack,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import {
  ColumnDef,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { Search2Icon } from "@chakra-ui/icons";
import { FiPlusSquare, FiRefreshCcw, FiSave, FiX } from "react-icons/fi";

// Components
import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import { HeaderContent, HeaderContentProps } from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { TableComponentFullHeadlessGrid } from "@/app/components/tableComponents";

// Services and Hooks
import { AuthDataModelInterface, useAuth } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useProjects, { ProjectDataResponse, ProjectInsertPayload } from "@/app/services/useProjects";

// Constants and Types
import {
  DELAY_MEDIUM,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { PaggingListPayloadCustom } from "@/app/types/masterTypes";

// Local Components
import CardProject from "./components/CardProject";
import ModalRegisterProject from "./components/ModalRegisterProject";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Project Development",
  breadCrumb: ["Home", "Project Development"],
};

const ProjectManagerPage = memo(() => {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const { isAuthenticated, authData, goLogout } = useAuth();
  const { List, GetDetailById, InsertProjects } = useProjects();

  // Auth state
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // Data state
  const [DataProjects, setDataProjects] = useState<ProjectDataResponse[]>([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  // Table state
  const [totalPages, setTotalPageData] = useState<number>(0);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 9,
  });

  // UI state
  const [ActionLoading, setActionLoading] = useState(false);
  const [IsEditMode, setIsEditMode] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [questionMsgDialog, setQuestionMsgDialog] = useState<string>("");
  const [captionDialog, setCaptionDialog] = useState<string>("");
  const [PayloadData, setPayloadData] = useState<ProjectInsertPayload | null>(null);

  const ModalForm = useDisclosure();

  // Memoized values
  const delay = useCallback((ms: number) => 
    new Promise((resolve) => setTimeout(resolve, ms)), []);

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  // Auth setup effect
  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token: string = localStorage.getItem("tokenData") as string;

    if (storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse = StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) {
      setTokenData(token);
    }
  }, []); // Empty dependency array - run only once on mount

  // Data fetching effect
  useEffect(() => {
    setIsEditMode(false);
    if (DataAuth && DataAuth.team) {
      const PayloadList: PaggingListPayloadCustom = {
        search: globalFilter,
        teamId: DataAuth.team.id,
        limit: pageSize,
        page: pageIndex,
        filterWhere: [],
        fieldOrder: ["createdAt"],
        orderDir: "asc",
      };

      setIsLoadingProcess(true);
      const GetDataList = async () => {
        try {
          const requestData = await List(PayloadList, tokenData);
          const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

          if (isErrorResponse || !requestData) {
            showToast({
              description: requestData?.message || RES_GENERIC_ERROR_MSG,
              statusToast: "error",
            });
            setIsLoadingProcess(false);
            return;
          }

          if (requestData.data == null) {
            showToast({
              description: "Data return error",
              statusToast: "error",
            });
            setIsLoadingProcess(false);
            return;
          }

          const itemsData: ProjectDataResponse[] = requestData.data as ProjectDataResponse[];
          const totalData: number = requestData.countTotal as number;
          const totalPages: number = totalData > 0 ? Math.ceil(totalData / pageSize) : -1;
          
          setDataProjects(itemsData);
          setTotalPageData(totalPages);
          setIsLoadingProcess(false);
        } catch (error) {
          console.error("Error fetching projects:", error);
          showToast({
            description: "Failed to fetch projects",
            statusToast: "error",
          });
          setIsLoadingProcess(false);
        }
      };
      
      GetDataList();
    }
  }, [DataAuth, RefreshData, pageIndex, pageSize, globalFilter, tokenData]);

  // Table configuration
  const columnsData = useMemo<ColumnDef<ProjectDataResponse>[]>(
    () => [
      {
        accessorFn: (row) => row.projectCode,
        id: "projectCode",
        cell: (info) => (
          <CardProject
            data={info.row.original}
            key={info.row.original.projectCode}
          />
        ),
        header: () => <span>Projects</span>,
        footer: (props) => props.column.id,
      },
    ],
    [ActionLoading, pageIndex, pageSize, colorMode]
  );

  const table = useReactTable({
    data: DataProjects,
    columns: columnsData,
    pageCount: totalPages ?? 0,
    state: {
      globalFilter,
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    debugTable: false,
    manualFiltering: true,
    manualPagination: true,
  });

  // Event handlers
  const RefreshAction = useCallback(() => {
    setTotalPageData(0);
    setDataProjects([]);
    setRefreshData(RefreshData + 1);
  }, [RefreshData]);

  const handleAddNew = useCallback(() => {
    if (DataAuth && DataAuth.team) {
      ModalForm.onOpen();
    } else {
      showToast({
        description: "Team ID is invalid",
        statusToast: "error",
      });
    }
  }, [DataAuth, ModalForm, showToast]);

  const handleSaveData = useCallback(async () => {
    setActionLoading(true);
    await delay(DELAY_MEDIUM);
    if (DataAuth && DataAuth.team) {
      console.log("save");
      // Implement save logic here
    } else {
      showToast({
        description: "Data is invalid",
        statusToast: "error",
      });
      setActionLoading(false);
      setPayloadData(null);
    }
  }, [DataAuth, delay, showToast]);

  const handleConfirmSaveData = useCallback(() => {
    setCaptionDialog("Confirm Save Data");
    setQuestionMsgDialog(`Are you sure want to create new project ?`);
    setOpenConfirmDialog(true);
  }, []);

  const handleDialogTrigger = useCallback(() => {
    setOpenConfirmDialog(!openConfirmDialog);
  }, [openConfirmDialog]);

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      <Modal
        size={"6xl"}
        isOpen={ModalForm.isOpen}
        isCentered
        onClose={ModalForm.onClose}
      >
        <ModalOverlay bg="blackAlpha.300" />
        <ModalContent
          rounded={radiusStyle}
          m={2}
          bg={useColorModeValue("white", "gray.900")}
        >
          <ModalHeader>Create New Project</ModalHeader>
          <ModalCloseButton />
          <ModalBody w={"full"}>
            <ModalRegisterProject />
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme={"gray"}
              leftIcon={<FiX />}
              onClick={ModalForm.onClose}
              isLoading={ActionLoading}
            >
              Kembali
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ConfirmationDialog
        key={"confirmSaveData"}
        isOpenTrigger={openConfirmDialog}
        action={handleSaveData}
        trigger={handleDialogTrigger}
        questionMsg={questionMsgDialog}
        captionMsg={captionDialog}
      />

      <Card rounded={radiusStyle}>
        <CardBody
          bgColor={colorMode == "light" ? "white" : "gray.800"}
          rounded={radiusStyle}
        >
          <Flex as={Stack} w={"full"}>
            <Grid templateColumns="repeat(12, 1fr)" gap={5}>
              <GridItem
                colSpan={{ base: 12, sm: 12, md: 12, lg: 12 }}
                w={"full"}
              >
                <Flex as={Stack} w={"full"} spacing={2} pb={5}>
                  <Grid
                    templateColumns="repeat(2, 1fr)"
                    gap={4}
                    pt={5}
                    w={"full"}
                    px={5}
                  >
                    <GridItem
                      colSpan={{ base: 2, md: 1 }}
                      textAlign={{ base: "center", md: "start" }}
                      alignContent={"center"}
                    >
                      <Flex w={"full"} justifyContent={"left"}>
                        <InputGroup w={{ base: "full", md: "65%" }}>
                          <InputLeftElement
                            pointerEvents="none"
                            boxSize={12}
                            h={"full"}
                          >
                            <Search2Icon color={"secondary.500"} />
                          </InputLeftElement>
                          <Input
                            type="text"
                            placeContent={"center"}
                            placeholder="Cari data..."
                            bg={"white"}
                            size={"md"}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            value={globalFilter}
                          />
                        </InputGroup>
                      </Flex>
                    </GridItem>
                    <GridItem
                      colSpan={{ base: 2, md: 1 }}
                      textAlign={{ base: "center", md: "end" }}
                      w={"full"}
                    >
                      <Flex
                        as={HStack}
                        justifyContent={"right"}
                        px={0}
                        w={"full"}
                      >
                        <Button
                          size={"sm"}
                          leftIcon={<FiRefreshCcw />}
                          onClick={RefreshAction}
                          isLoading={ActionLoading}
                        >
                          Refresh
                        </Button>
                        <Button
                          size={"sm"}
                          colorScheme={"secondary"}
                          leftIcon={<FiPlusSquare />}
                          type={"submit"}
                          isLoading={ActionLoading}
                          onClick={handleAddNew}
                        >
                          Create New Project
                        </Button>
                      </Flex>
                    </GridItem>
                  </Grid>

                  <VStack w={"full"} px={4} align={"start"} spacing={2}>
                    {IsLoadingProcess ? (
                      <LoadingMiniSignature />
                    ) : (
                      <TableComponentFullHeadlessGrid table={table} />
                    )}
                  </VStack>
                </Flex>
              </GridItem>
            </Grid>
          </Flex>
        </CardBody>
      </Card>
    </LayoutAdmin>
  );
});

ProjectManagerPage.displayName = "ProjectManagerPage";

export default ProjectManagerPage;
