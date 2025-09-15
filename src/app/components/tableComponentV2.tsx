"use client";

import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  Heading,
  IconButton,
  Input,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Stack,
  StackDivider,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useColorMode,
  Select as SelectC,
} from "@chakra-ui/react";
import { flexRender } from "@tanstack/react-table";
import {
  BsChevronBarLeft,
  BsChevronBarRight,
  BsChevronLeft,
  BsChevronRight,
} from "react-icons/bs";
import { radiusStyle } from "../constants/applicationConstants";
import { ColumnMetaCustom, ListSearchByParamProps } from "../types/masterTypes";
import { useEffect, useMemo, useState } from "react";
import { Formik, FormikState } from "formik";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiFilter,
} from "react-icons/fi";
import { Select } from "chakra-react-select";

export function ControlTableCTX({ table }: any) {
  const pageCount = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex + 1;
  const [pageInput, setPageInput] = useState("");

  useEffect(() => {
    setPageInput(String(currentPage)); // sync input with current page
  }, [currentPage]);

  // Create array for page numbers
  const visiblePages = Array.from(
    { length: Math.min(5, pageCount) },
    (_, i) => i + 1
  ); // Show first 5 pages for now
  return (
    <Flex
      minWidth="max-content"
      w={"full"}
      justifyContent="center"
      gap="2"
      my={4}
    >
      <Grid templateColumns="repeat(12, 1fr)" gap={2} w={"full"}>
        <GridItem colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }}>
          <Flex
            gap="2"
            w={"full"}
            h={"full"}
            alignItems={"center"}
            justifyContent={{
              base: "center",
              sm: "center",
              md: "start",
              lg: "start",
            }}
          >
            <ButtonGroup
              size="sm"
              w={{ base: "full", sm: "full", md: "auto", lg: "auto" }}
              isAttached={false}
              variant={"ghost"}
              colorScheme={"secondary"}
            >
              <Button
                onClick={() => table.setPageIndex(0)}
                isDisabled={!table.getCanPreviousPage()}
                minW="40px"
                w={{ base: "full", sm: "full", md: "auto", lg: "auto" }}
              >
                <FiChevronsLeft />{" "}
                <Text
                  as={"span"}
                  pl={1}
                  display={{ base: "none", sm: "none", md: "none", lg: "flex" }}
                >
                  First
                </Text>
              </Button>
              <Button
                onClick={() => table.previousPage()}
                isDisabled={!table.getCanPreviousPage()}
                minW="40px"
                w={{ base: "full", sm: "full", md: "auto", lg: "auto" }}
              >
                <FiChevronLeft />
                <Text
                  as={"span"}
                  pl={1}
                  display={{ base: "none", sm: "none", md: "none", lg: "flex" }}
                >
                  Previous
                </Text>
              </Button>
              {/* Page numbers */}
              {visiblePages.map((page) => (
                <Button
                  key={page}
                  onClick={() => table.setPageIndex(page - 1)}
                  isActive={currentPage === page}
                  minW="35px"
                  _active={{
                    bg: "secondary.500",
                    color: "white",
                  }}
                  display={{
                    base: "none",
                    sm: "none",
                    md: "none",
                    lg: "block",
                  }}
                  rounded={"md"}
                >
                  {page}
                </Button>
              ))}
              {currentPage !== 1 ? (
                <Button
                  minW="35px"
                  display={{
                    base: "none",
                    sm: "none",
                    md: "none",
                    lg: "block",
                  }}
                >
                  ...
                </Button>
              ) : (
                ""
              )}
              {currentPage !== 1 && (
                <Button
                  onClick={() => table.setPageIndex(pageCount - 1)}
                  minW="35px"
                  display={{
                    base: "none",
                    sm: "none",
                    md: "none",
                    lg: "block",
                  }}
                >
                  {pageCount}
                </Button>
              )}
              <Button
                onClick={() => table.nextPage()}
                isDisabled={!table.getCanNextPage()}
                minW="40px"
                w={{ base: "full", sm: "full", md: "auto", lg: "auto" }}
              >
                <Text
                  as={"span"}
                  pr={1}
                  display={{ base: "none", sm: "none", md: "none", lg: "flex" }}
                >
                  Next
                </Text>
                <FiChevronRight />
              </Button>
              <Button
                onClick={() => table.setPageIndex(pageCount - 1)}
                isDisabled={!table.getCanNextPage()}
                minW="40px"
                w={{ base: "full", sm: "full", md: "auto", lg: "auto" }}
              >
                <Text
                  as={"span"}
                  pr={1}
                  display={{ base: "none", sm: "none", md: "none", lg: "flex" }}
                >
                  Last
                </Text>
                <FiChevronsRight />
              </Button>
            </ButtonGroup>
          </Flex>
        </GridItem>
        <GridItem colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }}>
          <HStack
            gap="2"
            w={"full"}
            h={"full"}
            alignItems={"center"}
            justifyContent={{
              base: "center",
              sm: "center",
              md: "end",
              lg: "end",
            }}
            divider={<StackDivider borderColor="gray.300" />}
            // bg={"red"}
          >
            <Flex as={HStack}>
              <Text fontWeight={600} color={"secondary.500"}>
                Page
              </Text>
              <Input
                type={"text"}
                size="sm"
                fontWeight={600}
                color={"secondary.500"}
                w={"50px"}
                rounded={"6px"}
                maxLength={3}
                value={pageInput}
                onChange={(e) => {
                  const onlyNums = e.target.value.replace(/[^0-9]/g, "");
                  setPageInput(onlyNums);
                }}
                onBlur={() => {
                  const page = Number(pageInput);
                  if (!isNaN(page) && page > 0 && page <= pageCount) {
                    table.setPageIndex(page - 1);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const page = Number(pageInput);
                    if (!isNaN(page) && page > 0 && page <= pageCount) {
                      table.setPageIndex(page - 1);
                    }
                  }
                }}
              />
            </Flex>
            <TableInputShowPageCTX table={table} />
          </HStack>
        </GridItem>
      </Grid>
    </Flex>
  );
}

