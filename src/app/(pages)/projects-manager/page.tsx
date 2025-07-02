"use client";

import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LabelMaster from "@/app/components/labelMasterProps";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { InputLayoutFull } from "@/app/components/layoutContentBody";
import LoadingMiniSignature from "@/app/components/loadingMini";
import {
  ControlTable,
  TableComponentFull,
  TableComponentFullHeadless,
} from "@/app/components/tableComponents";
import { TableComponentWithFilterCTX } from "@/app/components/tableComponentV2";
import {
  DELAY_MEDIUM,
  ENDPOINT_API_BASEURL,
  ENDPOINT_PORT_BASIC,
  GROUP_CONST_BRD_STATUS,
  MAX_SIZE_TABLE,
  radiusStyle,
  REQ_STATUS_LIST_OPTION,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface, useAuth } from "@/app/context/AuthContext";
import {
  buildUrlPort,
  stringToDateFormatedReverse,
} from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useOrganization, {
  OrganizationResponse,
} from "@/app/services/useOrganization";
import useProjects, {
  ProjectDataResponse,
  ProjectInsertPayload,
} from "@/app/services/useProjects";
import useRequirements, {
  RequirementsResponse,
} from "@/app/services/useRequirements";
import useTeams, { TeamsResponse } from "@/app/services/useTeams";
import {
  addParamFilter,
  addParamFilterUpdate,
  ColumnMetaCustom,
  ListSearchByParamProps,
  OptionListProps,
  PaggingListPayload,
  PaggingListPayloadCustom,
  removeParamFilter,
} from "@/app/types/masterTypes";
import { Search2Icon } from "@chakra-ui/icons";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Image,
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
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Radio,
  RadioGroup,
  Spacer,
  Spinner,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tooltip,
  Tr,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { Select } from "chakra-react-select";
import { Formik, FormikState, useFormik } from "formik";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FaCog } from "react-icons/fa";
import {
  FiArrowRightCircle,
  FiEdit,
  FiFilter,
  FiInfo,
  FiPlusSquare,
  FiRefreshCcw,
  FiSave,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import * as Yup from "yup";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Projects Manager",
  breadCrumb: ["Home", "Projects Manager"],
};

