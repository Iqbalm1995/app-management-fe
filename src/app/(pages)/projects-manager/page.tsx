"use client";

import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { InputLayoutFull } from "@/app/components/layoutContentBody";
import LoadingMiniSignature from "@/app/components/loadingMini";
import {
  TableComponentFull,
  TableComponentFullHeadless,
} from "@/app/components/tableComponents";
import {
  DELAY_MEDIUM,
  ENDPOINT_API_BASEURL,
  ENDPOINT_PORT_BASIC,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface, useAuth } from "@/app/context/AuthContext";
import { buildUrlPort } from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useProjects, {
  ProjectDataResponse,
  ProjectInsertPayload,
} from "@/app/services/useProjects";
import useTeams, { TeamsResponse } from "@/app/services/useTeams";
import {
  OptionListProps,
  PaggingListPayloadCustom,
} from "@/app/types/masterTypes";
import { Search2Icon } from "@chakra-ui/icons";
import {
  Avatar,
  AvatarGroup,
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
  Spacer,
  Spinner,
  Stack,
  Text,
  Textarea,
  Tooltip,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  VStack,
  Wrap,
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
import { useFormik } from "formik";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FaCog } from "react-icons/fa";
import {
  FiEdit,
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
    pageSize: 5,
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
    if (DataAuth && DataAuth.teamMember) {
      const PayloadList: PaggingListPayloadCustom = {
        search: globalFilter,
        teamId: DataAuth.teamMember.id,
        limit: pageSize,
        page: pageIndex,
        filterWhere: [],
        fieldOrder: ["createdAt"],
        orderDir: "desc",
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

  const projectValidationSchema = Yup.object().shape({
    projectNo: Yup.string().nullable(), // Allow null for projectNo
    projectCode: Yup.string().required("Project Code is required"),
    projectName: Yup.string().required("Project Name is required"),
    projectDesc: Yup.string().nullable(), // Optional field
    note: Yup.string().nullable(), // Optional field
    teamId: Yup.string().required("Team ID is required"),
  });

  const formik = useFormik<ProjectInsertPayload>({
    initialValues: {
      projectNo: null,
      projectCode: "",
      projectName: "",
      projectDesc: null,
      note: null,
      teamId: "",
    },
    validationSchema: projectValidationSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      console.log(values);
      await handleConfirmSaveData(values);
    },
  });

  const AddProjectNewServ = async (data: ProjectInsertPayload) => {
    const requestData = await InsertProjects(data, tokenData);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;
    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setActionLoading(false);
      return;
    } else {
      console.log(requestData);
      showToast({
        description: "Adding data successfully",
        statusToast: "success",
      });
      setActionLoading(false);
      ModalForm.onClose();
      RefreshAction();
      handleResetForm();
      return;
    }
  };

  const handleResetForm = () => {
    formik.setFieldValue("projectNo", null);
    formik.setFieldValue("projectCode", "");
    formik.setFieldValue("projectName", "");
    formik.setFieldValue("projectDesc", null);
    formik.setFieldValue("note", null);
    formik.setFieldValue("teamId", "");
  };

  const ModalForm = useDisclosure();
  const handleAddNew = () => {
    if (DataAuth && DataAuth.teamMember) {
      handleResetForm();
      formik.setFieldValue("teamId", DataAuth.teamMember.id);
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

  const handleConfirmSaveData = (data: ProjectInsertPayload) => {
    setCaptionDialog("Confirm Save Data");
    setQuestionMsgDialog(
      `Are you sure want to create new project "${data.projectName}"?`
    );
    setOpenConfirmDialog(true);
    setPayloadData(data);
  };

  const handleSaveData = async () => {
    setActionLoading(true);
    await delay(DELAY_MEDIUM);
    if (DataAuth && DataAuth.teamMember && PayloadData) {
      await AddProjectNewServ(PayloadData);
    } else {
      showToast({
        description: "Data is invalid",
        statusToast: "error",
      });
      setActionLoading(false);
      setPayloadData(null);
    }
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
        size={"3xl"}
        isOpen={ModalForm.isOpen}
        isCentered
        onClose={ModalForm.onClose}
      >
        <form onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
          <ModalOverlay bg="blackAlpha.300" />
          <ModalContent
            rounded={radiusStyle}
            m={2}
            bg={useColorModeValue("white", "gray.900")}
          >
            <ModalHeader>Create New Project</ModalHeader>
            <ModalCloseButton />
            <ModalBody w={"full"}>
              <Flex as={Stack} w={"full"} pt={4}>
                <FormControl
                  id="projectCode"
                  isInvalid={formik.errors.projectCode ? true : false}
                  isRequired
                >
                  <InputLayoutFull>
                    <FormLabel h={"full"} py={3}>
                      Project Code
                    </FormLabel>
                    <Stack spacing={0}>
                      <Input
                        id="projectCode"
                        name="projectCode"
                        type="text"
                        // onChange={(e) => {
                        //   const uppercaseValue = e.target.value.toUpperCase();
                        //   formik.setFieldValue("projectCode", uppercaseValue);
                        // }}
                        onChange={formik.handleChange}
                        value={formik.values.projectCode ?? ""}
                        placeholder="Project Code"
                        minLength={3}
                        maxLength={80}
                        isReadOnly={ActionLoading}
                      />
                      <FormErrorMessage>
                        {formik.errors.projectCode}
                      </FormErrorMessage>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl
                  id="projectNo"
                  isInvalid={formik.errors.projectNo ? true : false}
                >
                  <InputLayoutFull>
                    <FormLabel h={"full"} py={3}>
                      Register No.
                    </FormLabel>
                    <Stack spacing={0}>
                      <Input
                        id="projectNo"
                        name="projectNo"
                        type="text"
                        // onChange={(e) => {
                        //   const uppercaseValue = e.target.value.toUpperCase();
                        //   formik.setFieldValue("projectNo", uppercaseValue);
                        // }}
                        onChange={formik.handleChange}
                        value={formik.values.projectNo ?? ""}
                        placeholder="Register No. (Optional)"
                        minLength={3}
                        maxLength={80}
                        isReadOnly={ActionLoading}
                      />
                      <FormHelperText>Can decide letter</FormHelperText>
                      <FormErrorMessage>
                        {formik.errors.projectNo}
                      </FormErrorMessage>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl
                  id="projectName"
                  isInvalid={formik.errors.projectName ? true : false}
                  isRequired
                >
                  <InputLayoutFull>
                    <FormLabel h={"full"} py={3}>
                      Project Name
                    </FormLabel>
                    <Stack spacing={0}>
                      <Input
                        id="projectName"
                        name="projectName"
                        type="text"
                        // onChange={(e) => {
                        //   const uppercaseValue = e.target.value.toUpperCase();
                        //   formik.setFieldValue("projectName", uppercaseValue);
                        // }}
                        onChange={formik.handleChange}
                        value={formik.values.projectName ?? ""}
                        placeholder="Project Name"
                        minLength={3}
                        maxLength={200}
                        isReadOnly={ActionLoading}
                      />
                      <FormErrorMessage>
                        {formik.errors.projectName}
                      </FormErrorMessage>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl
                  id="projectDesc"
                  isInvalid={formik.errors.projectDesc ? true : false}
                >
                  <InputLayoutFull>
                    <FormLabel h={"full"} py={3}>
                      Descriptions (Optional)
                    </FormLabel>
                    <Stack spacing={0}>
                      <Textarea
                        id="projectDesc"
                        name="projectDesc"
                        onChange={formik.handleChange}
                        defaultValue={formik.values.projectDesc ?? ""}
                        placeholder="Descriptions (Optional)"
                        isReadOnly={ActionLoading}
                      />
                      <FormErrorMessage>
                        {formik.errors.projectDesc}
                      </FormErrorMessage>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <Divider />

                <FormControl
                  id="note"
                  isInvalid={formik.errors.note ? true : false}
                >
                  <InputLayoutFull>
                    <FormLabel h={"full"} py={3}>
                      Note (Optional)
                    </FormLabel>
                    <Stack spacing={0}>
                      <Textarea
                        id="note"
                        name="note"
                        onChange={formik.handleChange}
                        defaultValue={formik.values.note ?? ""}
                        placeholder="Note (Optional)"
                        isReadOnly={ActionLoading}
                      />
                      <FormErrorMessage>{formik.errors.note}</FormErrorMessage>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                {/* <pre>{JSON.stringify(formik.values, null, 2)}</pre> */}
              </Flex>
            </ModalBody>

            <ModalFooter>
              <Button
                colorScheme={"gray"}
                leftIcon={<FiX />}
                mr={3}
                onClick={ModalForm.onClose}
                isLoading={ActionLoading}
              >
                Close
              </Button>
              <Button
                leftIcon={<FiSave />}
                type={"submit"}
                colorScheme={"secondary"}
                isLoading={ActionLoading}
              >
                Save
              </Button>
            </ModalFooter>
          </ModalContent>
        </form>
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
    if (DataAuth && DataAuth.teamMember) {
      const GetDataList = async () => {
        const requestData = await GetDetailById(
          DataAuth.teamMember.id,
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
                <Flex>
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
                </Flex>
              </Flex>
            </Container>
          </Flex>
        </Flex>

        {/* <pre>{JSON.stringify(DataTeam?.teamUserMembers, null, 2)}</pre> */}
      </Box>
    </Flex>
  );
};

export default ProjectManagerPage;