export function TableInputShowPageCTX({ table }: any) {
  return (
    <Flex
      justifyContent={{
        base: "center",
        sm: "center",
        md: "flex-end",
        lg: "flex-end",
      }}
      gap="2"
      alignItems={"center"}
    >
      <Text fontWeight={600} color={"secondary.500"}>
        Show
      </Text>
      <SelectC
        size="sm"
        w={{
          base: "full",
          sm: "full",
          md: "80px",
          lg: "80px",
        }}
        // variant="flushed"
        rounded={"md"}
        textAlign={"center"}
        value={table.getState().pagination.pageSize}
        onChange={(e) => {
          table.setPageSize(Number(e.target.value));
        }}
        color={"secondary.500"}
        fontWeight={600}
      >
        {[5, 10, 20, 30, 40, 50].map((pageSize) => (
          <option key={pageSize} value={pageSize}>
            {pageSize}
          </option>
        ))}
      </SelectC>
    </Flex>
  );
}

export function TableComponentWithFilterCTXNoBorder({
  table,
  handleFilterChange,
}: any) {
  const { colorMode } = useColorMode();
  return (
    <Box w={"full"}>
      <Flex overflowX={"auto"} w={"full"}>
        <Table variant={"unstyled"} size={"sm"}>
          <Tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row: any, index: any) => {
                const startingNumber = index + 1;
                return (
                  <Tr key={row.id}>
                    {row.getVisibleCells().map((cell: any) => {
                      return (
                        <Td key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </Td>
                      );
                    })}
                  </Tr>
                );
              })
            ) : (
              <Tr>
                <Td colSpan={table.options.columns.length + 1}>
                  <Flex
                    justifyContent={"center"}
                    alignItems={"center"}
                    minH={"30vh"}
                  >
                    Belum ada data
                  </Flex>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Flex>
    </Box>
  );
}