function ProjectManagerPage() {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const { isAuthenticated, authData, goLogout } = useAuth();
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const { List, GetDetailById, InsertProjects } = useProjects();
  const { List: ListReq } = useRequirements();

  // SetUp auth data on current page
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token: string = localStorage.getItem("tokenData") as string;

    if (DataAuth == null) {
      if (storedData) {
        const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
        const UserData: AuthDataResponse =
          StorageAuth.dataLogin as AuthDataResponse;
        setDataAuth(UserData);
      }
    }

    if (token) {
      setTokenData(token);
    }
  }, [DataAuth]);
  // End SetUp auth data on current page

  const [DataProjects, setDataProjects] = useState<ProjectDataResponse[]>([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  const [totalPages, setTotalPageData] = useState<number>(0);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 3,
  });
  const [ActionLoading, setActionLoading] = useState(false);
  const [IsEditMode, setIsEditMode] = useState(false);
  const [DataOptionsRoleTeam, setDataOptionsRoleTeam] = useState<
    OptionListProps[]
  >([]);

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const columnsData = useMemo<ColumnDef<ProjectDataResponse>[]>(
    () => [
      {
        accessorFn: (row) => row.projectCode,
        id: "projectCode",
        cell: (info) => (
          <Flex
            p={6}
            w={"full"}
            bgColor={colorMode == "light" ? "white" : "gray.900"}
            border={"1px"}
            borderColor={colorMode == "light" ? "gray.200" : "gray.900"}
            rounded={radiusStyle}
            boxShadow={"md"}
          >
            <Flex justifyContent={"center"} pr={2}>
              <Heading as="h5" size="sm">
                {pageIndex * pageSize + info.row.index + 1}.
              </Heading>
            </Flex>
            <Grid templateColumns="repeat(12, 1fr)" gap={4} w={"full"}>
              <GridItem
                colSpan={{ base: 12, sm: 12, md: 8, lg: 8 }}
                alignContent={"center"}
              >
                <Stack spacing={1}>
                  <Heading as="h5" size="sm">
                    {info.row.original.projectName}
                  </Heading>
                  <Text
                    fontWeight={600}
                    fontSize={"small"}
                    color={"secondary.700"}
                  >
                    No. {info.row.original.projectNo}
                  </Text>
                  <Text
                    fontWeight={500}
                    fontSize={"xx-small"}
                    color={"secondary.300"}
                  >
                    ({info.row.original.projectCode})
                  </Text>
                </Stack>
              </GridItem>
              <GridItem
                colSpan={{ base: 12, sm: 12, md: 4, lg: 4 }}
                textAlign={{ base: "center", md: "start" }}
                alignContent={"center"}
              >
                <Flex
                  as={Wrap}
                  justifyContent={"end"}
                  alignItems={"center"}
                  h={"full"}
                  w={"full"}
                >
                  <Link
                    href={`projects-manager/detail?projectId=${info.row.original.id}`}
                  >
                    <Button
                      // size={"sm"}
                      colorScheme={"secondary"}
                      variant={"ghost"}
                      rightIcon={<FiEdit />}
                    >
                      Manage
                    </Button>
                  </Link>
                </Flex>
              </GridItem>
            </Grid>
          </Flex>
        ),
        header: () => <span>User Member</span>,
        footer: (props) => props.column.id,
      },
    ],
    [ActionLoading, pageIndex, pageSize, DataOptionsRoleTeam, colorMode]
  );

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
        const requestData = await List(PayloadList, tokenData);
        const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

        if (isErrorResponse || !requestData) {
          showToast({
            description: requestData?.message || RES_GENERIC_ERROR_MSG,
            statusToast: "error",
          });
          setIsLoadingProcess(false);
          return;
        } else {
          console.log(requestData);
          if (requestData.data == null) {
            showToast({
              description: "Data return error",
              statusToast: "error",
            });
            setIsLoadingProcess(false);
            return;
          }

          const itemsData: ProjectDataResponse[] =
            requestData.data as ProjectDataResponse[];
          const totalData: number = requestData.countTotal as number;
          const totalPages: number =
            totalData > 0 ? Math.ceil(totalData / pageSize) : -1;
          setDataProjects(itemsData);
          setTotalPageData(totalPages);
          setIsLoadingProcess(false);
        }
      };
      GetDataList();
    }
  }, [DataAuth, RefreshData, pageIndex, pageSize, globalFilter]);
  const [SelectedRoleTeam, setSelectedRoleTeam] =
    useState<OptionListProps | null>(null);

  const RefreshAction = () => {
    setTotalPageData(0);
    setDataProjects([]);
    setRefreshData(RefreshData + 1);
  };

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

  const ModalForm = useDisclosure();

  const handleAddNew = () => {
    if (DataAuth && DataAuth.team) {
      ModalForm.onOpen();
    } else {
      showToast({
        description: "Team ID is invalid",
        statusToast: "error",
      });
    }
  };

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [questionMsgDialog, setQuestionMsgDialog] = useState<string>("");
  const [captionDialog, setCaptionDialog] = useState<string>("");
  const [PayloadData, setPayloadData] = useState<ProjectInsertPayload | null>(
    null
  );

  // await handleConfirmSaveData();

  const handleSaveData = async () => {
    setActionLoading(true);
    await delay(DELAY_MEDIUM);
    if (DataAuth && DataAuth.team) {
      // await AddProjectNewServ(PayloadData);
      console.log("save");
    } else {
      showToast({
        description: "Data is invalid",
        statusToast: "error",
      });
      setActionLoading(false);
      setPayloadData(null);
    }
  };

  const handleConfirmSaveData = () => {
    setCaptionDialog("Confirm Save Data");
    setQuestionMsgDialog(`Are you sure want to create new project ?`);
    setOpenConfirmDialog(true);
  };

  const handleDialogTrigger = () => {
    setOpenConfirmDialog(!openConfirmDialog);
  };

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
            <TeamProfile />
            <Grid templateColumns="repeat(12, 1fr)" gap={5}>
              <GridItem colSpan={{ base: 12, sm: 12, md: 9, lg: 9 }} w={"full"}>
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
                          onClick={() => RefreshAction()}
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
                          onClick={() => handleAddNew()}
                        >
                          Create New Project
                        </Button>
                      </Flex>
                    </GridItem>
                  </Grid>

                  <VStack w={"full"} p={0} align={"start"} spacing={2}>
                    {IsLoadingProcess ? (
                      <LoadingMiniSignature />
                    ) : (
                      <TableComponentFullHeadless table={table} />
                    )}
                  </VStack>
                </Flex>
              </GridItem>
              <GridItem colSpan={{ base: 12, sm: 12, md: 3, lg: 3 }} w={"full"}>
                <Flex
                  w={"full"}
                  as={VStack}
                  spacing={7}
                  justifyContent={"start"}
                  alignItems={"start"}
                  //   rounded={radiusStyle}
                  bgColor={colorMode == "light" ? "white" : "gray.800"}
                  //   boxShadow={"lg"}
                  borderLeft={"1px"}
                  borderColor={colorMode == "light" ? "gray.300" : "gray.600"}
                  minH={"60vh"}
                  p={5}
                  mt={5}
                >
                  <Flex
                    w={"full"}
                    justifyContent={"start"}
                    alignItems={"center"}
                    as={HStack}
                    spacing={2}
                    color={"gray.800"}
                  >
                    <FaCog size={16} />
                    <Text fontWeight={600} fontSize={18}>
                      Options
                    </Text>
                  </Flex>
                </Flex>
              </GridItem>
            </Grid>
          </Flex>
        </CardBody>
      </Card>
    </LayoutAdmin>
  );
}

