"use client";

import { HorizontalFadeDivider } from "@/app/components/divider";
import { DropZoneComponent } from "@/app/components/dropzone";
import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import SidebarWithHeader from "@/app/components/sidebar";
import {
  boardDoneLabel,
  boardInProgressLabel,
  boardInReview,
  boardToDoLabel,
  MAX_SIZE_TABLE,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  TASK_BOARD_STATUS_CODE_DONE,
  TASK_BOARD_STATUS_CODE_INPROGRESS,
  TASK_BOARD_STATUS_CODE_REVIEW,
  TASK_BOARD_STATUS_CODE_TODO,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { generateUUIDV1, truncateText } from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useProjects, { ProjectDataResponse } from "@/app/services/useProjects";
import useRequirements, {
  BacklogDataResponse,
} from "@/app/services/useRequirements";
import useTasks, {
  TaskBoardViewModel,
  TaskViewModel,
} from "@/app/services/useTasks";
import { PaggingListPayload } from "@/app/types/masterTypes";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Stack,
  StackDivider,
  Text,
  Textarea,
  useColorMode,
  useDisclosure,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { setIn } from "formik";
import { u } from "framer-motion/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCheckCircle, FaCog } from "react-icons/fa";
import {
  FaCommentDots,
  FaEllipsisVertical,
  FaGripVertical,
  FaPlus,
} from "react-icons/fa6";
import { FiArrowLeft } from "react-icons/fi";
import { LuGrip } from "react-icons/lu";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Kanban",
  breadCrumb: ["Home", "Kanban"],
};

interface TaskInterface {
  id: string;
  text: string;
  taskStatus: string;
  index: number;
}

const mapTargetListToStatus = (
  list: "toDo" | "inProgress" | "inReview" | "done"
): string => {
  switch (list) {
    case "toDo":
      return TASK_BOARD_STATUS_CODE_TODO;
    case "inProgress":
      return TASK_BOARD_STATUS_CODE_INPROGRESS;
    case "inReview":
      return TASK_BOARD_STATUS_CODE_REVIEW;
    case "done":
      return TASK_BOARD_STATUS_CODE_DONE;
    default:
      return "";
  }
};