export function TableComponentWithFilterCTX({
  table,
  handleFilterChange,
}: any) {
  const { colorMode } = useColorMode();
  return (
    <Box w={"full"}>
      <Flex
        overflowX={"auto"}
        w={"full"}
        border={"1px solid"}
        borderRadius={radiusStyle}
        borderColor={colorMode == "light" ? "gray.100" : "gray.600"}
        boxShadow={"md"}
      >
        <Table variant={"simple"} size={"sm"}>
          <Thead>
            {table.getHeaderGroups().map((headerGroup: any) => (
              <Tr
                key={headerGroup.id}
                bg={colorMode == "light" ? "secondary.50" : "gray.900"}
              >
                {headerGroup.headers.map((header: any, hidx: number) => {
                  return (
                    <Th
                      py={3}
                      key={header.id}
                      colSpan={header.colSpan}
                      color={
                        colorMode == "light" ? "secondary.800" : "secondary.500"
                      }
                    >
                      <Flex
                        w={"full"}
                        as={HStack}
                        alignItems={"center"}
                        // justifyContent={"space-between"}
                      >
                        <Heading as="h5" size="sm">
                          {header.isPlaceholder ? null : (
                            <div>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {/* <pre>
                                                        {JSON.stringify(
                                                          header.column.columnDef.meta,
                                                          null,
                                                          2
                                                        )}
                                                      </pre> */}
                            </div>
                          )}
                        </Heading>
                        <FilterColumnTable
                          key={header.column.id}
                          filedDataKey={header.column.id}
                          metaCustom={header.column.columnDef.meta}
                          onFilterSubmit={handleFilterChange}
                        />
                      </Flex>
                    </Th>
                  );
                })}
              </Tr>
            ))}
          </Thead>
          <Tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row: any, index: any) => {
                const startingNumber = index + 1;
                return (
                  <Tr key={row.id}>
                    {row.getVisibleCells().map((cell: any) => {
                      return (
                        <Td key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </Td>
                      );
                    })}
                  </Tr>
                );
              })
            ) : (
              <Tr>
                <Td colSpan={table.options.columns.length + 1}>
                  <Flex
                    justifyContent={"center"}
                    alignItems={"center"}
                    minH={"30vh"}
                  >
                    Belum ada data
                  </Flex>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Flex>
      <ControlTableCTX table={table} />
    </Box>
  );
}

export function TableComponentHeadlessCTX({ table }: any) {
  const { colorMode } = useColorMode();
  return (
    <Box w={"full"}>
      <Flex
        overflowX={"auto"}
        w={"full"}
        border={"1px solid"}
        borderRadius={radiusStyle}
        borderColor={colorMode == "light" ? "gray.100" : "gray.600"}
        boxShadow={"md"}
      >
        <Table variant={"simple"} size={"sm"}>
          <Tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row: any, index: any) => {
                const startingNumber = index + 1;
                return (
                  <Tr key={row.id}>
                    {row.getVisibleCells().map((cell: any) => {
                      return (
                        <Td key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </Td>
                      );
                    })}
                  </Tr>
                );
              })
            ) : (
              <Tr>
                <Td colSpan={table.options.columns.length + 1}>
                  <Flex
                    justifyContent={"center"}
                    alignItems={"center"}
                    minH={"30vh"}
                  >
                    Belum ada data
                  </Flex>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Flex>
      <ControlTableCTX table={table} />
    </Box>
  );
}

interface FilterColumnTableProps {
  filedDataKey: string;
  metaCustom?: ColumnMetaCustom;
  onFilterSubmit?: (filters: ListSearchByParamProps[]) => void;
}

const buildInitialFilterValues = (
  meta?: ColumnMetaCustom,
  currentFilters?: ListSearchByParamProps[]
): Record<string, string> => {
  const result: Record<string, string> = {};

  meta?.filterData?.forEach((fd) => {
    const key = `${fd.field}_${fd.operator}`;
    const existing = currentFilters?.find(
      (f) => f.field === fd.field && f.operator === fd.operator
    );
    result[key] = existing?.value ?? fd.value ?? "";
  });

  return result;
};