const TeamProfile = () => {
  const showToast = useToastHelper();
  const { GetDetailById } = useTeams();
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // SetUp auth data on current page
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token: string = localStorage.getItem("tokenData") as string;

    if (DataAuth == null) {
      if (storedData) {
        const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
        const UserData: AuthDataResponse =
          StorageAuth.dataLogin as AuthDataResponse;
        setDataAuth(UserData);
      }
    }

    if (token) {
      setTokenData(token);
    }
  }, [DataAuth]);
  // End SetUp auth data on current page

  const [DataTeam, setDataTeam] = useState<TeamsResponse | null>(null);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(true);
  const [ActionLoading, setActionLoading] = useState(false);

  const [image, setImage] = useState("/img/placeholder-header-sm.png");
  useEffect(() => {
    setIsLoadingProcess(true);
    if (DataAuth && DataAuth.team) {
      const GetDataList = async () => {
        const requestData = await GetDetailById(
          DataAuth.team ? DataAuth.team.id : "",
          tokenData
        );
        const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

        if (isErrorResponse || !requestData) {
          showToast({
            description: requestData?.message || RES_GENERIC_ERROR_MSG,
            statusToast: "error",
          });
          setIsLoadingProcess(false);
          return;
        } else {
          console.log(requestData);
          await delay(DELAY_MEDIUM);
          if (requestData.data == null) {
            showToast({
              description: "Data return error",
              statusToast: "error",
            });
            setIsLoadingProcess(false);
            return;
          }

          const itemsData: TeamsResponse = requestData.data as TeamsResponse;
          setDataTeam(itemsData);
          setIsLoadingProcess(false);
          if (itemsData.teamPict != null) {
            setImage(
              buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC) +
                itemsData.teamPict
            );
          }
        }
      };

      GetDataList();
    }
  }, [DataAuth, RefreshData]);

  const RefreshAction = () => {
    setRefreshData(RefreshData + 1);
  };

  return (
    <Flex pb={2}>
      <Box w={"full"}>
        <Box
          zIndex={1}
          pos={"relative"}
          h={"190px"}
          w={"full"}
          bgGradient={"linear(to-r, #1b517e, #063154)"}
          backgroundPosition="center"
          backgroundRepeat="no-repeat"
          backgroundSize="cover"
          backgroundImage={`url(/img/currency-bg.png)`}
          objectFit="cover"
          boxShadow={"md"}
          rounded={radiusStyle}
        >
          <Box
            rounded={radiusStyle}
            pos={"absolute"}
            top="0"
            left="0"
            w="full"
            h="full"
            bgGradient="linear(to-b, blackAlpha.200 0%, blackAlpha.800 100%)"
          ></Box>
        </Box>
        <Flex justify={"center"} mt={"-120px"} zIndex={2}>
          <Flex
            w={"full"}
            zIndex={2}
            px={{ base: 3, sm: 3, md: 8, lg: 8 }}
            justifyContent={"start"}
          >
            <Container maxW={"8xl"}>
              <Flex as={Stack} direction={"row"} spacing={5}>
                <Box
                  w={"160px"}
                  h={"160px"}
                  borderRadius={"full"}
                  overflow={"hidden"}
                  boxShadow={"lg"}
                >
                  <Image
                    src={image}
                    // rounded={"3xl"}
                    draggable={false} // Prevent image from being draggable
                    w={"full"}
                    h={"full"}
                  />
                </Box>
                <Flex
                  //   bg={"red"}
                  //   maxW={"280px"}
                  alignItems={"start"}
                  color={"white"}
                  as={Stack}
                  pt={6}
                  spacing={1}
                >
                  <Heading as="h2" size="xl">
                    {DataTeam?.teamName}
                  </Heading>
                  <Text
                    fontWeight={550}
                    fontSize={"xl"}
                    textStyle={"italic"}
                    as={"i"}
                  >
                    #{DataTeam?.teamCode}
                  </Text>
                </Flex>
                <Spacer />
                {/* <Flex>
                  {DataTeam && DataTeam.teamUserMembers.length > 0 && (
                    <AvatarGroup size="md" max={4}>
                      {DataTeam.teamUserMembers.map((dt, index) => (
                        <Avatar
                          key={index}
                          name={`${dt.userFirstName} ${dt.userLastName}`}
                        />
                      ))}
                    </AvatarGroup>
                  )}
                </Flex> */}
              </Flex>
            </Container>
          </Flex>
        </Flex>

        {/* <pre>{JSON.stringify(DataTeam?.teamUserMembers, null, 2)}</pre> */}
      </Box>
    </Flex>
  );
};