function KanbanBacklogPage() {
  const showToast = useToastHelper();
  const searchParams = useSearchParams();
  const { colorMode } = useColorMode();
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const [HeaderContentState, setHeaderContentState] =
    useState<HeaderContentProps>(HeaderDataContent);

  const { GetDetailById: GetDetailProjectById } = useProjects();
  const { GetDetailBacklogById } = useRequirements();
  const { ListTasksBoard, ListTasksBoardPaged, ListTasksPaged } = useTasks();

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

  const [projectId, setProjectId] = useState<string | null>(null);
  const [backlogId, setBacklogId] = useState<string | null>(null);
  useEffect(() => {
    // Get the 'projectId' from the search params (query string)
    const projId = searchParams.get("projectId");
    if (projId) {
      setProjectId(projId); // Set it to the state
    }

    const backId = searchParams.get("backlogId");
    if (backId) {
      setBacklogId(backId); // Set it to the state
    }
  }, [searchParams]);

  const [DataProject, setDataProject] = useState<ProjectDataResponse | null>(
    null
  );
  const [DataBacklog, setDataBacklog] = useState<BacklogDataResponse | null>(
    null
  );
  const [DataBoard, setDataBoard] = useState<TaskBoardViewModel[]>([]);
  const [DataTasks, setDataTasks] = useState<TaskViewModel[]>([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  const [isHovered, setIsHovered] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isLoading, setisLoading] = useState<boolean>(false);

  useEffect(() => {
    if (DataAuth && DataAuth.team && projectId && backlogId) {
      setIsLoadingProcess(true);
      const GetDetailProject = async () => {
        const requestData = await GetDetailProjectById(projectId, tokenData);
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

          const itemsData: ProjectDataResponse =
            requestData.data as ProjectDataResponse;

          setDataProject(itemsData);
          // setHeaderContentState({
          //   titleName: `Project Detail #${itemsData.projectCode}`,
          //   breadCrumb: ["Home", "Project Manager", itemsData.projectCode],
          // });
          setIsLoadingProcess(false);
        }
      };
      const GetDetailBacklog = async () => {
        const requestData = await GetDetailBacklogById(backlogId, tokenData);
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

          const itemsData: BacklogDataResponse =
            requestData.data as BacklogDataResponse;

          setDataBacklog(itemsData);
          // setHeaderContentState({
          //   titleName: `Project Detail #${itemsData.projectCode}`,
          //   breadCrumb: ["Home", "Project Manager", itemsData.projectCode],
          // });
          setIsLoadingProcess(false);
        }
      };
      const GetListTaskKanban = async () => {
        const requestTaskBoard = await ListTasksBoard(backlogId, tokenData);
        const isErrorResponse = requestTaskBoard?.statusCode !== RES_CODE_OK;

        if (isErrorResponse || !requestTaskBoard) {
          showToast({
            description: requestTaskBoard?.message || RES_GENERIC_ERROR_MSG,
            statusToast: "error",
          });
          setIsLoadingProcess(false);
          return;
        } else {
          console.log(requestTaskBoard);
          if (requestTaskBoard.data == null) {
            showToast({
              description: "Data return error",
              statusToast: "error",
            });
            setIsLoadingProcess(false);
            return;
          }

          const itemsData: TaskBoardViewModel[] =
            requestTaskBoard.data as TaskBoardViewModel[];

          setDataBoard(itemsData);

          // setHeaderContentState({
          //   titleName: `Project Detail #${itemsData.projectCode}`,
          //   breadCrumb: ["Home", "Project Manager", itemsData.projectCode],
          // });

          setIsLoadingProcess(false);
        }
      };
      const GetListTasks = async () => {
        // LOAD BACKLOGS DATA
        const PayloadGetTaskList: PaggingListPayload = {
          search: "",
          limit: MAX_SIZE_TABLE,
          page: 0,
          filterWhere: [
            {
              field: "backlogId",
              operator: "=",
              value: backlogId,
            },
          ],
          fieldOrder: ["indexTask"],
          orderDir: "asc",
        };
        const requestTaskBoard = await ListTasksPaged(
          PayloadGetTaskList,
          tokenData
        );
        const isErrorResponse = requestTaskBoard?.statusCode !== RES_CODE_OK;

        if (isErrorResponse || !requestTaskBoard) {
          showToast({
            description: requestTaskBoard?.message || RES_GENERIC_ERROR_MSG,
            statusToast: "error",
          });
          setIsLoadingProcess(false);
          return;
        } else {
          console.log(requestTaskBoard);
          if (requestTaskBoard.data == null) {
            showToast({
              description: "Data return error",
              statusToast: "error",
            });
            setIsLoadingProcess(false);
            return;
          }

          const itemsData: TaskViewModel[] =
            requestTaskBoard.data as TaskViewModel[];

          setDataTasks(itemsData);

          // setHeaderContentState({
          //   titleName: `Project Detail #${itemsData.projectCode}`,
          //   breadCrumb: ["Home", "Project Manager", itemsData.projectCode],
          // });

          setIsLoadingProcess(false);
        }
      };
      GetDetailProject();
      GetDetailBacklog();
      GetListTaskKanban();
      GetListTasks();
    }
  }, [DataAuth, RefreshData, projectId, backlogId]);

  useEffect(() => {
    setisLoading(true);
    delay(1000);

    setisLoading(false);
  }, [RefreshData]);

  const RefreshAction = () => {
    setRefreshData(RefreshData + 1);
  };

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      <Grid templateColumns="repeat(12, 1fr)" gap={5} w={"full"}>
        <GridItem colSpan={{ base: 12, sm: 12, md: 8, lg: 8 }} w={"full"}>
          <Flex
            w={"full"}
            as={Wrap}
            spacing={2}
            overflowX={"auto"}
            justifyContent={"start"}
          >
            <Link href={`/projects-manager/`}>
              <Button size={"lg"} leftIcon={<FiArrowLeft />}>
                Kembali
              </Button>
            </Link>
          </Flex>
        </GridItem>

        <GridItem colSpan={{ base: 12, sm: 12, md: 4, lg: 4 }} w={"full"}>
          <Flex
            as={Stack}
            w={"full"}
            justifyContent={"end"}
            alignItems={"center"}
            spacing={0}
          >
            <Text>Project Id : {projectId}</Text>
            <Text>Backlog Id : {backlogId}</Text>
          </Flex>
        </GridItem>
      </Grid>

      <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 12 }} w={"full"}>
        <Flex
          as={HStack}
          spacing={5}
          w={"full"}
          justifyContent={"start"}
          // bg={"red"}
        >
          {DataBoard.length > 0
            ? DataBoard.map((t, idx) => (
                <Flex
                  key={idx}
                  as={Stack}
                  direction="column"
                  spacing={4}
                  width={"320px"}
                  bg={"white"}
                  rounded={radiusStyle}
                  boxShadow={"md"}
                  p={5}
                  // w={{ base: "full", sm: "full", md: "320px", lg: "320px" }}
                  // minH={"75vh"}
                  // onDragOver={handleDragOver}
                  // onDrop={(e) => handleDrop("toDo", e)}
                  // onDragLeave={handleDragLeave}
                  transition="all 0.3s ease"
                  border={isHovered ? "2px dashed blue" : "none"}
                >
                  <Heading size="md">{t.boardName}</Heading>

                  {/* <Flex
                    w={"full"}
                    h={"50vh"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    display={isLoading ? "flex" : "none"}
                  >
                    <Spinner />
                  </Flex> */}
                </Flex>
              ))
            : "NO BOARD"}
        </Flex>
      </GridItem>

      {/* <Grid templateColumns="repeat(4, 1fr)" gap={5} w={"full"}>
        <GridItem colSpan={{ base: 4, sm: 4, md: 1, lg: 1 }}>
          <Box
            w={"full"}
            h={"350px"}
            borderRadius={"3xl"}
            bg={"gray.300"}
            overflowY={"auto"}
            fontSize={"x-small"}
          >
            <pre>{JSON.stringify(TaskData, null, 2)}</pre>
          </Box>
        </GridItem>
        <GridItem colSpan={{ base: 4, sm: 4, md: 1, lg: 1 }}>
          <Box
            w={"full"}
            h={"350px"}
            borderRadius={"3xl"}
            bg={"gray.300"}
            overflowY={"auto"}
            fontSize={"x-small"}
          >
            <pre>{JSON.stringify(changedTask, null, 2)}</pre>
          </Box>
        </GridItem>
      </Grid> */}
    </LayoutAdmin>
  );
}

export default KanbanBacklogPage;
