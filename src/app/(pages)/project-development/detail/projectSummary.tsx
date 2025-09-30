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
  DELAY_MEDIUM,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface, useAuth } from "@/app/context/AuthContext";
import {
  getProjectHealthRating,
  TextStatusProps,
  truncateText,
} from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useProjects, {
  ProjectDataResponse,
  ProjectUpdatePICPayload,
  ProjectUserAssignmentResponse,
} from "@/app/services/useProjects";
import useTasks, { TasksCountResponse } from "@/app/services/useTasks";
import useUsers, {
  UsersFullResponse,
  UsersResponse,
} from "@/app/services/useUsers";
import { AppsDataInterface, DATA_APPS } from "@/app/types/appsInterface";
import { OptionListProps, PaggingListPayload } from "@/app/types/masterTypes";
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Grid,
  GridItem,
  HStack,
  Stack,
  Text,
  FormControl,
  FormLabel,
  Input,
  Tooltip,
  useDisclosure,
  useColorMode,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Spacer,
  ModalFooter,
  Heading,
  Progress,
  Divider,
  IconButton,
  VStack,
  SimpleGrid,
  Badge,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  FiInfo,
  FiMinusCircle,
  FiPlusCircle,
  FiPlusSquare,
  FiRefreshCcw,
  FiSave,
  FiSettings,
  FiX,
  FiTarget,
  FiUsers,
} from "react-icons/fi";

export interface ProjectSummaryProps {
  data: ProjectDataResponse | null;
  refreshActionMain: () => void;
}