const brdFilter: ListSearchByParamProps = {
  field: "requirementType",
  operator: "=",
  value: "BRD",
  filterLabel: "Tipe",
};

const ModalRegisterProject = () => {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const { isAuthenticated, authData, goLogout } = useAuth();
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const { List: ListReq } = useRequirements();
  const { List: ListOrganization } = useOrganization();

  // SetUp auth data on current page
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token: string = localStorage.getItem("tokenData") as string;

    if (DataAuth == null) {
      if (storedData) {
        const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
        const UserData: AuthDataResponse =
          StorageAuth.dataLogin as AuthDataResponse;
        setDataAuth(UserData);
      }
    }

    if (token) {
      setTokenData(token);
    }
  }, [DataAuth]);
  // End SetUp auth data on current page

  const [DataReq, setDataReq] = useState<RequirementsResponse[]>([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [ActionLoading, setActionLoading] = useState(false);

  const [totalPages, setTotalPageData] = useState<number>(0);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  // Division Option setup
  const [IsLoadingDivisionSelect, setIsLoadingDivisionSelect] = useState(false);
  const [OptionDivision, setOptionDivision] = useState<OptionListProps[]>([]);

  const GetDataDivision = async (
    searchValue: string = "",
    limit: number = 1
  ): Promise<OrganizationResponse[]> => {
    setIsLoadingDivisionSelect(true);
    const PayloadList: PaggingListPayload = {
      search: searchValue,
      limit: limit,
      page: 0,
      filterWhere: [
        {
          field: "orgType",
          operator: "=",
          value: "DIVISION",
        },
      ],
      fieldOrder: ["orgName"],
      orderDir: "asc",
    };
    const token: string = localStorage.getItem("tokenData") as string;
    const requestData = await ListOrganization(PayloadList, token);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setIsLoadingDivisionSelect(false);
      return [];
    } else {
      console.log(requestData);
      if (requestData.data == null) {
        showToast({
          description: "Data return error",
          statusToast: "error",
        });
        setIsLoadingDivisionSelect(false);
        return [];
      }

      const itemsData: OrganizationResponse[] =
        requestData.data as OrganizationResponse[];

      const mapOptionData: OptionListProps[] = itemsData.map((d) => ({
        label: `${d.orgName}`,
        value: d.id,
      }));
      setOptionDivision(mapOptionData);
      setIsLoadingDivisionSelect(false);

      return itemsData;
    }
  };

  const LoadDataDivision = async () => {
    if (OptionDivision.length <= 0) {
      const dataDivision = await GetDataDivision("", MAX_SIZE_TABLE);
    }
  };

  const [ParamFilter, setParamFilter] = useState<ListSearchByParamProps[]>([]);

  const handleFilterChange = (newFilters: ListSearchByParamProps[]) => {
    console.log("handleFilterChange");
    console.log(newFilters);

    // Use reduce to merge all new filters at once
    const updatedFilters = newFilters.reduce(
      (acc, filter) => addParamFilterUpdate(acc, filter),
      ParamFilter
    );

    setParamFilter(updatedFilters);
  };

  const columnsData = useMemo<ColumnDef<RequirementsResponse>[]>(
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
        // Custom variable
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.reqNarative,
        id: "reqNarative",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"center"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
          >
            <Flex as={Stack} spacing={2}>
              <Flex as={Stack} spacing={0}>
                <Text fontWeight={600}>{info.row.original.reqNumber}</Text>
                <Text>{info.row.original.reqNarative}</Text>
              </Flex>
              <Flex as={Stack} spacing={0}>
                <Text>Divisi Pengirim :</Text>
                <Text fontWeight={600}>
                  {info.row.original.senderDivisionName}
                </Text>
              </Flex>
              <Flex pt={2}>
                {info.row.original.isCarryOver == "Y" && (
                  <Badge
                    variant="solid"
                    colorScheme="yellow"
                    fontSize={"small"}
                    rounded={radiusStyle}
                    px={4}
                  >
                    CARRYOVER
                  </Badge>
                )}
              </Flex>
            </Flex>
          </Flex>
        ),
        header: () => <span>Perihal</span>,
        footer: (props) => props.column.id,
        // Custom variable
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "reqNarative",
              operator: "like",
              value: "",
              filterType: "text",
              filterLabel: "Perihal",
            },
            {
              field: "senderDivisionId",
              operator: "=",
              value: "",
              filterType: "select",
              filterLabel: "Divisi Pengirim",
              sourceListData: OptionDivision,
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.reqInititateDate,
        id: "reqInititateDate",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"center"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
          >
            <Flex fontSize={"small"} as={Stack} spacing={0}>
              <Text>Memo Dibuat :</Text>
              <Text fontWeight={600}>
                {info.row.original.reqInititateDate
                  ? stringToDateFormatedReverse(
                      info.row.original.reqInititateDate
                    )
                  : "-"}
              </Text>
            </Flex>
            <Flex fontSize={"small"} as={Stack} spacing={0}>
              <Text>Memo Diterima :</Text>
              <Text fontWeight={600}>
                {info.row.original.reqAcceptedDate
                  ? stringToDateFormatedReverse(
                      info.row.original.reqAcceptedDate
                    )
                  : "-"}
              </Text>
            </Flex>
          </Flex>
        ),
        header: () => <span>Tanggal</span>,
        footer: (props) => props.column.id,
        // Custom variable
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "reqInititateDate",
              operator: ">=",
              value: "",
              filterType: "date",
              filterLabel: "Tgl. Awal Memo Dibuat",
            },
            {
              field: "reqInititateDate",
              operator: "<=",
              value: "",
              filterType: "date",
              filterLabel: "Tgl. Akhir Memo Dibuat",
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.assignedFromName,
        id: "assigned",
        cell: (info) => (
          <Flex w={"full"} justifyContent={"center"} as={Stack} spacing={1}>
            <Flex fontSize={"small"} as={Stack} spacing={0}>
              <Text>Ditugaskan Oleh :</Text>
              <Text fontWeight={600} fontSize={"smaller"}>
                {info.row.original.assignedFromName}
              </Text>
            </Flex>
            <Flex fontSize={"small"} as={Stack} spacing={0}>
              <Text>Ditugaskan Ke :</Text>
              {info.row.original.approvalDatas.map((x, idx) => (
                <Text fontWeight={600} key={idx} fontSize={"smaller"}>
                  {idx + 1}. {x.approverUserFirstName}{" "}
                  {x.approverUserLastnameName}
                </Text>
              ))}
            </Flex>
          </Flex>
        ),
        header: () => <span>Penugasan</span>,
        footer: (props) => props.column.id,
        // Custom variable
        // Custom variable
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "assignedFromName",
              operator: "like",
              value: "",
              filterType: "text",
              filterLabel: "Ditugaskan Oleh",
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.appInitialName,
        id: "appInitialName",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"center"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
          >
            <Flex as={Stack} spacing={2}>
              <Flex as={Stack} spacing={0}>
                <Text fontWeight={600}>
                  ({info.row.original.appInitialCode})
                </Text>
                <Text fontWeight={600}>{info.row.original.appInitialName}</Text>
              </Flex>
            </Flex>
          </Flex>
        ),
        header: () => <span>Aplikasi</span>,
        footer: (props) => props.column.id,
        // Custom variable
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "appInitialCode",
              operator: "like",
              value: "",
              filterType: "text",
              filterLabel: "Inisial Aplikasi",
            },
            {
              field: "appInitialName",
              operator: "like",
              value: "",
              filterType: "text",
              filterLabel: "Nama Aplikasi",
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.reqStatus,
        id: "reqStatus",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"center"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
          >
            <Flex fontSize={"small"} as={Stack} spacing={1}>
              {info.row.original.reqStatus ? (
                <LabelMaster
                  groupLabel={GROUP_CONST_BRD_STATUS}
                  labelName={info.row.original.reqStatus}
                />
              ) : (
                "-"
              )}
            </Flex>
            <Text>
              Next Step :
              <Text as="span" fontWeight="bold" pl={1}>
                {info.row.original.nextStep}
              </Text>
            </Text>
          </Flex>
        ),
        header: () => <span>Status</span>,
        footer: (props) => props.column.id,
        // Custom variable
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "reqStatus",
              operator: "=",
              value: "",
              filterType: "select",
              filterLabel: "Status",
              sourceListData: REQ_STATUS_LIST_OPTION,
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.id,
        id: "id",
        cell: (info) => (
          <Flex w={"full"} justifyContent={"center"}>
            <Link
              href={`projects-manager/register?reqId=${info.row.original.id}`}
            >
              <Button
                rightIcon={<FiArrowRightCircle />}
                colorScheme="secondary"
                size="sm"
              >
                Register
              </Button>
            </Link>
          </Flex>
        ),
        header: () => "",
        footer: (props) => props.column.id,
        // Custom variable
        meta: {
          isFilterable: false,
        },
      },
    ],
    [ActionLoading, pageIndex, pageSize, colorMode, OptionDivision, ParamFilter]
  );

  // Set Onload Filter For Constant Filter
  useEffect(() => {
    const brdStatusApprove: ListSearchByParamProps = {
      field: "reqStatus",
      operator: "=",
      value: "APPROVED",
      filterLabel: "Tipe",
    };
    LoadDataDivision();
    // addFilterData(brdFilter);
    addFilterData(brdStatusApprove);
  }, []);

  const addFilterData = (data: ListSearchByParamProps) => {
    const filterWhereData: ListSearchByParamProps[] = addParamFilterUpdate(
      ParamFilter,
      data
    );

    setParamFilter(filterWhereData);
  };

  const removeFilterData = (data: ListSearchByParamProps) => {
    const filterWhereData: ListSearchByParamProps[] = removeParamFilter(
      ParamFilter,
      data
    );

    setParamFilter(filterWhereData);
  };

  const [SelectedTypeReq, setSelectedTypeReq] = useState<string>("BRD");

  useEffect(() => {
    const brdFilterSelected: ListSearchByParamProps[] = [
      {
        field: "requirementType",
        operator: "=",
        value: SelectedTypeReq,
        filterLabel: "Tipe",
      },
    ];
    handleFilterChange(brdFilterSelected);
  }, [SelectedTypeReq]);

  useEffect(() => {
    const brdStatusApproveStatic: ListSearchByParamProps = {
      field: "reqStatus",
      operator: "=",
      value: "APPROVED",
      filterLabel: "Tipe",
    };
    const filterWhereData: ListSearchByParamProps[] = addParamFilter(
      ParamFilter,
      brdStatusApproveStatic
    );
    if (DataAuth && DataAuth.team && tokenData) {
      const PayloadList: PaggingListPayload = {
        search: globalFilter,
        limit: pageSize,
        page: pageIndex,
        filterWhere: filterWhereData,
        fieldOrder: ["createdAt"],
        orderDir: "desc",
      };

      setIsLoadingProcess(true);
      const GetDataList = async () => {
        const requestData = await ListReq(PayloadList, tokenData);
        const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

        if (isErrorResponse || !requestData) {
          showToast({
            description: requestData?.message || RES_GENERIC_ERROR_MSG,
            statusToast: "error",
          });
          setIsLoadingProcess(false);
          return;
        } else {
          console.log(requestData);
          if (requestData.data == null) {
            showToast({
              description: "Data return error",
              statusToast: "error",
            });
            setIsLoadingProcess(false);
            return;
          }

          const itemsData: RequirementsResponse[] =
            requestData.data as RequirementsResponse[];
          const totalData: number = requestData.countTotal as number;
          const totalPages: number =
            totalData > 0 ? Math.ceil(totalData / pageSize) : -1;
          setDataReq(itemsData);
          setTotalPageData(totalPages);
          setIsLoadingProcess(false);
        }
      };
      GetDataList();
    }
  }, [DataAuth, RefreshData, pageIndex, pageSize, globalFilter, ParamFilter]);

  const table = useReactTable({
    data: DataReq,
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
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    debugTable: false,
    manualFiltering: true,
    manualPagination: true,
  });

  return (
    <Flex as={Stack} w={"full"} pt={4}>
      <FormControl>
        <Grid templateColumns="repeat(2, 1fr)" gap={1} w={"full"}>
          <GridItem
            colSpan={{
              base: 2,
              sm: 2,
              md: 1,
              lg: 1,
            }}
            w={"full"}
          >
            <FormLabel h={"full"}>Sudah memiliki requirement</FormLabel>
          </GridItem>
          <GridItem
            colSpan={{
              base: 2,
              sm: 2,
              md: 1,
              lg: 1,
            }}
            w={"full"}
          >
            <FormControl>
              <RadioGroup
                id={"isHaveReq"}
                onChange={(val) => {
                  // formik.setFieldValue("appPrivateAuth", val);
                  console.log(val);
                }}
                value={"Y"}
              >
                <Flex w={"full"} as={HStack} justifyContent={"end"}>
                  <Radio value={"Y"}>Ya</Radio>
                  <Radio value={"N"} isDisabled>
                    Tidak
                  </Radio>
                </Flex>
              </RadioGroup>
            </FormControl>
          </GridItem>

          <GridItem
            colSpan={{
              base: 2,
              sm: 2,
              md: 1,
              lg: 1,
            }}
            w={"full"}
          >
            <FormLabel h={"full"}>Tipe Requirement</FormLabel>
          </GridItem>

          <GridItem
            colSpan={{
              base: 2,
              sm: 2,
              md: 1,
              lg: 1,
            }}
            w={"full"}
          >
            <FormControl>
              <RadioGroup
                id={"FilterReqType"}
                onChange={(val) => {
                  // formik.setFieldValue("appPrivateAuth", val);
                  console.log(val);
                  setSelectedTypeReq(val);
                }}
                value={SelectedTypeReq}
              >
                <Flex w={"full"} as={HStack} justifyContent={"end"}>
                  <Radio value={"BRD"}>BRD</Radio>
                  <Radio value={"RFC"}>RFC</Radio>
                </Flex>
              </RadioGroup>
            </FormControl>
          </GridItem>

          <GridItem colSpan={2} w={"full"}>
            {/* <pre>{JSON.stringify(formik.values, null, 2)}</pre> */}
          </GridItem>

          <GridItem colSpan={2} w={"full"}>
            <Popover closeOnBlur={false} placement={"bottom"}>
              <PopoverTrigger>
                <Button size={"sm"} leftIcon={<FiFilter />}>
                  Filter{" "}
                  <Flex
                    as={"span"}
                    pl={1}
                    display={ParamFilter.length > 0 ? "flex" : "none"}
                    color={"secondary.500"}
                    fontWeight={600}
                  >
                    ({ParamFilter.length})
                  </Flex>
                </Button>
              </PopoverTrigger>
              <Portal>
                <PopoverContent width="auto" minW="xs">
                  <PopoverBody>
                    <Flex as={Stack} w={"full"}>
                      <Text fontWeight={600}>Filter Data</Text>
                      <Divider />

                      <Stack spacing={2}>
                        {ParamFilter.map((dt, idx) => (
                          <Flex
                            key={idx}
                            w={"full"}
                            alignItems="center"
                            as={HStack}
                            spacing={2}
                          >
                            <Text>
                              {dt.filterLabel} :{" "}
                              <Text as={"span"} fontWeight={600}>
                                {" "}
                                {dt.field === "senderDivisionId"
                                  ? OptionDivision.find(
                                      (opt) => opt.value === dt.value
                                    )?.label || dt.value
                                  : dt.value}
                              </Text>
                            </Text>
                            <Button
                              size={"xs"}
                              colorScheme={"red"}
                              justifyContent={"center"}
                              variant={"ghost"}
                              onClick={() => removeFilterData(dt)}
                            >
                              <FiX />
                            </Button>
                          </Flex>
                        ))}
                      </Stack>
                    </Flex>
                  </PopoverBody>
                </PopoverContent>
              </Portal>
            </Popover>
          </GridItem>
        </Grid>

        <GridItem colSpan={2} w={"full"}>
          {IsLoadingProcess ? (
            <LoadingMiniSignature />
          ) : (
            // <TableComponentFull table={table} />
            // TABLE NEW DESIGN
            <Box w={"full"} pt={2}>
              <TableComponentWithFilterCTX
                table={table}
                handleFilterChange={handleFilterChange}
              />
            </Box>
          )}
        </GridItem>
      </FormControl>

      {/* <pre>{JSON.stringify(formik.values, null, 2)}</pre> */}
    </Flex>
  );
};

export default ProjectManagerPage;
