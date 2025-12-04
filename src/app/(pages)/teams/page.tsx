"use client";

import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import {
  InputLayout,
  InputLayoutFull,
} from "@/app/components/layoutContentBody";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { TableComponentFull } from "@/app/components/tableComponents";
import {
  DELAY_ACTION,
  DELAY_LOW,
  DELAY_MEDIUM,
  ENDPOINT_API_BASEURL,
  ENDPOINT_PORT_BASIC,
  GENERAL_STATUS_ACTIVE,
  MAX_SIZE_TABLE,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface, useAuth } from "@/app/context/AuthContext";
import { buildUrlPort, truncateToTwoWords } from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useTeams, {
  TeamMemberPayload,
  TeamRoleFullResponse,
  TeamRoleInsertPayload,
  TeamRoleUpdatePayload,
  TeamsResponse,
  TeamsUserMember,
  TeamsUserMemberResponse,
  TeamUpdatePayload,
} from "@/app/services/useTeams";
import useUsers, { UsersResponse } from "@/app/services/useUsers";
import {
  OptionListProps,
  PaggingListPayload,
  PaggingListPayloadCustom,
} from "@/app/types/masterTypes";
import { ChevronDownIcon, Search2Icon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Stack,
  StackDivider,
  Text,
  Textarea,
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
import { useEffect, useMemo, useState } from "react";
import {
  FiEdit3,
  FiMinusCircle,
  FiMoreVertical,
  FiPlusCircle,
  FiPlusSquare,
  FiRefreshCcw,
  FiSave,
  FiTrash2,
  FiUserCheck,
  FiUserPlus,
  FiUserX,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import * as Yup from "yup";
import { Select } from "chakra-react-select";
import useSpecialization, {
  SpecializationResponse,
} from "@/app/services/useSpecialization";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Teams manager",
  breadCrumb: ["Home", "Teams Manager"],
};

interface MenuPagesInterface {
  name: string;
  link: string;
}

const MenusPage: MenuPagesInterface[] = [
  {
    name: "Team Profile",
    link: "#teamProfile",
  },
  {
    name: "Team Member",
    link: "#teamMembers",
  },
  // {
  //   name: "Role Setting",
  //   link: "#teamRoleSettings",
  // },
  // {
  //   name: "Team Management",
  //   link: "#teamManagement",
  // },
];

function TeamsPage() {
  useDocumentTitle("Teams Management");
  const { colorMode } = useColorMode();
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

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      {/* Enhanced Header Section */}
      <Box
        mb={6}
        p={6}
        bgGradient="linear(135deg, blue.500, purple.600)"
        rounded="xl"
        color="white"
      >
        <VStack spacing={3} align="start">
          <HStack>
            <FiUserCheck size={24} />
            <Text fontSize="2xl" fontWeight="bold">
              Team Management Center
            </Text>
          </HStack>
          <Text fontSize="md" opacity={0.9}>
            Manage your team profile, members, and collaboration settings
          </Text>
        </VStack>
      </Box>
      <Grid templateColumns="repeat(12, 1fr)" gap={8}>
        <GridItem colSpan={{ base: 12, sm: 12, md: 3, lg: 3 }}>
          <Flex
            as={Stack}
            w={"full"}
            bg={colorMode === "light" ? "white" : "gray.800"}
            p={3}
            rounded={radiusStyle}
            shadow={"md"}
            spacing={5}
            py={8}
            divider={<StackDivider />}
          >
            {MenusPage.map((dt, index) => (
              <MenuLinkItem key={index} data={dt} />
            ))}
          </Flex>
        </GridItem>
        <GridItem colSpan={{ base: 12, sm: 12, md: 9, lg: 9 }}>
          <Card
            rounded={radiusStyle}
            bg={colorMode === "light" ? "white" : "gray.800"}
          >
            <CardBody>
              <Box minH={"80vh"}>
                <Flex as={Stack} w={"full"} p={2} divider={<StackDivider />}>
                  <Flex w={"full"} p={2} id={"teamProfile"}>
                    <TeamProfileSettingProps />
                  </Flex>
                  <Flex w={"full"} minH={"40vh"} p={2} id={"teamMembers"}>
                    <TeamMembersProps />
                  </Flex>
                  {/* <Flex w={"full"} minH={"40vh"} p={2} id={"teamManagement"}>
                    <Text fontWeight={600}>Team Management</Text>
                  </Flex> */}
                </Flex>
              </Box>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </LayoutAdmin>
  );
}

