"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface, useAuth } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useMasterRoles, {
  MasterRolesResponse,
} from "@/app/services/useMasterRoles";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Code,
  Flex,
  Grid,
  GridItem,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Text,
  Tooltip,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
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
import { PaggingListPayload } from "@/app/types/masterTypes";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { RepeatIcon, Search2Icon } from "@chakra-ui/icons";
import useAuthData from "@/app/context/useAuthData";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { TableComponentFull } from "@/app/components/tableComponents";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Master Role System",
  breadCrumb: ["Home", "User Config", "Master Role System"],
};

function MasterRolePage() {
  const showToast = useToastHelper();
  const { isLoading, error, List, GetDetailById, GetDetailByCode } =
    useMasterRoles();
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const storedData = localStorage.getItem("authData");
  const tokenData: string = localStorage.getItem("tokenData") as string;
  useEffect(() => {
    if (DataAuth == null) {
      if (storedData) {
        const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
        const UserData: AuthDataResponse =
          StorageAuth.dataLogin as AuthDataResponse;
        setDataAuth(UserData);
      }
    }
  }, [DataAuth]);

  const [Data, setData] = useState<MasterRolesResponse[]>([]);
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

  const columnsData = useMemo<ColumnDef<MasterRolesResponse>[]>(
    () => [
      {
        accessorKey: "numbData",
        cell: (info) => (
          <Flex justifyContent={"center"}>{info.row.index + 1}.</Flex>
        ),
        header: () => <Flex justifyContent={"center"}>No.</Flex>,
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.roleCode,
        id: "roleCode",
        cell: (info) => info.getValue(),
        header: () => <span>Kode Role</span>,
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.roleName,
        id: "roleName",
        cell: (info) => info.getValue(),
        header: () => <span>Nama Role</span>,
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.roleDesc,
        id: "roleDesc",
        cell: (info) => info.getValue(),
        header: () => <span>Deskripsi</span>,
        footer: (props) => props.column.id,
      },
    ],
    []
  );

  useEffect(() => {
    const PayloadList: PaggingListPayload = {
      search: globalFilter,
      limit: pageSize,
      page: pageIndex,
      filterWhere: [],
      fieldOrder: ["roleName"],
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

        const itemsData: MasterRolesResponse[] =
          requestData.data as MasterRolesResponse[];
        const totalData: number = requestData.countTotal as number;
        const totalPages: number =
          totalData > 0 ? Math.ceil(totalData / pageSize) : -1;
        setData(itemsData);
        setTotalPageData(totalPages);
        setIsLoadingProcess(false);
      }
    };
    GetDataList();
  }, [RefreshData, pageIndex, pageSize, globalFilter]);

  const RefreshAction = () => {
    setTotalPageData(0);
    setData([]);
    setRefreshData(RefreshData + 1);
  };

  const table = useReactTable({
    data: Data,
    columns: columnsData,
    pageCount: totalPages ?? -1,
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
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />
      <VStack spacing={5} alignItems={"start"} w={"full"} pt={5}>
        <Grid templateColumns="repeat(12, 1fr)" gap={2} w={"full"}>
          <GridItem colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }}></GridItem>
          <GridItem colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }}>
            <Flex justifyContent={"end"} px={0} w={"full"}>
              <Stack
                direction={["column", "row"]}
                spacing={2}
                w={"full"}
                justifyContent={"end"}
              >
                <Tooltip
                  hasArrow
                  label={"Refresh"}
                  bg="secondary.800"
                  color="white"
                  borderRadius={"10px"}
                >
                  <Button
                    colorScheme={"gray"}
                    onClick={() => {
                      RefreshAction();
                    }}
                  >
                    <RepeatIcon />
                  </Button>
                </Tooltip>
              </Stack>
            </Flex>
          </GridItem>
          <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 12 }}>
            <Flex
              w={"full"}
              rounded={radiusStyle}
              minH={"500px"}
              bg={useColorModeValue("white", "gray.800")}
              boxShadow={"md"}
            >
              <VStack w={"full"} p={0} align={"start"} spacing={2}>
                <Grid
                  templateColumns="repeat(2, 1fr)"
                  gap={4}
                  px={5}
                  pt={5}
                  w={"full"}
                >
                  <GridItem
                    colSpan={{ base: 2, md: 2 }}
                    textAlign={{ base: "center", md: "start" }}
                    alignContent={"center"}
                  >
                    <Heading as="h5" size="sm">
                      List {HeaderDataContent.titleName}
                    </Heading>
                  </GridItem>
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
          </GridItem>
        </Grid>
      </VStack>
    </LayoutAdmin>
  );
}

export default MasterRolePage;
