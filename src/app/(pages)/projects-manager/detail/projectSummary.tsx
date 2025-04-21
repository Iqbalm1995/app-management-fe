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
import { TextStatusProps, truncateText } from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useProjects, {
  ProjectDataResponse,
  ProjectUpdatePICPayload,
} from "@/app/services/useProjects";
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
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  FiMinusCircle,
  FiPlusCircle,
  FiPlusSquare,
  FiRefreshCcw,
  FiSave,
  FiX,
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
  const { List: ListUsers, GetDetailById: GetUserById } = useUsers();
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  const [BoardData, setBoardData] = useState<any>(null);
  const [MemberProjects, setMemberProjects] = useState<UsersResponse[]>([]);

  const RefreshAction = () => {
    setMemberProjects([]);
    setRefreshData(RefreshData + 1);
  };

  useEffect(() => {
    if (DataAuth && DataAuth.teamMember && data) {
      setIsLoadingProcess(true);
      const GetDataList = async () => {
        const requestData = await ListPIC(data.id, tokenData);
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

          const itemsData: UsersFullResponse[] =
            requestData.data as UsersFullResponse[];

          setMemberProjects(itemsData);
          setIsLoadingProcess(false);
        }
      };
      GetDataList();
    }
  }, [DataAuth, data, RefreshData]);

  const ModalForm = useDisclosure();
  const [PayloadUpdate, setPayloadUpdate] =
    useState<ProjectUpdatePICPayload | null>(null);

  const handleAddNew = () => {
    if (DataAuth && DataAuth.teamMember && data) {
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
        <Stack w={"full"} spacing={4}>
          <Box>
            <Tooltip label={"Refresh"} placement="right-end" hasArrow>
              <Button
                size={"xs"}
                onClick={() => RefreshAction()}
                colorScheme={"gray"}
                rounded={"full"}
                leftIcon={<FiRefreshCcw />}
              >
                Refresh
              </Button>
            </Tooltip>
          </Box>
          <Flex as={Stack} spacing={1}>
            <Text fontSize={"small"} fontWeight={500}>
              Assign Member ({MemberProjects.length})
            </Text>

            <Flex w={"full"} as={HStack} justifyContent={"space-between"}>
              {MemberProjects.length > 0 ? (
                <AvatarGroup size={"sm"} max={3}>
                  {MemberProjects.map((dt, index) => (
                    <Avatar
                      name={`${dt.userFirstName} ${dt.userLastName}`}
                      key={index}
                    />
                  ))}
                </AvatarGroup>
              ) : (
                <>
                  <TextStatusProps statusData={"No member yet"} />
                </>
              )}

              <Tooltip label={"Add Member"} placement="right-end" hasArrow>
                <Button
                  size={"sm"}
                  colorScheme={"gray"}
                  rounded={"full"}
                  onClick={() => handleAddNew()}
                >
                  <FiPlusSquare />
                </Button>
              </Tooltip>
            </Flex>
          </Flex>

          <Flex as={Stack} spacing={1}>
            <Text fontSize={"small"} fontWeight={500}>
              Project Health
            </Text>
            <TextStatusProps statusData={"Feature not ready yet"} />
          </Flex>

          <Flex as={Stack} spacing={1}>
            <Text fontSize={"small"} fontWeight={500}>
              Status
            </Text>
            <TextStatusProps statusData={data.projectStatus} />
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

          <Flex
            as={HStack}
            spacing={10}
            bgGradient={"linear(to-br, secondary.500, secondary.500)"}
            py={4}
            rounded={radiusStyle}
            color={"white"}
            boxShadow={"md"}
            justifyContent={"space-between"}
            px={5}
          >
            {BoardData != null ? (
              <>
                <Flex as={Stack} spacing={1}>
                  <Text
                    fontSize={"small"}
                    fontWeight={500}
                    textAlign={"center"}
                  >
                    Task Created
                  </Text>
                  <Text fontSize={"2xl"} fontWeight={600} textAlign={"center"}>
                    112
                  </Text>
                </Flex>
                <Flex as={Stack} spacing={1}>
                  <Text
                    fontSize={"small"}
                    fontWeight={500}
                    textAlign={"center"}
                  >
                    Task OnProgress
                  </Text>
                  <Text fontSize={"2xl"} fontWeight={600} textAlign={"center"}>
                    4
                  </Text>
                </Flex>
                <Flex as={Stack} spacing={1}>
                  <Text
                    fontSize={"small"}
                    fontWeight={500}
                    textAlign={"center"}
                  >
                    Task Done
                  </Text>
                  <Text fontSize={"2xl"} fontWeight={600} textAlign={"center"}>
                    53
                  </Text>
                </Flex>
              </>
            ) : (
              <>
                <Flex
                  as={Stack}
                  justifyContent={"center"}
                  alignItems={"center"}
                  h={"55px"}
                  w={"full"}
                  spacing={1}
                >
                  <Text textAlign={"center"}>
                    This project doesn't have a board yet
                  </Text>
                </Flex>
              </>
            )}
          </Flex>
        </Stack>
      ) : (
        <Flex w={"full"} justifyContent={"center"}>
          <Text pt={5}>Data cannot loaded</Text>
        </Flex>
      )}
      <Modal
        size={"5xl"}
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
          bg={colorMode == "light" ? "white" : "gray.900"}
        >
          <ModalHeader>{"Register Member"}</ModalHeader>
          {/* <ModalCloseButton /> */}
          <ModalBody w={"full"}>
            <Grid templateColumns="repeat(12, 1fr)" gap={5} pb={5}>
              <GridItem colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }}>
                <Flex as={Stack} w={"full"} pt={4}>
                  <FormControl id="searchUser" isRequired>
                    <InputLayoutFull>
                      <FormLabel h={"full"} py={3}>
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
                            <Avatar name={dt.userFirstName} src="" />
                          </Box>
                          <Box>
                            <Stack spacing={0}>
                              <Text color={"gray.900"} fontWeight={600}>
                                {dt.userFirstName} {dt.userLastName} (
                                {dt.userCode})
                              </Text>
                              <Text
                                fontWeight={500}
                                fontSize={"small"}
                                color={"gray.700"}
                              >
                                {dt.team?.teamName} |{" "}
                                {dt.teamRole?.teamRoleName}
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
              <GridItem colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }}>
                <Card
                  rounded={radiusStyle}
                  boxShadow={"md"}
                  bgGradient={"linear(to-br, secondary.500, secondary.800)"}
                  color={"white"}
                  minH={"50vh"}
                >
                  <CardHeader pb={1} fontWeight={600}>
                    Member Setup ({ChoosedMemberProjects.length})
                  </CardHeader>
                  <CardBody>
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
                              <Avatar name={dt.userFirstName} src="" />
                            </Box>
                            <Box>
                              <Stack spacing={0}>
                                <Text color={"gray.900"} fontWeight={600}>
                                  {dt.userFirstName} {dt.userLastName} (
                                  {dt.userCode})
                                </Text>
                                <Text
                                  fontWeight={500}
                                  fontSize={"small"}
                                  color={"secondary.700"}
                                >
                                  {dt.team?.teamName} |{" "}
                                  {dt.teamRole?.teamRoleName}
                                </Text>
                              </Stack>
                            </Box>
                            <Spacer />
                            <>
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
                            </>
                          </Flex>
                        );
                      })}
                    </Flex>
                  </CardBody>
                </Card>
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
              <Button
                size={"md"}
                leftIcon={<FiRefreshCcw />}
                onClick={() => handleResetUsers()}
                isLoading={ActionLoading}
              >
                Reset
              </Button>
              <Button
                size={"md"}
                colorScheme={"green"}
                leftIcon={<FiSave />}
                onClick={() => handleSaveDataUser()}
                isLoading={ActionLoading}
              >
                Save
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProjectSummary;
