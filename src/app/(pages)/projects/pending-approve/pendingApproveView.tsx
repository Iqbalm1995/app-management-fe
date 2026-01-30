"use client";

import { HeaderContent } from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { TableComponentFull } from "@/app/components/tableComponents";
import {
  LINK_MENU_ROOT,
  MAX_SIZE_TABLE,
  radiusStyle,
  RES_CODE_OK,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import {
  formatDateToDDMMYYYY,
  stringToDateFormatedReverse,
} from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useProjects, { ProjectDataResponse } from "@/app/services/useProjects";
import {
  ColumnMetaCustom,
  PaggingListPayloadCustom,
} from "@/app/types/masterTypes";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  HStack,
  Stack,
  Text,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import {
  ColumnDef,
  PaginationState,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FiEye, FiCheck } from "react-icons/fi";

export default function PendingApproveView() {
  const router = useRouter();
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const { GetWaitingApproval } = useProjects();

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

  const [DataProjects, setDataProjects] = useState<ProjectDataResponse[]>([]);
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

  const columnsData = useMemo<ColumnDef<ProjectDataResponse>[]>(
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
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.projectName,
        id: "projectName",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"center"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
          >
            <Flex as={Stack} spacing={0}>
              <Text fontWeight={600}>{info.row.original.projectCode}</Text>
              <Text>{info.row.original.projectName}</Text>
            </Flex>
            {info.row.original.projectNo && (
              <Flex as={Stack} spacing={0}>
                <Text fontSize="sm" color="gray.500">
                  No: {info.row.original.projectNo}
                </Text>
              </Flex>
            )}
          </Flex>
        ),
        header: () => <span>Nama Project</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: true,
          filterData: [
            {
              field: "projectName",
              operator: "like",
              value: "",
              filterType: "text",
              filterLabel: "Nama Project",
            },
          ],
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.projectType,
        id: "projectType",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"center"}
            alignItems={"start"}
            as={Stack}
            spacing={1}
          >
            <Badge
              variant="solid"
              colorScheme={
                info.row.original.projectType === "INTERNAL_DEVELOPMENT"
                  ? "blue"
                  : info.row.original.projectType === "PROCUREMENT"
                    ? "green"
                    : "purple"
              }
              fontSize={"small"}
              rounded={radiusStyle}
              px={4}
            >
              {info.row.original.projectType}
            </Badge>
            <Badge
              variant="outline"
              colorScheme="gray"
              fontSize={"small"}
              rounded={radiusStyle}
              px={4}
            >
              {info.row.original.projectCategory}
            </Badge>
          </Flex>
        ),
        header: () => <span>Tipe</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.approvalStatus,
        id: "approvalStatus",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <Badge
              variant="solid"
              colorScheme="orange"
              fontSize={"small"}
              rounded={radiusStyle}
              px={4}
            >
              {info.row.original.approvalStatus || "PENDING"}
            </Badge>
          </Flex>
        ),
        header: () => <span>Status Approval</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorFn: (row) => row.createdAt,
        id: "createdAt",
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
              <Text>Dibuat :</Text>
              <Text fontWeight={600}>
                {info.row.original.createdAt
                  ? stringToDateFormatedReverse(info.row.original.createdAt)
                  : "-"}
              </Text>
            </Flex>
          </Flex>
        ),
        header: () => <span>Tanggal</span>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
      {
        accessorKey: "action",
        cell: (info) => (
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <VStack spacing={1} w="full">
              <Button
                size="xs"
                py={4}
                fontSize="sm"
                w="full"
                bg="purple.50"
                color="purple.700"
                _hover={{
                  bg: "purple.300",
                  transform: "translateY(-2px)",
                  boxShadow: "md",
                }}
                transition="all 0.2s"
                colorScheme="blue"
                leftIcon={<FiEye />}
                onClick={() => {
                  router.push(
                    `/projects/preview?projectId=${info.row.original.id}`
                  );
                }}
              >
                Preview
              </Button>
              <Button
                leftIcon={<FiCheck />}
                bg="green.50"
                color="green.700"
                size="xs"
                py={4}
                fontSize="sm"
                w="full"
                _hover={{
                  bg: "green.300",
                  transform: "translateY(-2px)",
                  boxShadow: "md",
                }}
                transition="all 0.2s"
                onClick={() => {
                  router.push(
                    `/projects/preview?projectId=${info.row.original.id}&approvalMode=true`
                  );
                }}
              >
                Approve
              </Button>
            </VStack>
          </Flex>
        ),
        header: () => <Flex justifyContent={"center"}>Aksi</Flex>,
        footer: (props) => props.column.id,
        meta: {
          isFilterable: false,
        } as ColumnMetaCustom,
      },
    ],
    [pageIndex, pageSize, router]
  );

  const table = useReactTable({
    data: DataProjects,
    columns: columnsData,
    pageCount: totalPages,
    state: {
      pagination,
      globalFilter,
    },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
    debugTable: false,
  });

  const GetDataList = async () => {
    setIsLoadingProcess(true);

    const PayloadList: PaggingListPayloadCustom = {
      search: globalFilter,
      limit: pageSize,
      page: pageIndex,
      projectType: "",
      requirementType: "",
      filterWhere: [],
      fieldOrder: ["createdAt"],
      orderDir: "desc",
    };

    const response = await GetWaitingApproval(PayloadList, tokenData);

    if (response) {
      if (response.statusCode === RES_CODE_OK) {
        const dataList: ProjectDataResponse[] =
          response.data as ProjectDataResponse[];
        setDataProjects(dataList);

        const totalData = response.countTotal || 0;
        const totalPage = Math.ceil(totalData / pageSize);
        setTotalPageData(totalPage);
      } else {
        showToast({
          description: response.message || "Failed to load data",
          statusToast: "error",
        });
      }
    }

    setIsLoadingProcess(false);
  };

  useEffect(() => {
    if (tokenData) {
      GetDataList();
    }
  }, [tokenData, pageIndex, pageSize, globalFilter, RefreshData]);

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName="Project Menunggu Persetujuan"
        breadCrumb={["Home", "Projects", "Pending Approval"]}
      />

      <Box p={4}>
        <Card>
          <CardHeader>
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontSize="lg" fontWeight="bold">
                Daftar Project Menunggu Persetujuan
              </Text>
            </Flex>
          </CardHeader>
          <CardBody>
            <TableComponentFull
              table={table}
              isLoading={IsLoadingProcess}
              colorMode={colorMode}
            />
          </CardBody>
        </Card>
      </Box>
    </LayoutAdmin>
  );
}
