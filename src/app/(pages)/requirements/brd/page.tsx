"use client";

import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import { InputGroupPanel } from "@/app/components/customPanels";
import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import CurrencyInput from "@/app/components/inputProps/currencyInput";
import DivisionListSelected from "@/app/components/inputProps/divisionListSelected";
import DivisionListSearch from "@/app/components/inputProps/divisionSearch";
import UserSearchSelect from "@/app/components/inputProps/userSearchSelect";
import LabelMaster from "@/app/components/labelMasterProps";
import LayoutAdmin from "@/app/components/layoutAdmin";
import {
  InputLayout,
  InputLayoutFull,
} from "@/app/components/layoutContentBody";
import LoadingMiniSignature from "@/app/components/loadingMini";
import {
  TableComponentFull,
  TableComponentFullHeadless,
} from "@/app/components/tableComponents";
import {
  DELAY_MEDIUM,
  GROUP_CONST_BRD_STATUS,
  LINK_MENU_ROOT,
  MAX_SIZE_TABLE,
  NEXT_STEP_ACTION_REVIEW,
  radiusStyle,
  REQ_STATUS_ALL,
  REQ_STATUS_APPROVED,
  REQ_STATUS_CANCELED,
  REQ_STATUS_IN_PROGRESS_REVIEW,
  REQ_STATUS_NEED_REVIEW,
  REQ_STATUS_REVIEW,
  REQUIREMENT_STATUS_NEW,
  REQUIREMENT_TYPE_BRD,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import {
  formatDateToDDMMYYYY,
  formatDateToYYYYMMDD,
  getCurrentQuarter,
  getQuarterDateRange,
  stringToDateFormatedReverse,
} from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useConstants, {
  ConstantDataResponse,
} from "@/app/services/useConstants";
import useDivision, { DivisionResponse } from "@/app/services/useDivisions";
import useRequirements, {
  RequirementsInsertPayload,
  RequirementsResponse,
} from "@/app/services/useRequirements";
import useUsers, { UsersResponse } from "@/app/services/useUsers";
import {
  ListSearchByParam,
  OptionListProps,
  PaggingListPayload,
} from "@/app/types/masterTypes";
import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Badge,
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
  Heading,
  HStack,
  Select,
  Spacer,
  Stack,
  Step,
  StepDescription,
  StepIndicator,
  StepNumber,
  Stepper,
  StepSeparator,
  StepStatus,
  StepTitle,
  Switch,
  Text,
  Textarea,
  useColorMode,
  useDisclosure,
  useSteps,
  Wrap,
  WrapItem,
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
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { redirect, useParams, usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiChevronDown,
  FiChevronUp,
  FiInfo,
  FiMinusCircle,
  FiPlusCircle,
  FiPlusSquare,
  FiRefreshCcw,
  FiSave,
  FiXCircle,
} from "react-icons/fi";
import * as Yup from "yup";

const TYPE_REQ: string = REQUIREMENT_TYPE_BRD;

const HeaderDataContent: HeaderContentProps = {
  titleName: `Requirements ${TYPE_REQ}`,
  breadCrumb: ["Home", "Requirements", TYPE_REQ],
};

// Motion-enhanced version of CardBody
const MotionCardBody = motion(CardBody);

function ReuirementsBRDPage() {
  // SetUp auth data on current page
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const { List, GetDetailById, InsertReq } = useRequirements();
  const { ListConstantData } = useConstants();
  const { List: ListUsers } = useUsers();
  const { List: ListDivisions } = useDivision();

  // querter filter
  const currentYear = new Date().getFullYear();
  const currentQuarter = getCurrentQuarter();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState<number | "all">(
    currentQuarter
  );
  const [filteredMonths, setFilteredMonths] = useState<string[]>([]);

  const years = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);

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

  const RefreshAction = () => {
    setTotalPageData(0);
    setDataReq([]);
    setRefreshData(RefreshData + 1);
  };

  const columnsData = useMemo<ColumnDef<RequirementsResponse>[]>(
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
            <Flex as={Stack} spacing={0}>
              <Text fontWeight={600}>No. {info.row.original.reqNumber}</Text>
              <Text>{info.row.original.reqNarative}</Text>
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
              <Text>Inisiasi :</Text>
              <Text fontWeight={600}>
                {info.row.original.reqInititateDate
                  ? stringToDateFormatedReverse(
                      info.row.original.reqInititateDate
                    )
                  : "-"}
              </Text>
            </Flex>
            <Flex fontSize={"small"} as={Stack} spacing={0}>
              <Text>Diterima :</Text>
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
      },
      {
        accessorFn: (row) => row.assignedFromName,
        id: "assigned",
        cell: (info) => (
          <Flex w={"full"} justifyContent={"center"} as={Stack} spacing={1}>
            <Flex fontSize={"small"} as={Stack} spacing={0}>
              <Text>Ditugaskan Oleh :</Text>
              <Text fontWeight={600}>{info.row.original.assignedFromName}</Text>
            </Flex>
            <Flex fontSize={"small"} as={Stack} spacing={0}>
              <Text>Divisi Pengirim :</Text>
              <Text fontWeight={600}>
                {info.row.original.senderDivisionName}
              </Text>
            </Flex>
          </Flex>
        ),
        header: () => <span>Penugasan</span>,
        footer: (props) => props.column.id,
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
      },
      {
        accessorFn: (row) => row.id,
        id: "id",
        cell: (info) => (
          <Flex w={"full"} justifyContent={"center"}>
            <Link href={`brd/detail?reqId=${info.row.original.id}`}>
              <Button leftIcon={<FiInfo />} colorScheme="secondary" size="sm">
                Detail
              </Button>
            </Link>
          </Flex>
        ),
        header: () => "",
        footer: (props) => props.column.id,
      },
    ],
    [ActionLoading, pageIndex, pageSize, colorMode]
  );

  const [StartDateFilter, setStartDateFilter] = useState<Date>(new Date());
  const [EndDateFilter, setEndDateFilter] = useState<Date>(new Date());

  useEffect(() => {
    const { startDate, endDate } = getQuarterDateRange(
      selectedYear,
      selectedQuarter
    );
    console.log("Selected Range (ISO):", {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    setStartDateFilter(startDate);
    setEndDateFilter(endDate);

    if (DataAuth && DataAuth.team && tokenData) {
      const filterWhereData: ListSearchByParam[] = [
        {
          field: "requirementType",
          operator: "=",
          value: TYPE_REQ,
        },
        {
          field: "reqInititateDate",
          operator: ">=",
          value: startDate.toISOString(),
        },
        {
          field: "reqInititateDate",
          operator: "<=",
          value: endDate.toISOString(),
        },
      ];

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
  }, [
    DataAuth,
    RefreshData,
    pageIndex,
    pageSize,
    globalFilter,
    selectedYear,
    selectedQuarter,
  ]);

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

  // FILTER SHOW HIDE
  const [BoxFilter, setBoxFilter] = useState(false);

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
            pt={4}
          >
            <BoxStatisticNumber
              labelStd={REQ_STATUS_NEED_REVIEW}
              numberStd={2}
            />
            <BoxStatisticNumber
              labelStd={REQ_STATUS_IN_PROGRESS_REVIEW}
              numberStd={8}
            />
            <BoxStatisticNumber labelStd={REQ_STATUS_APPROVED} numberStd={1} />
            <BoxStatisticNumber labelStd={REQ_STATUS_CANCELED} numberStd={0} />
          </Flex>
        </GridItem>
        <GridItem colSpan={{ base: 12, sm: 12, md: 4, lg: 4 }} w={"full"}>
          <Flex
            as={Wrap}
            w={"full"}
            justifyContent={"end"}
            alignItems={"center"}
            pt={4}
          >
            <WrapItem alignItems={"center"}>
              <Text fontWeight={600} pr={2}>
                Filter {TYPE_REQ}
              </Text>
            </WrapItem>
            <WrapItem>
              <Select
                rounded={radiusStyle}
                value={selectedYear}
                size={"lg"}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                minW={"250px"}
                bgColor={colorMode == "light" ? "white" : "gray.800"}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
            </WrapItem>
            <WrapItem>
              <Select
                rounded={radiusStyle}
                value={selectedQuarter}
                size={"lg"}
                onChange={(e) =>
                  setSelectedQuarter(
                    e.target.value === "all" ? "all" : Number(e.target.value)
                  )
                }
                // minW={"90px"}
                // w={{ base: "full", sm: "full", md: "auto", lg: "auto" }}
                bgColor={colorMode == "light" ? "white" : "gray.800"}
              >
                <option value="all">All</option>
                <option value="1">Q1</option>
                <option value="2">Q2</option>
                <option value="3">Q3</option>
                <option value="4">Q4</option>
              </Select>
            </WrapItem>
          </Flex>
        </GridItem>
        {/* <GridItem colSpan={{ base: 12, sm: 12, md: 3, lg: 3 }} w={"full"}>
          <Flex
            as={HStack}
            h={"full"}
            w={"full"}
            justifyContent={"end"}
            alignItems={"end"}
          >
            <Button colorScheme={"gray"}>Refresh</Button>
            <Button colorScheme={"secondary"}>Create New</Button>
          </Flex>
        </GridItem> */}
        <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 12 }} w={"full"}>
          <Card w={"fill"} rounded={radiusStyle}>
            <CardHeader>
              <Heading as="h5" size="md" w={"full"}>
                Requirement Data {TYPE_REQ}
              </Heading>
            </CardHeader>
            <CardBody>
              <Flex w={"full"} as={Stack} spacing={4}>
                {/* FILTER DATA */}
                <Flex w={"full"}>
                  <Card
                    w={"full"}
                    rounded={radiusStyle}
                    bg={colorMode == "light" ? "gray.50" : "gray.900"}
                    display={"none"}
                  >
                    <CardHeader>
                      <Flex
                        w={"full"}
                        as={HStack}
                        justifyContent={"space-between"}
                      >
                        <Heading as="h5" size="sm" w={"full"}>
                          Filter Data
                        </Heading>
                        <Flex
                          as={Wrap}
                          justifyContent={"end"}
                          px={0}
                          w={"full"}
                        >
                          <Button
                            size={"sm"}
                            leftIcon={
                              BoxFilter ? <FiChevronUp /> : <FiChevronDown />
                            }
                            onClick={() => setBoxFilter(!BoxFilter)}
                          >
                            {BoxFilter ? "Hide" : "Show"}
                          </Button>
                        </Flex>
                      </Flex>
                    </CardHeader>
                    <AnimatePresence initial={false}>
                      {BoxFilter && (
                        <MotionCardBody
                          key="filter"
                          display="flex"
                          flexDirection="column"
                          overflow="hidden"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            duration: 0.3,
                            ease: [0.4, 0, 0.2, 1], // smooth cubic-bezier for accordion-like feel
                          }}
                        >
                          <Text>Coming Soon</Text>
                        </MotionCardBody>
                      )}
                    </AnimatePresence>
                  </Card>
                </Flex>
                <Grid templateColumns="repeat(2, 1fr)" gap={5} w={"full"}>
                  <GridItem
                    colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }}
                    w={"full"}
                  >
                    <Flex
                      w={"full"}
                      justifyContent={"start"}
                      alignItems={"end"}
                      as={HStack}
                      h={"full"}
                    >
                      <Text fontSize={"smaller"} fontWeight={600}>
                        Filter Tanggal :
                      </Text>
                      <Text fontSize={"smaller"}>
                        {formatDateToDDMMYYYY(StartDateFilter)}
                      </Text>
                      <Text fontSize={"smaller"} fontWeight={600}>
                        -
                      </Text>
                      <Text fontSize={"smaller"}>
                        {formatDateToDDMMYYYY(EndDateFilter)}
                      </Text>
                    </Flex>
                  </GridItem>
                  <GridItem
                    colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }}
                    w={"full"}
                  >
                    {/* BUTTON ACTION */}
                    <Flex as={Wrap} justifyContent={"end"} px={0} w={"full"}>
                      <Button
                        size={"sm"}
                        leftIcon={<FiRefreshCcw />}
                        onClick={() => RefreshAction()}
                      >
                        Muat Ulang
                      </Button>
                      <Link
                        href={`/requirements/${TYPE_REQ.toLocaleLowerCase()}/register`}
                      >
                        <Button
                          size={"sm"}
                          colorScheme={"secondary"}
                          leftIcon={<FiPlusSquare />}
                          isLoading={ActionLoading}
                        >
                          Registrasi {TYPE_REQ}
                        </Button>
                      </Link>
                    </Flex>
                  </GridItem>
                </Grid>
                {IsLoadingProcess ? (
                  <LoadingMiniSignature />
                ) : (
                  <TableComponentFull table={table} />
                )}
              </Flex>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </LayoutAdmin>
  );
}