const FilterColumnTable = ({
  filedDataKey,
  metaCustom,
  onFilterSubmit,
}: FilterColumnTableProps) => {
  const initialValues = useMemo(
    () => buildInitialFilterValues(metaCustom),
    [metaCustom]
  );

  const [filterList, setFilterList] = useState<ListSearchByParamProps[]>([]);

  const handleSubmit = (values: Record<string, string>) => {
    const filters: ListSearchByParamProps[] =
      metaCustom?.filterData
        ?.map((fd) => {
          const key = `${fd.field}_${fd.operator}`;
          const value = values[key] ?? "";
          return {
            field: fd.field,
            operator: fd.operator,
            value,
            filterLabel: fd.filterLabel,
          };
        })
        .filter((f) => f.value?.trim() !== "") || []; // ✅ Only include non-empty values

    // console.log("filters", filters);

    setFilterList(filters);
    onFilterSubmit?.(filters);
  };

  const handleReset = (
    resetForm: (
      nextState?: Partial<FormikState<Record<string, string>>>
    ) => void
  ) => {
    resetForm();
    setFilterList([]);
    onFilterSubmit?.([]); // ✅ Clear in parent too
  };

  if (metaCustom == null) {
    return;
  } else {
    if (metaCustom) {
      if (metaCustom.isFilterable == false) {
        return;
      } else {
        return (
          <Popover id={filedDataKey}>
            <PopoverTrigger>
              <IconButton
                variant={"ghost"}
                colorScheme={"blue"}
                aria-label={filedDataKey}
                size="sm"
                icon={<FiFilter />}
              />
            </PopoverTrigger>
            <Portal>
              <PopoverContent rounded={radiusStyle}>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverBody>
                  <Flex as={Stack} w={"full"}>
                    <Text fontWeight={600}>Filter Data</Text>
                    <Divider />
                    <Formik
                      initialValues={initialValues}
                      enableReinitialize={false} // ✅ prevents resetting when props change
                      onSubmit={handleSubmit}
                    >
                      {({
                        values,
                        handleChange,
                        handleSubmit,
                        setFieldValue,
                      }) => (
                        <form onSubmit={handleSubmit}>
                          {metaCustom.filterData?.map((ft, idx) => {
                            const inputKey = `${ft.field}_${ft.operator}`;
                            if (ft.filterType === "text") {
                              return (
                                <FormControl key={idx}>
                                  <FormLabel>{ft.filterLabel} :</FormLabel>
                                  <Input
                                    id={inputKey}
                                    name={inputKey}
                                    type="text"
                                    value={values[ft.field]}
                                    onChange={handleChange}
                                  />
                                </FormControl>
                              );
                            }

                            if (ft.filterType === "date") {
                              return (
                                <FormControl key={idx}>
                                  <FormLabel>{ft.filterLabel} :</FormLabel>
                                  <Input
                                    id={inputKey}
                                    name={inputKey}
                                    type="date"
                                    value={values[ft.field]}
                                    onChange={handleChange}
                                  />
                                </FormControl>
                              );
                            }

                            if (ft.filterType === "select") {
                              return (
                                <FormControl key={idx}>
                                  <FormLabel>{ft.filterLabel} :</FormLabel>
                                  <Select
                                    id={inputKey}
                                    name={inputKey}
                                    options={ft.sourceListData}
                                    value={
                                      ft.sourceListData?.find(
                                        (option) =>
                                          option.value === values[inputKey]
                                      ) || null
                                    }
                                    onChange={(selectedOption) => {
                                      setFieldValue(
                                        inputKey,
                                        selectedOption?.value || ""
                                      );
                                    }}
                                    isSearchable={true}
                                    placeholder={"Pilih"}
                                  />
                                </FormControl>
                              );
                            }

                            return null;
                          })}

                          <Flex
                            as={HStack}
                            justifyContent={"end"}
                            w={"full"}
                            pt={2}
                          >
                            {/* <Button
                              size="sm"
                              onClick={() => handleReset(resetForm)}
                              leftIcon={<FiRefreshCcw />}
                            >
                              Reset
                            </Button> */}
                            <Button
                              type="submit"
                              size={"sm"}
                              colorScheme={"secondary"}
                              leftIcon={<FiFilter />}
                            >
                              Filter
                            </Button>
                          </Flex>
                        </form>
                      )}
                    </Formik>
                  </Flex>
                  {/* <Box
                    w={"full"}
                    overflowY={"auto"}
                    overflowX={"auto"}
                    maxH={"350px"}
                    p={2}
                    bgColor={"gray.200"}
                    fontSize={"xx-small"}
                  >
                    <pre>{JSON.stringify(filterList, null, 2)}</pre>
                  </Box> */}
                </PopoverBody>
                {/* <PopoverFooter>This is the footer</PopoverFooter> */}
              </PopoverContent>
            </Portal>
          </Popover>
        );
      }
      return;
    }
  }
};
