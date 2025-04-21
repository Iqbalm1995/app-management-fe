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
import { buildUrlPort, TextStatusProps } from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useProjects, {
  AppsResponse,
  ProjectDataResponse,
  ProjectInsertPayload,
} from "@/app/services/useProjects";
import useTeams, { TeamsResponse } from "@/app/services/useTeams";
import {
  OptionListProps,
  PaggingListPayload,
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
  FiEdit3,
  FiPlusSquare,
  FiRefreshCcw,
  FiSave,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import * as Yup from "yup";

export interface ProjectManagerSectionProps {
  data: ProjectDataResponse | null;
  refreshActionMain: () => void;
}

const DefaultAppsIcon: string = "/img/default-apps.jpg";

const ProjectManagerSection = ({
  data,
  refreshActionMain,
}: ProjectManagerSectionProps) => {
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

  const { ListApps, GetDetailAppsById, InsertProjectsApps, isLoading, error } =
    useProjects();

  const [AppsData, setAppsData] = useState<AppsResponse[]>([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);

  const [totalPages, setTotalPageData] = useState<number>(0);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  const [ActionLoading, setActionLoading] = useState(false);

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const columnsData = useMemo<ColumnDef<AppsResponse>[]>(
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
        accessorFn: (row) => row.appCode,
        id: "teamRoleCode",
        cell: (info) => (
          <Flex
            as={Wrap}
            w={"full"}
            justifyContent={"start"}
            alignItems={"center"}
          >
            <Image
              src={
                info.row.original.iconApps &&
                info.row.original.iconApps.length > 0
                  ? buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC) +
                    info.row.original.iconApps
                  : DefaultAppsIcon
              }
              rounded={radiusStyle}
              draggable={false} // Prevent image from being draggable
              w={"60px"}
              h={"60px"}
              boxShadow={"md"}
              border={"1px solid"}
              borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
            />
            <Flex as={Stack} spacing={1} pt={2}>
              <Text>
                {info.row.original.appShortName} ({info.row.original.appCode})
              </Text>
              <Text fontWeight={500} fontSize={"small"} color={"secondary.700"}>
                {info.row.original.appName}
              </Text>
            </Flex>
          </Flex>
        ),
        header: () => <span>Apps</span>,
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.appsStatus,
        id: "appsStatus",
        cell: (info) => (
          <Flex justifyContent={"start"} alignItems={"center"}>
            <Text fontSize={"md"} fontWeight={600} color={"gray.600"}>
              {info.row.original.appsStatus}
            </Text>
          </Flex>
        ),
        header: () => <span>Status</span>,
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.readyToLaunch,
        id: "readyToLaunch",
        cell: (info) => (
          <Flex justifyContent={"start"} alignItems={"center"}>
            <Text
              textAlign={"center"}
              fontSize={"md"}
              fontWeight={600}
              color={"gray.600"}
            >
              {info.row.original.readyToLaunch}
            </Text>
          </Flex>
        ),
        header: () => <span>Deploy</span>,
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.id,
        id: "id",
        cell: (info) => (
          <Flex w={"full"} as={Wrap} justifyContent={"center"}>
            <Flex
              as={Wrap}
              justifyContent={"end"}
              alignItems={"center"}
              h={"full"}
              w={"full"}
            >
              <Link
                href={`/projects-manager/detail/apps?projectId=${info.row.original.projectId}&appsId=${info.row.original.id}`}
              >
                <Button
                  size={"sm"}
                  colorScheme={"secondary"}
                  variant={"solid"}
                  rightIcon={<FiEdit />}
                >
                  Manage
                </Button>
              </Link>
            </Flex>
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
    [ActionLoading, pageIndex, pageSize]
  );

  useEffect(() => {
    if (DataAuth && DataAuth.teamMember && data) {
      const PayloadList: PaggingListPayload = {
        search: globalFilter,
        limit: pageSize,
        page: pageIndex,
        filterWhere: [
          {
            field: "projectId",
            operator: "=",
            value: data.id,
          },
        ],
        fieldOrder: ["createdAt"],
        orderDir: "desc",
      };

      setIsLoadingProcess(true);
      const GetDataList = async () => {
        const requestData = await ListApps(PayloadList, tokenData);
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

          const itemsData: AppsResponse[] = requestData.data as AppsResponse[];
          const totalData: number = requestData.countTotal as number;
          const totalPages: number =
            totalData > 0 ? Math.ceil(totalData / pageSize) : -1;
          setAppsData(itemsData);
          setTotalPageData(totalPages);
          setIsLoadingProcess(false);
        }
      };
      GetDataList();
    }
  }, [DataAuth, RefreshData, pageIndex, pageSize, globalFilter, data]);

  const RefreshAction = () => {
    setTotalPageData(0);
    setAppsData([]);
    setRefreshData(RefreshData + 1);
  };

  const table = useReactTable({
    data: AppsData,
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

  return (
    <>
      {data ? (
        <>
          <Flex as={Stack} w={"full"} spacing={2} pb={5}>
            <Grid templateColumns="repeat(2, 1fr)" gap={4} pt={5} w={"full"}>
              <GridItem
                colSpan={{ base: 2, md: 1 }}
                textAlign={{ base: "center", md: "start" }}
                alignContent={"center"}
              >
                <Text fontWeight={600}>Application Management Project</Text>
              </GridItem>
              <GridItem
                colSpan={{ base: 2, md: 1 }}
                textAlign={{ base: "center", md: "end" }}
                alignContent={"center"}
              >
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
                    // onClick={() => handleAddNew()}
                    isLoading={ActionLoading}
                  >
                    Add Apps
                  </Button>
                </Flex>
              </GridItem>
            </Grid>

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
              </Grid>
              {IsLoadingProcess ? (
                <LoadingMiniSignature />
              ) : (
                <TableComponentFull table={table} />
              )}
            </VStack>
          </Flex>
        </>
      ) : (
        <Flex w={"full"} justifyContent={"center"}>
          <Text pt={5}>Data cannot loaded</Text>
        </Flex>
      )}
    </>
  );
};

export default ProjectManagerSection;