interface BoxStatisticNumberProps {
  labelStd: string;
  numberStd: number;
}

const BoxStatisticNumber = ({
  labelStd,
  numberStd,
}: BoxStatisticNumberProps) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Flex
      w={"180px"}
      h={"50px"}
      bgGradient={"linear(to-br, secondary.500, secondary.800)"}
      _hover={{
        bgGradient: "linear(to-br, yellow.300, yellow.600)",
      }}
      rounded={radiusStyle}
      boxShadow={"md"}
      as={HStack}
      justifyContent={"space-between"}
      alignContent={"center"}
      spacing={2}
      px={5}
      py={2}
      cursor={"pointer"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      transition="transform 0.3s ease-in-out"
      transform={isHovered ? "translateY(-10px)" : "translateY(0)"}
      pos={"relative"}
      zIndex={2}
    >
      <Text fontWeight={600} color={"white"} fontSize={"small"}>
        {labelStd}
      </Text>
      <Badge
        size={"xl"}
        fontWeight={600}
        fontSize={"lg"}
        rounded={"md"}
        h={"full"}
        textAlign={"center"}
        alignContent={"center"}
        pb={1}
        px={2}
      >
        {numberStd}
      </Badge>
    </Flex>
  );
};

export default ReuirementsBRDPage;