const MenuLinkItem = ({ data }: { data: MenuPagesInterface }) => {
  return (
    <Link href={data.link}>
      <Flex
        w={"full"}
        px={5}
        transition={"all .25s ease-in-out"}
        cursor={"pointer"}
        _hover={{
          pl: 8,
          color: "secondary.500",
        }}
      >
        <Text fontWeight={600}>{data.name}</Text>
      </Flex>
    </Link>
  );
};

const FormSchemaEditTeam = Yup.object().shape({
  teamName: Yup.string().required("Required"),
});

const TeamProfileSettingProps = () => {
  const showToast = useToastHelper();
  const { isAuthenticated, authData, goLogout } = useAuth();
  const { colorMode } = useColorMode();
  const { GetDetailById, GetDetailByCode, UpdateTeams, isLoading, error } =
    useTeams();
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

  const formik = useFormik<TeamUpdatePayload>({
    initialValues: {
      id: "", // Matches 'id' in the interface
      teamCode: "",
      teamName: "", // Matches 'teamName' in the interface
      teamDesc: null, // Matches 'teamDesc' in the interface
      uploadPict: null, // Matches 'uploadPict' in the interface
      isActive: "ACTIVE", // Matches 'isActive' in the interface
      deletePict: false, // Matches 'deletePict' in the interface
      orgGroupId: "",
      orgGroupCode: "",
    },
    validationSchema: FormSchemaEditTeam,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      console.log(values);
      await handleConfirmSaveData({
        id: values.id, // Ensure camelCase usage
        teamCode: values.teamCode,
        teamName: values.teamName, // Ensure camelCase usage
        teamDesc: values.teamDesc,
        uploadPict: values.uploadPict,
        isActive: values.isActive,
        deletePict: values.deletePict,
        orgGroupId: values.orgGroupId,
        orgGroupCode: values.orgGroupCode,
      });
    },
  });

  const [image, setImage] = useState("/img/default-sq.jpg"); // Default image

  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(true);
  const [ActionLoading, setActionLoading] = useState(false);
  const [IsEditMode, setIsEditMode] = useState(false);
  useEffect(() => {
    setIsLoadingProcess(true);
    if (DataAuth && DataAuth.team) {
      const TeamIdExist: string = DataAuth.team.id as string;
      const GetDataList = async () => {
        const requestData = await GetDetailById(TeamIdExist, tokenData);
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

          formik.setFieldValue("id", itemsData.id);
          formik.setFieldValue("teamName", itemsData.teamName);
          formik.setFieldValue("teamDesc", itemsData.teamDesc);
          formik.setFieldValue("uploadPict", null);
          formik.setFieldValue("isActive", GENERAL_STATUS_ACTIVE);
          formik.setFieldValue("deletePict", false);
          formik.setFieldValue("orgGroupId", itemsData.orgGroupId);
          formik.setFieldValue("orgGroupCode", itemsData.orgGroupCode);

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

  const [ImageFile, setImageFile] = useState<File | null>(null);

  const RefreshAction = () => {
    setUpdatePayload(null);
    setRefreshData(RefreshData + 1);
  };

  useEffect(() => {
    if (ImageFile != null) {
      formik.setFieldValue("uploadPict", ImageFile);
    }
  }, [ImageFile, formik.values.uploadPict]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        const imageUrl = URL.createObjectURL(file); // Generate a URL for the image preview
        setImage(imageUrl); // Set the new image preview URL
        setImageFile(file); // Set the image file in state
      } else {
        showToast({
          description: "File is not an image",
          statusToast: "error",
        });
      }
    }
  };

  const ActionUpdateTeamServ = async (data: TeamUpdatePayload) => {
    const requestData = await UpdateTeams(data, tokenData);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;
    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setActionLoading(false);
      return;
    } else {
      showToast({
        description: "Update team successfully",
        statusToast: "success",
      });
      setActionLoading(false);
      RefreshAction();
      return;
    }
  };

  const [openConfirmUpdateDialog, setOpenConfirmUpdateDialog] = useState(false);
  const [questionMsgDialog, setQuestionMsgDialog] = useState<string>("");
  const [captionDialog, setCaptionDialog] = useState<string>("");
  const [UpdatePayload, setUpdatePayload] = useState<TeamUpdatePayload | null>(
    null
  );

  const handleConfirmSaveData = (data: TeamUpdatePayload) => {
    setCaptionDialog("Confirm Save");
    setQuestionMsgDialog(`Are you sure want update team profile?`);
    setOpenConfirmUpdateDialog(true);
    setUpdatePayload(data);
  };

  const handleConfirmSaveDataTrigger = () => {
    setOpenConfirmUpdateDialog(!openConfirmUpdateDialog);
  };

  const handleUpdateData = async () => {
    setActionLoading(true);
    await delay(DELAY_MEDIUM);
    if (DataAuth && DataAuth.team && UpdatePayload) {
      await ActionUpdateTeamServ(UpdatePayload);
      // showToast({
      //   description: "Simulated Success",
      //   statusToast: "success",
      // });
      // setActionLoading(false);
      // RefreshAction();
      setIsEditMode(false);
    } else {
      showToast({
        description: "ID is invalid",
        statusToast: "error",
      });
      setActionLoading(false);
      setUpdatePayload(null);
      setIsEditMode(false);
    }
  };

  return (
    <Flex as={Stack} w={"full"} spacing={2} pb={5}>
      <Text fontWeight={600}>Team Profile Setting</Text>

      <ConfirmationDialog
        key={"confirmUpdateData"}
        isOpenTrigger={openConfirmUpdateDialog}
        action={handleUpdateData}
        trigger={handleConfirmSaveDataTrigger}
        questionMsg={questionMsgDialog}
        captionMsg={captionDialog}
      />

      {IsLoadingProcess ? (
        <LoadingMiniSignature />
      ) : (
        <form onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
          <Grid templateColumns="repeat(12, 1fr)" gap={8}>
            <GridItem colSpan={{ base: 12, sm: 12, md: 4, lg: 4 }} w={"full"}>
              <Flex w={"full"} justify={"center"} pt={8}>
                <Box
                  as="label" // Make the box a label to trigger file input click
                  w={"190px"}
                  h={"190px"}
                  backgroundImage={`url(${image})`} // Dynamic image source
                  backgroundSize={"cover"}
                  backgroundPosition={"center"}
                  rounded={"full"}
                  cursor={"pointer"}
                  boxShadow={"md"}
                  position="relative"
                  overflow="hidden" // Ensure text stays inside the rounded box
                >
                  {/* Text that appears in the center on hover */}
                  <Box
                    display={IsEditMode ? "flex" : "none"}
                    alignItems="center"
                    justifyContent="center"
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    bg="rgba(0, 0, 0, 0.5)" // Semi-transparent gray background with correct opacity
                    color="white"
                    fontWeight="bold"
                    opacity="0" // Hidden by default
                    transition="opacity 0.3s ease"
                    _hover={{
                      opacity: "1", // Show text on hover
                    }}
                  >
                    <FiEdit3 />
                    <Text pl={2}>Change Image</Text>
                  </Box>

                  {/* Hidden input file */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={!IsEditMode || ActionLoading}
                    style={{ display: "none" }} // Hide the input
                  />
                </Box>
              </Flex>
            </GridItem>
            <GridItem
              colSpan={{ base: 12, sm: 12, md: 8, lg: 8 }}
              w={"full"}
              minH={"10vh"}
            >
              <Flex as={Wrap} justifyContent={"end"} px={0} w={"full"}>
                <Button
                  display={IsEditMode ? "none" : "flex"}
                  size={"sm"}
                  leftIcon={<FiRefreshCcw />}
                  onClick={() => RefreshAction()}
                  isLoading={ActionLoading}
                >
                  Refresh
                </Button>
                <Button
                  display={IsEditMode ? "flex" : "none"}
                  size={"sm"}
                  colorScheme={"red"}
                  leftIcon={<FiXCircle />}
                  onClick={() => setIsEditMode(false)}
                  isLoading={ActionLoading}
                >
                  Cancel
                </Button>
                <Button
                  display={IsEditMode ? "none" : "flex"}
                  size={"sm"}
                  leftIcon={<FiEdit3 />}
                  colorScheme={"secondary"}
                  onClick={() => setIsEditMode(true)}
                  isLoading={ActionLoading}
                >
                  Edit
                </Button>
                <Button
                  display={IsEditMode ? "flex" : "none"}
                  size={"sm"}
                  colorScheme={"green"}
                  leftIcon={<FiSave />}
                  type={"submit"}
                  isLoading={ActionLoading}
                >
                  Save
                </Button>
              </Flex>
              <Flex as={Stack} w={"full"} pt={4}>
                <FormControl
                  id="teamName"
                  isInvalid={formik.errors.teamName ? true : false}
                  isRequired
                >
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Team Name
                    </FormLabel>
                    <Stack spacing={0}>
                      <Input
                        id="teamName"
                        name="teamName"
                        type="text"
                        onChange={(e) => {
                          const uppercaseValue = e.target.value.toUpperCase(); // Convert to uppercase
                          formik.setFieldValue("teamName", uppercaseValue); // Update Formik's value
                        }}
                        value={formik.values.teamName ?? ""}
                        placeholder="Team Name"
                        readOnly={!IsEditMode}
                        variant={IsEditMode ? "outline" : "filled"}
                        minLength={3}
                        maxLength={80}
                        isDisabled={ActionLoading}
                      />
                      <FormErrorMessage>
                        {formik.errors.teamName}
                      </FormErrorMessage>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl
                  id="teamDesc"
                  isInvalid={formik.errors.teamDesc ? true : false}
                >
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Team Descriptions
                    </FormLabel>
                    <Stack spacing={0}>
                      <Textarea
                        id="teamDesc"
                        name="teamDesc"
                        onChange={(e) => {
                          formik.setFieldValue("teamDesc", e.target.value);
                        }}
                        readOnly={!IsEditMode}
                        variant={IsEditMode ? "outline" : "filled"}
                        defaultValue={formik.values.teamDesc ?? ""}
                        placeholder="Team Descriptions"
                        isDisabled={ActionLoading}
                      ></Textarea>
                      <FormErrorMessage>
                        {formik.errors.teamDesc}
                      </FormErrorMessage>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                {/* <pre>{JSON.stringify(formik.values, null, 2)}</pre> */}
              </Flex>
            </GridItem>
          </Grid>
        </form>
      )}
    </Flex>
  );
};

const TeamMembersProps = () => {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const { isAuthenticated, authData, goLogout } = useAuth();
  const {
    List,
    GetDetailById,
    ListMembers,
    InsertTeamMember,
    UpdateTeamMember,
    RemoveTeamMember,
  } = useTeams();
  const { List: ListUsers, GetDetailById: GetUserById } = useUsers();
  const { List: ListRole } = useSpecialization();
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

  const [TeamMembers, setTeamMembers] = useState<UsersResponse[]>([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  const [totalPages, setTotalPageData] = useState<number>(0);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
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

  const columnsData = useMemo<ColumnDef<UsersResponse>[]>(
    () => [
      {
        accessorKey: "numbData",
        cell: (info) => (
          <Flex justifyContent={"center"}>
            {pageIndex * pageSize + info.row.index + 1}.
          </Flex>
        ),
        header: () => <Flex justifyContent={"center"}>No.</Flex>,
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.userId,
        id: "userId",
        cell: (info) => (
          <Stack spacing={0}>
            <Flex as={HStack}>
              <Avatar
                size={"sm"}
                // src={"/img/default-user-img.jpg"}
                color={"white"}
                bgGradient={"linear(to-br, primary.500, secondary.500)"}
                name={truncateToTwoWords(info.row.original.nama)}
                mr="2"
              />
              <Stack spacing={0}>
                <Text>
                  {info.row.original.nama} | {info.row.original.userId}
                </Text>
                <Text
                  fontWeight={600}
                  fontSize={"x-small"}
                  color={"secondary.700"}
                >
                  {info.row.original.teamRole?.specName}
                </Text>
              </Stack>
            </Flex>
          </Stack>
        ),
        header: () => <span>User Member</span>,
        footer: (props) => props.column.id,
      },
      // {
      //   accessorFn: (row) => row.team.teamCode,
      //   id: "teamCode",
      //   cell: (info) => (
      //     <Stack spacing={0}>
      //       <Text>{info.row.original.team.teamName}</Text>
      //       <Text
      //         fontWeight={500}
      //         fontSize={"xx-small"}
      //         color={"secondary.300"}
      //       >
      //         {info.row.original.team.teamCode}
      //       </Text>
      //     </Stack>
      //   ),
      //   header: () => <span>Team</span>,
      //   footer: (props) => props.column.id,
      // },
      // {
      //   accessorFn: (row) => row.teamRole?.teamRoleCode,
      //   id: "teamRoleCode",
      //   cell: (info) => (
      //     <Stack spacing={0}>
      //       <Text>{info.row.original.teamRole?.teamRoleName}</Text>
      //       <Text
      //         fontWeight={500}
      //         fontSize={"xx-small"}
      //         color={"secondary.300"}
      //       >
      //         {info.row.original.teamRole?.teamRoleCode}
      //       </Text>
      //     </Stack>
      //   ),
      //   header: () => <span>Team Role</span>,
      //   footer: (props) => props.column.id,
      // },
      {
        accessorFn: (row) => row.id,
        id: "id",
        cell: (info) => (
          <Flex w={"full"} as={Wrap} justifyContent={"center"}>
            <Button
              size={"sm"}
              colorScheme={"secondary"}
              onClick={() => handleEditData(info.row.original)}
              isLoading={ActionLoading}
            >
              <FiEdit3 />
            </Button>
            <Button
              size={"sm"}
              colorScheme={"red"}
              onClick={() => handleConfirmDeleteData(info.row.original)}
              isLoading={ActionLoading}
            >
              <FiTrash2 />
            </Button>
          </Flex>
        ),
        header: () => (
          <Flex w={"full"} justifyContent={"center"}>
            Actions
          </Flex>
        ),
        footer: (props) => props.column.id,
      },
    ],
    [ActionLoading, pageIndex, pageSize, DataOptionsRoleTeam]
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
        fieldOrder: ["nama"],
        orderDir: "asc",
      };

      setIsLoadingProcess(true);
      const GetDataList = async () => {
        const requestData = await ListMembers(PayloadList, tokenData);
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

          const itemsData: UsersResponse[] =
            requestData.data as UsersResponse[];
          const totalData: number = requestData.countTotal as number;
          const totalPages: number =
            totalData > 0 ? Math.ceil(totalData / pageSize) : -1;
          setTeamMembers(itemsData);
          setTotalPageData(totalPages);
          setIsLoadingProcess(false);
        }
      };
      GetDataList();
    }
  }, [DataAuth, RefreshData, pageIndex, pageSize, globalFilter]);
  const [SelectedRoleTeam, setSelectedRoleTeam] =
    useState<OptionListProps | null>(null);

  useEffect(() => {
    setDataOptionsRoleTeam([]);
    if (DataAuth && DataAuth.team) {
      const PayloadList: PaggingListPayload = {
        search: "",
        limit: MAX_SIZE_TABLE,
        page: 0,
        filterWhere: [
          {
            field: "category",
            operator: "=",
            value: "ROLE",
          },
        ],
        fieldOrder: ["specName"],
        orderDir: "asc",
      };

      setIsLoadingProcess(true);
      const GetDataList = async () => {
        const requestData = await ListRole(PayloadList, tokenData);
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

          const itemsData: SpecializationResponse[] =
            requestData.data as SpecializationResponse[];

          if (itemsData.length > 0) {
            itemsData.map((dt, index) => {
              setDataOptionsRoleTeam((prevData) => [
                ...prevData,
                {
                  label: `${dt.specName}`,
                  value: dt.id,
                },
              ]);
            });
          }
        }
      };
      GetDataList();
    }
  }, [DataAuth, RefreshData]);

  const handleSelectedOption = (data: OptionListProps) => {
    setSelectedRoleTeam(data);
    formik.setFieldValue("teamRoleId", data.value);
  };
  const handleUnselectedOption = () => {
    setSelectedRoleTeam(null);
    formik.setFieldValue("teamRoleId", "");
  };

  const RefreshAction = () => {
    setTotalPageData(0);
    setTeamMembers([]);
    setRefreshData(RefreshData + 1);
  };

  const table = useReactTable({
    data: TeamMembers,
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

  const formik = useFormik({
    initialValues: {
      userId: "",
      teamId: "",
      teamRoleId: "",
    },
    // validationSchema: FormSchemaEditTeam,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      console.log(values);
      setActionLoading(true);
      await delay(DELAY_ACTION);
      if (IsEditMode) {
        // Update Action
        await EditTeamMemberServ(values);
      } else {
        // Insert Action
        await AddTeamMemberServ(values);
      }
    },
  });

  const AddTeamMemberServ = async (data: TeamMemberPayload) => {
    const requestData = await InsertTeamMember(data, tokenData);
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
      return;
    }
  };

  const EditTeamMemberServ = async (data: TeamMemberPayload) => {
    const requestData = await UpdateTeamMember(data, tokenData);
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
        description: "Edit data successfully",
        statusToast: "success",
      });
      setActionLoading(false);
      ModalForm.onClose();
      RefreshAction();
      return;
    }
  };

  const DeleteTeamMemberServ = async (data: TeamMemberPayload) => {
    const requestData = await RemoveTeamMember(data, tokenData);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      return;
    } else {
      console.log(requestData);

      showToast({
        description: "Delete data successfully",
        statusToast: "success",
      });

      RefreshAction();
      setActionLoading(false);
      return;
    }
  };

  const handleResetForm = () => {
    setDataUsers([]);
    setSearchUserInput("");
    clearSelectedUser();
    handleUnselectedOption();
  };

  const ModalForm = useDisclosure();
  const handleAddNew = () => {
    if (DataAuth && DataAuth.team) {
      setIsEditMode(false);
      handleResetForm();
      formik.setFieldValue("userId", "");
      formik.setFieldValue("teamId", DataAuth.team ? DataAuth.team.id : "");
      formik.setFieldValue("teamRoleId", "");
      // handleSetSelectedOption("4d7c52c1-28bd-449b-ac4b-00129823eb5a");
      ModalForm.onOpen();
    } else {
      showToast({
        description: "Team ID is invalid",
        statusToast: "error",
      });
    }
  };

  const handleEditData = async (data: UsersResponse) => {
    setActionLoading(true);
    console.log(data);
    if (data.teamRole != null && DataOptionsRoleTeam.length > 0) {
      setIsEditMode(true);
      handleResetForm();
      formik.setFieldValue("userId", data.id);
      formik.setFieldValue("teamId", data.team ? data.team.id : "");
      formik.setFieldValue("teamRoleId", data.teamRole.id);
      const dataOption: OptionListProps | undefined = DataOptionsRoleTeam.find(
        (x) => x.value === data.teamRole?.id
      );
      console.log(dataOption);
      if (dataOption != undefined) {
        setSelectedRoleTeam(dataOption);
      }
      await GetDataUserById(data.id);
      await delay(DELAY_MEDIUM);
      ModalForm.onOpen();
      setActionLoading(false);
    } else {
      showToast({
        description: "Data is not ready yet, Please wait a moment",
        statusToast: "warning",
      });
      setActionLoading(false);
    }
  };

  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);
  const [questionMsgDialog, setQuestionMsgDialog] = useState<string>("");
  const [captionDialog, setCaptionDialog] = useState<string>("");
  const [detailData, setdetailData] = useState<UsersResponse | null>(null);

  const GetDataUser = async (searchValue: string) => {
    const PayloadList: PaggingListPayload = {
      search: searchValue,
      limit: 1,
      page: 0,
      filterWhere: [],
      fieldOrder: ["nama"],
      orderDir: "asc",
    };
    const requestData = await ListUsers(PayloadList, tokenData);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      return;
    } else {
      console.log(requestData);
      if (requestData.data == null) {
        showToast({
          description: "Data return error",
          statusToast: "error",
        });
        return;
      }

      const itemsData: UsersResponse[] = requestData.data as UsersResponse[];
      setDataUsers(itemsData);
    }
  };

  const GetDataUserById = async (id: string) => {
    const PayloadList: PaggingListPayload = {
      search: "",
      limit: 1,
      page: 0,
      filterWhere: [
        {
          field: "id",
          operator: "=",
          value: id,
        },
      ],
      fieldOrder: ["nama"],
      orderDir: "asc",
    };
    const requestData = await ListUsers(PayloadList, tokenData);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      return;
    } else {
      console.log(requestData);
      if (requestData.data == null) {
        showToast({
          description: "Data return error",
          statusToast: "error",
        });
        return;
      }

      const itemsData: UsersResponse[] = requestData.data as UsersResponse[];
      setDataUsers(itemsData);
    }
  };

  const [SearchUserInput, setSearchUserInput] = useState<string>("");
  const [DataUsers, setDataUsers] = useState<UsersResponse[]>([]);
  const handleSearchUser = async (textSearch: string) => {
    setDataUsers([]);
    setSearchUserInput(textSearch);
    if (textSearch.length >= 2) {
      await GetDataUser(textSearch);
    } else if (textSearch.length <= 0) {
      setDataUsers([]);
    }
  };
  const [UserAddChoosed, setUserAddChoosed] = useState<UsersResponse | null>(
    null
  );

  const handleSelectedUser = (usr: UsersResponse) => {
    setUserAddChoosed(usr);
    formik.setFieldValue("userId", usr.id);
  };

  const clearSelectedUser = () => {
    setUserAddChoosed(null);
    formik.setFieldValue("userId", "");
  };

  const handleConfirmDeleteData = (data: UsersResponse) => {
    setCaptionDialog("Confirm Delete");
    setQuestionMsgDialog(`Are you sure want to delete "${data.nama}"?`);
    setOpenConfirmDeleteDialog(true);
    setdetailData(data);
  };

  const handleDeleteData = async () => {
    setActionLoading(true);
    await delay(DELAY_MEDIUM);
    if (DataAuth && DataAuth.team && detailData && detailData.teamRole) {
      await DeleteTeamMemberServ({
        teamId: detailData.team ? detailData.team.id : "",
        teamRoleId: detailData.teamRole ? detailData.teamRole.id : "",
        userId: detailData.id,
      });
    } else {
      showToast({
        description: "ID is invalid",
        statusToast: "error",
      });
      setActionLoading(false);
      setdetailData(null);
    }
  };

  const handleDialogDeleteTrigger = () => {
    setOpenConfirmDeleteDialog(!openConfirmDeleteDialog);
  };

  return (
    <Flex as={Stack} w={"full"} spacing={2} pb={5}>
      <ConfirmationDialog
        key={"confirmDeleteData"}
        isOpenTrigger={openConfirmDeleteDialog}
        action={handleDeleteData}
        trigger={handleDialogDeleteTrigger}
        questionMsg={questionMsgDialog}
        captionMsg={captionDialog}
      />
      <Modal
        size={"2xl"}
        isOpen={ModalForm.isOpen}
        isCentered
        onClose={ModalForm.onClose}
      >
        <form onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
          <ModalOverlay bg="blackAlpha.300" />
          <ModalContent
            rounded={radiusStyle}
            m={2}
            bg={colorMode == "light" ? "white" : "gray.900"}
          >
            <ModalHeader>{"Register Member"}</ModalHeader>
            <ModalCloseButton />
            <ModalBody w={"full"}>
              <Flex as={Stack} w={"full"} pt={4}>
                {!IsEditMode && (
                  <FormControl id="searchUser" isRequired>
                    <InputLayoutFull>
                      <FormLabel h={"full"} mt={2}>
                        Search User
                      </FormLabel>
                      <Stack spacing={0}>
                        <Input
                          id="searchUser"
                          name="searchUser"
                          type="text"
                          onChange={(e) => {
                            handleSearchUser(e.target.value);
                          }}
                          value={SearchUserInput}
                          placeholder="Search Users"
                          isDisabled={UserAddChoosed != null}
                        />
                      </Stack>
                    </InputLayoutFull>
                  </FormControl>
                )}

                <Flex as={Stack} w={"full"} p={2} spacing={3}>
                  {DataUsers.map((dt, index) => (
                    <Flex
                      bg={colorMode == "light" ? "gray.100" : "gray.700"}
                      w={"full"}
                      py={3}
                      px={8}
                      rounded={radiusStyle}
                      boxShadow={"md"}
                      as={HStack}
                      spacing={8}
                      key={index}
                    >
                      <Box>
                        <Avatar name={dt.nama} src="" />
                      </Box>
                      <Box>
                        <Stack spacing={0}>
                          <Text>
                            {dt.nama} ({dt.userId})
                          </Text>
                          <Text
                            fontWeight={600}
                            fontSize={"small"}
                            color={"secondary.700"}
                          >
                            {dt.namaUnitKerja}
                          </Text>
                        </Stack>
                      </Box>
                      <Spacer />
                      {!IsEditMode && (
                        <>
                          <Box>
                            {UserAddChoosed != null &&
                              UserAddChoosed.id == dt.id && (
                                <Text fontWeight={600} color={"green.500"}>
                                  Choosed
                                </Text>
                              )}
                          </Box>
                          <Button
                            colorScheme={
                              UserAddChoosed != null ? "red" : "secondary"
                            }
                            size={"sm"}
                            onClick={() => {
                              UserAddChoosed != null
                                ? clearSelectedUser()
                                : handleSelectedUser(dt);
                            }}
                          >
                            {UserAddChoosed != null ? (
                              <FiMinusCircle />
                            ) : (
                              <FiPlusCircle />
                            )}
                          </Button>
                        </>
                      )}
                    </Flex>
                  ))}
                </Flex>

                <FormControl id="setTeamRole" isRequired>
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Team Role As?
                    </FormLabel>
                    <Stack spacing={0}>
                      <Select
                        options={DataOptionsRoleTeam}
                        isSearchable={true}
                        onChange={(e) => {
                          e
                            ? handleSelectedOption({
                                label: e.label,
                                value: e.value,
                              })
                            : handleUnselectedOption();
                        }}
                        value={SelectedRoleTeam}
                      />
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                {/* <pre>{JSON.stringify(formik.values, null, 2)}</pre> */}
                {/* <pre>{JSON.stringify(SelectedRoleTeam, null, 2)}</pre> */}
                {/* <Divider /> */}
                {/* <pre>{JSON.stringify(DataUsers, null, 2)}</pre> */}
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

      <Text fontWeight={600}>Team Member Setting</Text>
      <Flex as={Wrap} justifyContent={"end"} px={0} w={"full"}>
        <Button
          size={"sm"}
          leftIcon={<FiRefreshCcw />}
          onClick={() => RefreshAction()}
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
          Add
        </Button>
      </Flex>

      <VStack w={"full"} p={0} align={"start"} spacing={2}>
        <Grid templateColumns="repeat(2, 1fr)" gap={4} pt={5} w={"full"}>
          <GridItem
            colSpan={{ base: 2, md: 2 }}
            textAlign={{ base: "center", md: "start" }}
            alignContent={"center"}
          ></GridItem>
          <GridItem
            colSpan={{ base: 2, md: 1 }}
            textAlign={{ base: "center", md: "end" }}
            w={"full"}
          >
            <Flex w={"full"} justifyContent={"left"}>
              <InputGroup w={{ base: "full", md: "65%" }}>
                <InputLeftElement pointerEvents="none" boxSize={12} h={"full"}>
                  <Search2Icon color={"secondary.500"} />
                </InputLeftElement>
                <Input
                  bg={colorMode === "light" ? "white" : "gray.800"}
                  type="text"
                  placeContent={"center"}
                  placeholder="Cari data..."
                  size={"md"}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  value={globalFilter}
                />
              </InputGroup>
            </Flex>
          </GridItem>
        </Grid>
        {IsLoadingProcess ? (
          <LoadingMiniSignature />
        ) : (
          <TableComponentFull table={table} />
        )}
      </VStack>
    </Flex>
  );
};

export default TeamsPage;