const ProjectSummary = ({ data, refreshActionMain }: ProjectSummaryProps) => {
  const showToast = useToastHelper();
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

  const { ListPIC, UpdatePIC } = useProjects();
  const { CountTaskByProjectId } = useTasks();
  const { List: ListUsers, GetDetailById: GetUserById } = useUsers();
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  const [BoardData, setBoardData] = useState<any>(null);
  const [MemberProjects, setMemberProjects] = useState<UsersResponse[]>([]);
  const [TaskCountProject, setTaskCountProject] = useState<TasksCountResponse>({
    all: 0,
    toDo: 0,
    inProgress: 0,
    inReview: 0,
    done: 0,
    archived: 0,
  });

  const GetTaskCountProject = async (projectId: string) => {
    const requestData = await CountTaskByProjectId(projectId, tokenData);
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

      const itemsData: TasksCountResponse =
        requestData.data as TasksCountResponse;
      setTaskCountProject(itemsData);
    }
  };

  const RefreshAction = () => {
    setMemberProjects([]);
    setRefreshData(RefreshData + 1);
  };

  useEffect(() => {
    if (DataAuth && DataAuth.team && data) {
      const memberDataProject: ProjectUserAssignmentResponse[] =
        data.userAssignment;
      if (memberDataProject.length > 0) {
        const newMembers = memberDataProject.map((mp) => mp.userData);
        setMemberProjects((prev) => [...prev, ...newMembers]);
      }
      if (data.id) {
        const FetchDatas = async () => {
          await GetTaskCountProject(data.id);
        };
        FetchDatas();
      }
    }
  }, [DataAuth, data, RefreshData]);

  const ModalForm = useDisclosure();
  const [PayloadUpdate, setPayloadUpdate] =
    useState<ProjectUpdatePICPayload | null>(null);

  const handleAddNew = () => {
    if (DataAuth && DataAuth.team && data) {
      setPayloadUpdate(null);
      setDataUsers([]);
      setSearchUserInput("");
      setPayloadUpdate(null);
      setChoosedMemberProjects(MemberProjects);
      ModalForm.onOpen();
    } else {
      showToast({
        description: "Invalid data",
        statusToast: "error",
      });
    }
  };

  const [ActionLoading, setActionLoading] = useState(false);
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);
  const [questionMsgDialog, setQuestionMsgDialog] = useState<string>("");
  const [captionDialog, setCaptionDialog] = useState<string>("");

  const [SearchUserInput, setSearchUserInput] = useState<string>("");
  const [DataUsers, setDataUsers] = useState<UsersResponse[]>([]);
  const [ChoosedMemberProjects, setChoosedMemberProjects] = useState<
    UsersResponse[]
  >([]);
  const handleSearchUser = async (textSearch: string) => {
    setDataUsers([]);
    setSearchUserInput(textSearch);
    if (textSearch.length >= 2) {
      await GetDataUser(textSearch);
    } else if (textSearch.length <= 0) {
      setDataUsers([]);
    }
  };

  const handleAddUser = (data: UsersResponse) => {
    setChoosedMemberProjects([...ChoosedMemberProjects, data]); // Add new item to the state
    setDataUsers([]);
    setSearchUserInput("");
  };

  const handleRemoveUser = (id: string) => {
    const updatedProjects = ChoosedMemberProjects.filter(
      (project) => project.id !== id
    );
    setChoosedMemberProjects(updatedProjects);
    setDataUsers([]);
    setSearchUserInput("");
  };

  const handleResetUsers = () => {
    setDataUsers([]);
    setSearchUserInput("");
    setChoosedMemberProjects(MemberProjects);
    setPayloadUpdate(null);
  };

  const handleSaveDataUser = async () => {
    if (data) {
      if (ChoosedMemberProjects.length <= 0) {
        showToast({
          description: "Member project cannot be empty",
          statusToast: "error",
        });
        return;
      }
      const dataUserIds: string[] = ChoosedMemberProjects.map((project) =>
        project.id.toString()
      );

      setPayloadUpdate({
        projectId: data.id,
        dataUserId: dataUserIds,
      });

      await SaveUpdateUserProject({
        projectId: data.id,
        dataUserId: dataUserIds,
      });
    }
  };

  const GetDataUser = async (searchValue: string) => {
    const PayloadList: PaggingListPayload = {
      search: searchValue,
      limit: 5,
      page: 0,
      filterWhere: [],
      fieldOrder: ["userFirstName"],
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

  const SaveUpdateUserProject = async (data: ProjectUpdatePICPayload) => {
    const requestData = await UpdatePIC(data, tokenData);
    const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !requestData) {
      showToast({
        description: requestData?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      return;
    } else {
      showToast({
        description: requestData?.message || "Data saved successfully",
        statusToast: "success",
      });
      refreshActionMain();
      ModalForm.onClose();
    }
  };

  return (
    <>
      {data ? (
        <VStack w={"full"} spacing={4} align="stretch">
          {/* Modern Analytics Cards */}
          <SimpleGrid columns={1} spacing={3}>
            {/* Task Overview Card */}
            <Card bg="blue.50" border="1px" borderColor="blue.200" size="sm">
              <CardBody p={4}>
                <HStack spacing={3}>
                  <Box
                    bg="blue.500"
                    color="white"
                    p={2}
                    rounded="lg"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <FiTarget size={20} />
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Total Tasks
                    </Text>
                    <Text fontSize="xl" fontWeight="bold" color="blue.600">
                      {TaskCountProject.all}
                    </Text>
                    <HStack spacing={3} mt={1}>
                      <Text fontSize="xs" color="green.600">
                        ✓ {TaskCountProject.done}
                      </Text>
                      <Text fontSize="xs" color="orange.600">
                        ⏳ {TaskCountProject.inProgress}
                      </Text>
                    </HStack>
                  </Box>
                </HStack>
              </CardBody>
            </Card>

            {/* Team Members Card */}
            <Card bg="green.50" border="1px" borderColor="green.200" size="sm">
              <CardBody p={4}>
                <HStack spacing={3}>
                  <Box
                    bg="green.500"
                    color="white"
                    p={2}
                    rounded="lg"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <FiUsers size={20} />
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="sm" color="gray.600" fontWeight="medium">
                      Team Members
                    </Text>
                    <Text fontSize="xl" fontWeight="bold" color="green.600">
                      {data.userAssignment?.length || 0}
                    </Text>
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Active contributors
                    </Text>
                  </Box>
                </HStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Original Application Section - Enhanced */}
          <Card>
            <CardHeader pb={2}>
              <HStack justify="space-between">
                <Heading size="sm">Application</Heading>
                <Tooltip label="Application Settings" placement="top">
                  <IconButton
                    icon={<FiSettings />}
                    size="sm"
                    variant="ghost"
                    aria-label="Settings"
                    _hover={{ color: "blue.500" }}
                  />
                </Tooltip>
              </HStack>
            </CardHeader>
            <CardBody pt={0}>
              {data.appsProject && (
                <HStack spacing={3}>
                  <Box
                    bgGradient="linear(to-br, blue.500, purple.600)"
                    color="white"
                    p={2}
                    rounded="lg"
                    minW="50px"
                    h="50px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="sm"
                    fontWeight="bold"
                    textAlign="center"
                    shadow="md"
                  >
                    {data.appsProject?.appShortName}
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="md" fontWeight="semibold" color="gray.800">
                      {data.appsProject?.appName}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {data.appsProject?.appCode}
                    </Text>
                    <Badge
                      colorScheme={
                        data.appsProject?.appsStatus === "ACTIVE"
                          ? "green"
                          : "gray"
                      }
                      mt={1}
                      fontSize="xs"
                    >
                      {data.appsProject?.appsStatus}
                    </Badge>
                  </Box>
                </HStack>
              )}
            </CardBody>
          </Card>

          <Divider />

          <Flex as={Stack} spacing={1}>
            <Text fontSize={"small"} fontWeight={500}>
              Project Member ({MemberProjects.length})
            </Text>

            <Flex w={"full"} as={HStack} justifyContent={"space-between"}>
              {MemberProjects.length > 0 ? (
                <AvatarGroup size={"sm"} max={3}>
                  {MemberProjects.map((dt, index) => (
                    <Avatar name={`${dt.nama}`} key={index} />
                  ))}
                </AvatarGroup>
              ) : (
                <>
                  <TextStatusProps statusData={"No member yet"} />
                </>
              )}

              <Tooltip label={"Info Member"} placement="right-end" hasArrow>
                <Button
                  size={"sm"}
                  colorScheme={"gray"}
                  rounded={"full"}
                  onClick={() => handleAddNew()}
                >
                  <FiInfo />
                </Button>
              </Tooltip>
            </Flex>
          </Flex>

          <Flex as={Stack} spacing={1}>
            <Text fontSize={"small"} fontWeight={500}>
              Project Health
            </Text>
            {/* <TextStatusProps statusData={"Feature not ready yet"} /> */}
            <Text fontSize={"x-large"} fontWeight={600}>
              {getProjectHealthRating(data.projectStatusPercentage)}
            </Text>
          </Flex>

          <Flex as={Stack} spacing={1}>
            <Text fontSize={"small"} fontWeight={500}>
              Status
            </Text>
            <Text fontSize={"medium"} fontWeight={600}>
              {data.projectStatus}
            </Text>
          </Flex>

          <Flex as={Stack} spacing={1}>
            <Text fontSize={"small"} fontWeight={500}>
              Progression
            </Text>
            <Text fontSize={"medium"} fontWeight={600}>
              {data.projectStatusPercentage}%
            </Text>
          </Flex>

          <Flex as={Stack} spacing={1}>
            <Text fontSize={"small"} fontWeight={500}>
              Apps Deployment Status
            </Text>

            <TextStatusProps statusData={"Feature not ready yet"} />
          </Flex>

          <Divider />

          <Flex as={Stack} spacing={1}>
            <Heading as="h5" size="sm" w={"full"}>
              Overall Progression Project - ({data.projectStatusPercentage}%)
            </Heading>

            <Progress
              colorScheme={"yellow"}
              hasStripe
              // value={data.projectStatusPercentage}
              value={60}
              rounded={radiusStyle}
              my={3}
            />
          </Flex>
        </VStack>
      ) : (
        <Flex w={"full"} justifyContent={"center"}>
          <Text pt={5}>Data cannot loaded</Text>
        </Flex>
      )}
      {/* MODAL */}
      <Modal
        size={"xl"}
        isOpen={ModalForm.isOpen}
        isCentered
        onClose={ModalForm.onClose}
        closeOnOverlayClick={false}
        scrollBehavior={"inside"}
      >
        <ModalOverlay bg="blackAlpha.300" />
        <ModalContent
          rounded={radiusStyle}
          m={2}
          // bg={colorMode == "light" ? "white" : "gray.900"}

          boxShadow={"md"}
          bgGradient={"linear(to-br, secondary.500, secondary.800)"}
          color={"white"}
        >
          <ModalHeader>
            Project Member ({ChoosedMemberProjects.length})
          </ModalHeader>
          {/* <ModalCloseButton /> */}
          <ModalBody w={"full"}>
            <Grid templateColumns="repeat(12, 1fr)" gap={5} pb={5}>
              <GridItem
                colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }}
                display={"none"}
              >
                <Flex as={Stack} w={"full"} pt={4}>
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
                        />
                      </Stack>
                    </InputLayoutFull>
                  </FormControl>

                  <Flex
                    as={Stack}
                    w={"full"}
                    p={2}
                    spacing={3}
                    overflowX={"auto"}
                    h={"50vh"}
                  >
                    {DataUsers.length <= 0 && (
                      <Flex w={"full"} justifyContent={"center"}>
                        <Text pt={5}>Input text to search users</Text>
                      </Flex>
                    )}
                    {DataUsers.map((dt, index) => {
                      const availableData = ChoosedMemberProjects.find(
                        (x) => x.id === dt.id
                      );
                      return (
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
                              <Text color={"gray.900"} fontWeight={600}>
                                {dt.nama} ({dt.userId})
                              </Text>
                              <Text
                                fontWeight={500}
                                fontSize={"small"}
                                color={"gray.700"}
                              >
                                {dt.team?.teamName}
                              </Text>
                            </Stack>
                          </Box>
                          <Spacer />
                          <>
                            <Button
                              rounded={radiusStyle}
                              colorScheme={"green"}
                              size={"sm"}
                              isDisabled={availableData != null}
                              onClick={() => handleAddUser(dt)}
                            >
                              <FiPlusCircle />
                            </Button>
                          </>
                        </Flex>
                      );
                    })}
                  </Flex>
                  <Box overflowY={"auto"}>
                    {/* <pre>{JSON.stringify(MemberProjects, null, 2)}</pre> */}
                    {/* <pre>{JSON.stringify(PayloadUpdate, null, 2)}</pre> */}
                  </Box>
                </Flex>
              </GridItem>
              <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 12 }}>
                <Flex
                  as={Stack}
                  w={"full"}
                  p={2}
                  spacing={3}
                  overflowX={"auto"}
                  h={"50vh"}
                >
                  {ChoosedMemberProjects.length <= 0 && (
                    <Flex w={"full"} justifyContent={"center"}>
                      <Text pt={5}>Data empty</Text>
                    </Flex>
                  )}
                  {ChoosedMemberProjects.map((dt, index) => {
                    return (
                      <Flex
                        bg={colorMode == "light" ? "gray.100" : "gray.700"}
                        w={"full"}
                        py={4}
                        px={5}
                        rounded={radiusStyle}
                        boxShadow={"md"}
                        as={HStack}
                        spacing={5}
                        key={index}
                      >
                        <Box>
                          <Avatar name={dt.nama} src="" />
                        </Box>
                        <Box>
                          <Stack spacing={0}>
                            <Text color={"gray.900"} fontWeight={600}>
                              {dt.nama} ({dt.userId})
                            </Text>
                            <Text
                              fontWeight={500}
                              fontSize={"small"}
                              color={"secondary.700"}
                            >
                              {dt.team?.teamName}
                            </Text>
                          </Stack>
                        </Box>
                        <Spacer />
                        {/* <>
                              <Tooltip
                                label={"Remove"}
                                placement="right-end"
                                hasArrow
                              >
                                <Button
                                  colorScheme={"red"}
                                  rounded={radiusStyle}
                                  size={"sm"}
                                  onClick={() => handleRemoveUser(dt.id)}
                                >
                                  <FiMinusCircle />
                                </Button>
                              </Tooltip>
                            </> */}
                      </Flex>
                    );
                  })}
                </Flex>
                <Box overflowY={"auto"}>
                  {/* <pre>{JSON.stringify(MemberProjects, null, 2)}</pre> */}
                  {/* <pre>{JSON.stringify(ChoosedMemberProjects, null, 2)}</pre> */}
                </Box>
              </GridItem>
            </Grid>
          </ModalBody>
          <ModalFooter>
            <Flex w={"full"} justifyContent={"end"} as={HStack}>
              <Button
                size={"md"}
                leftIcon={<FiX />}
                onClick={() => ModalForm.onClose()}
                isLoading={ActionLoading}
              >
                Close
              </Button>
              {/* <Button
                size={"md"}
                leftIcon={<FiRefreshCcw />}
                onClick={() => handleResetUsers()}
                isLoading={ActionLoading}
              >
                Reset
              </Button> */}
              {/* <Button
                size={"md"}
                colorScheme={"green"}
                leftIcon={<FiSave />}
                onClick={() => handleSaveDataUser()}
                isLoading={ActionLoading}
              >
                Save
              </Button> */}
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProjectSummary;
