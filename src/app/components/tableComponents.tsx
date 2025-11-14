"use client";

import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Flex,
  Grid,
  GridItem,
  HStack,
  Heading,
  Input,
  Select,
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
} from "@chakra-ui/react";
import { flexRender } from "@tanstack/react-table";
import {
  BsChevronBarLeft,
  BsChevronBarRight,
  BsChevronLeft,
  BsChevronRight,
} from "react-icons/bs";
import { radiusStyle } from "../constants/applicationConstants";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";
import { useEffect, useState } from "react";

export function ControlTableNum({ table }: any) {
  const pageCount = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex + 1;

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
          <HStack
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
            divider={<StackDivider borderColor="gray.300" />}
            // bg={"red"}
          >
            <TableInputShowPage table={table} />
            <>
              <Text fontWeight={600}>Halaman </Text>
              <Text> {table.getState().pagination.pageIndex + 1} </Text>/{" "}
              <Text> {table.getPageCount()} </Text>
            </>
          </HStack>
        </GridItem>
        <GridItem colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }}>
          <Flex
            gap="2"
            w={"full"}
            h={"full"}
            alignItems={"center"}
            justifyContent={"end"}
          >
            <ButtonGroup
              size="sm"
              w={{ base: "full", sm: "full", md: "auto", lg: "auto" }}
              isAttached
              variant="outline"
              colorScheme={"gray"}
            >
              <Button
                onClick={() => table.setPageIndex(0)}
                isDisabled={!table.getCanPreviousPage()}
                minW="60px"
              >
                Pertama
              </Button>
              <Button
                onClick={() => table.previousPage()}
                isDisabled={!table.getCanPreviousPage()}
                minW="60px"
              >
                <BsChevronLeft />
              </Button>
              {/* Page numbers */}
              {visiblePages.map((page) => (
                <Button
                  key={page}
                  onClick={() => table.setPageIndex(page - 1)}
                  isActive={currentPage === page}
                  minW="40px"
                >
                  {page}
                </Button>
              ))}
              {currentPage !== 1 ? <Button minW="40px">...</Button> : ""}
              {currentPage !== 1 && (
                <Button
                  onClick={() => table.setPageIndex(pageCount - 1)}
                  minW="40px"
                >
                  {pageCount}
                </Button>
              )}
              <Button
                onClick={() => table.nextPage()}
                isDisabled={!table.getCanNextPage()}
                minW="60px"
              >
                <BsChevronRight />
              </Button>
              <Button
                onClick={() => table.setPageIndex(pageCount - 1)}
                isDisabled={!table.getCanNextPage()}
                minW="60px"
              >
                Terakhir
              </Button>
            </ButtonGroup>
          </Flex>
        </GridItem>
      </Grid>
    </Flex>
  );
}

export function ControlTable({ table }: any) {
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
    <Box w="full" overflowX="auto">
      <Flex
        minWidth="max-content"
        w={"full"}
        justifyContent="center"
        gap="2"
        my={4}
      >
        <Grid templateColumns="repeat(12, 1fr)" gap={2} w={"full"} minW="600px">
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
                  Prev
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
            <TableInputShowPage table={table} />
          </HStack>
        </GridItem>
      </Grid>
    </Flex>
    </Box>
  );
}

export function ControlTableLite({ table }: any) {
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
                <FiChevronsLeft />
              </Button>
              <Button
                onClick={() => table.previousPage()}
                isDisabled={!table.getCanPreviousPage()}
                minW="40px"
                w={{ base: "full", sm: "full", md: "auto", lg: "auto" }}
              >
                <FiChevronLeft />
              </Button>

              <Button
                onClick={() => table.nextPage()}
                isDisabled={!table.getCanNextPage()}
                minW="40px"
                w={{ base: "full", sm: "full", md: "auto", lg: "auto" }}
              >
                <FiChevronRight />
              </Button>
              <Button
                onClick={() => table.setPageIndex(pageCount - 1)}
                isDisabled={!table.getCanNextPage()}
                minW="40px"
                w={{ base: "full", sm: "full", md: "auto", lg: "auto" }}
              >
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
                Halaman
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
            <TableInputShowPage table={table} />
          </HStack>
        </GridItem>
      </Grid>
    </Flex>
  );
}

export function ControlTableAlternate1({ table }: any) {
  const pageCount = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex + 1;

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
      <Flex as={Stack} gap="2" w={"full"} h={"full"}>
        <Flex
          gap="2"
          w={"full"}
          h={"full"}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <ButtonGroup
            size="sm"
            w={{ base: "full", sm: "full", md: "auto", lg: "auto" }}
            isAttached
            variant="outline"
            colorScheme={"gray"}
          >
            <Button
              onClick={() => table.setPageIndex(0)}
              isDisabled={!table.getCanPreviousPage()}
              minW="40px"
              w={{ base: "full", sm: "full", md: "auto", lg: "auto" }}
            >
              <BsChevronBarLeft />
            </Button>
            <Button
              onClick={() => table.previousPage()}
              isDisabled={!table.getCanPreviousPage()}
              minW="40px"
              w={{ base: "full", sm: "full", md: "auto", lg: "auto" }}
            >
              <BsChevronLeft />
            </Button>
            {/* Page numbers */}
            {visiblePages.map((page) => (
              <Button
                key={page}
                onClick={() => table.setPageIndex(page - 1)}
                isActive={currentPage === page}
                minW="35px"
                display={{
                  base: "none",
                  sm: "none",
                  md: "block",
                  lg: "block",
                }}
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
                  md: "block",
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
                  md: "block",
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
              <BsChevronRight />
            </Button>
            <Button
              onClick={() => table.setPageIndex(pageCount - 1)}
              isDisabled={!table.getCanNextPage()}
              minW="40px"
              w={{ base: "full", sm: "full", md: "auto", lg: "auto" }}
            >
              <BsChevronBarRight />
            </Button>
          </ButtonGroup>
        </Flex>

        <Flex justifyContent={"center"} gap="2" alignItems={"center"}>
          <Text>Show</Text>
          <Select
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
          >
            {[5, 10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </Select>
        </Flex>
      </Flex>
    </Flex>
  );
}

export function TableInputShowPage({ table }: any) {
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
      <Select
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
      </Select>
    </Flex>
  );
}

export function ControlTableSM({ table }: any) {
  return (
    <div style={{ overflowX: "auto" }}>
      <Flex minWidth="max-content" justifyContent="end" gap="2" my="3%">
        <Grid templateColumns="repeat(5, 1fr)" gap={2}>
          <GridItem colSpan={{ base: 5, sm: 5, md: 5, lg: 1 }}>
            <Button
              leftIcon={<BsChevronBarLeft />}
              onClick={() => table.setPageIndex(0)}
              isDisabled={!table.getCanPreviousPage()}
              size="sm"
              colorScheme="bjb_color_theme"
              width={"full"}
            ></Button>
          </GridItem>
          <GridItem colSpan={{ base: 5, sm: 5, md: 5, lg: 1 }}>
            <Button
              leftIcon={<BsChevronLeft />}
              onClick={() => table.previousPage()}
              isDisabled={!table.getCanPreviousPage()}
              size="sm"
              colorScheme="bjb_color_theme"
              width={"full"}
            ></Button>
          </GridItem>
          <GridItem colSpan={{ base: 5, sm: 5, md: 5, lg: 1 }}>
            <Flex gap="2" ml="15px" mr="15px" width={"full"}>
              <strong>{table.getState().pagination.pageIndex + 1} </strong>/{" "}
              <strong> {table.getPageCount()} </strong>
            </Flex>
          </GridItem>
          <GridItem colSpan={{ base: 5, sm: 5, md: 5, lg: 1 }}>
            <Button
              rightIcon={<BsChevronRight />}
              onClick={() => table.nextPage()}
              isDisabled={!table.getCanNextPage()}
              size="sm"
              colorScheme="bjb_color_theme"
              width={"full"}
            ></Button>
            <Button
              rightIcon={<BsChevronBarRight />}
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              isDisabled={!table.getCanNextPage()}
              size="sm"
              colorScheme="bjb_color_theme"
              width={"full"}
            ></Button>
          </GridItem>
        </Grid>
      </Flex>
    </div>
  );
}

export function TableComponent({ table }: any) {
  const { colorMode } = useColorMode();
  return (
    <Flex overflowX={"auto"}>
      <Box
        overflow={"hidden"}
        border={"1px solid"}
        borderRadius={radiusStyle}
        borderColor={colorMode == "light" ? "gray.100" : "gray.600"}
        w={"full"}
        boxShadow={"md"}
      >
        <Table
          variant={"simple"}
          // colorScheme="secondary"
          // border={"1px"}
          // borderRadius={radiusStyle}
          // borderColor={colorMode == "light" ? "gray.100" : "gray.700"}
          size={"sm"}
        >
          <Thead>
            {table.getHeaderGroups().map((headerGroup: any) => (
              <Tr
                key={headerGroup.id}
                bg={colorMode == "light" ? "secondary.50" : "gray.900"}
              >
                {headerGroup.headers.map((header: any) => {
                  return (
                    <Th
                      py={3}
                      key={header.id}
                      colSpan={header.colSpan}
                      // fontWeight={800}
                      color={
                        colorMode == "light" ? "secondary.800" : "secondary.500"
                      }
                    >
                      <Heading as="h5" size="sm">
                        {header.isPlaceholder ? null : (
                          <div>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </div>
                        )}
                      </Heading>
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
      </Box>
    </Flex>
  );
}

export function TableComponentHeadlessGrid({ table }: any) {
  return (
    <Flex w={"full"} my={4}>
      <Grid
        templateColumns="repeat(12, 1fr)"
        gap={{ base: 4, md: 6 }}
        w={"full"}
        px={{ base: 2, md: 4 }}
      >
        {table.getRowModel().rows.length > 0 ? (
          table.getRowModel().rows.map((row: any, index: any) => {
            return (
              <GridItem
                colSpan={{ base: 12, sm: 12, md: 6, lg: 4 }}
                w={"full"}
                key={row.id}
              >
                {row.getVisibleCells().map((cell: any) => {
                  return (
                    <Box key={cell.id} w={"full"}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </Box>
                  );
                })}
              </GridItem>
            );
          })
        ) : (
          <GridItem colSpan={{ base: 3, sm: 3, md: 3, lg: 3 }} w={"full"}>
            <Flex justifyContent={"center"} alignItems={"center"} minH={"30vh"}>
              Belum ada data
            </Flex>
          </GridItem>
        )}
      </Grid>
      {/* <Table
        variant={"simple"}
        // colorScheme="secondary"
        size={"sm"}
        border={0}
      >
        <Tbody border={0}>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row: any, index: any) => {
              return (
                <Tr key={row.id} border={0}>
                  {row.getVisibleCells().map((cell: any) => {
                    return (
                      <Td key={cell.id} border={0}>
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
      </Table> */}
    </Flex>
  );
}

export function TableComponentFullHeadlessGrid({ table }: any) {
  return (
    <>
      <Grid
        templateColumns="repeat(2, 1fr)"
        gap={5}
        px={3}
        // bg={"red"}
        w={"full"}
      ></Grid>
      <Box pb={8} w={"full"}>
        <TableComponentHeadlessGrid table={table} />
        <Flex w={"full"} px={5}>
          <ControlTable table={table} />
        </Flex>
      </Box>
    </>
  );
}

export function TableComponentHeadless({ table }: any) {
  return (
    <Flex overflowX={"auto"}>
      <Table
        variant={"simple"}
        // colorScheme="secondary"
        size={"sm"}
        border={0}
      >
        <Tbody border={0}>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row: any, index: any) => {
              return (
                <Tr key={row.id} border={0}>
                  {row.getVisibleCells().map((cell: any) => {
                    return (
                      <Td key={cell.id} border={0}>
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
  );
}

export function TableComponentFullHeadless({ table }: any) {
  return (
    <>
      <Grid
        templateColumns="repeat(2, 1fr)"
        gap={5}
        px={3}
        // bg={"red"}
        w={"full"}
      ></Grid>
      <Box pb={8} w={"full"}>
        <TableComponentHeadless table={table} />
        <Flex w={"full"} px={5}>
          <ControlTable table={table} />
        </Flex>
      </Box>
    </>
  );
}

export function TableComponentFullHeadlessAlternate1({ table }: any) {
  return (
    <>
      <Grid
        templateColumns="repeat(2, 1fr)"
        gap={5}
        px={3}
        // bg={"red"}
        w={"full"}
      ></Grid>
      <Box pb={8} w={"full"}>
        <TableComponentHeadless table={table} />
        <Flex w={"full"} px={5}>
          <ControlTableAlternate1 table={table} />
        </Flex>
      </Box>
    </>
  );
}

export function TableComponentFull({ table }: any) {
  return (
    <>
      <Grid
        templateColumns="repeat(2, 1fr)"
        gap={5}
        px={3}
        // bg={"red"}
        w={"full"}
      ></Grid>
      <Box pb={8} w={"full"}>
        <TableComponent table={table} />
        <Flex w={"full"} px={5}>
          <ControlTable table={table} />
        </Flex>
      </Box>
    </>
  );
}

export function TableComponentFullSm({ table }: any) {
  return (
    <>
      <Box pb={8} w={"full"}>
        <TableComponentSm table={table} />
        <Flex w={"full"} px={5} py={2}>
          <ControlTableLite table={table} />
        </Flex>
      </Box>
    </>
  );
}

export function TableComponentSm({ table }: any) {
  const { colorMode } = useColorMode();
  return (
    <Flex overflowX={"auto"}>
      <Box
        overflow={"hidden"}
        border={"1px solid"}
        borderRadius={"md"}
        borderColor={colorMode == "light" ? "gray.100" : "gray.600"}
        w={"full"}
        boxShadow={"md"}
      >
        <Table
          variant={"simple"}
          // colorScheme="secondary"
          colorScheme="gray"
          size={"sm"}
        >
          <Thead>
            {table.getHeaderGroups().map((headerGroup: any) => (
              <Tr key={headerGroup.id} bg={"secondary.50"}>
                {headerGroup.headers.map((header: any) => {
                  return (
                    <Th
                      py={2}
                      key={header.id}
                      colSpan={header.colSpan}
                      // fontWeight={800}
                      color={"secondary.800"}
                      // textAlign={"center"}
                    >
                      <Heading as="h5" size="xs">
                        {header.isPlaceholder ? null : (
                          <div>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </div>
                        )}
                      </Heading>
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
                  <Flex justifyContent={"center"} alignItems={"center"} py={4}>
                    Belum ada data
                  </Flex>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Flex>
  );
}

export function TableInputShowPageSm({ table }: any) {
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
      <Text fontWeight={600}>Show</Text>
      <Select
        size="xs"
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
      >
        {[5, 10, 20, 30, 40, 50].map((pageSize) => (
          <option key={pageSize} value={pageSize}>
            {pageSize}
          </option>
        ))}
      </Select>
    </Flex>
  );
}

export function ControlTableSmx({ table }: any) {
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
          <HStack
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
            divider={<StackDivider borderColor="gray.300" />}
            // bg={"red"}
          >
            <TableInputShowPageSm table={table} />
            <>
              <Text fontWeight={600}>Halaman </Text>
              <Text> {table.getState().pagination.pageIndex + 1} </Text>/{" "}
              <Text> {table.getPageCount()} </Text>
            </>
          </HStack>
        </GridItem>
        <GridItem colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }}>
          <Flex
            gap="2"
            w={"full"}
            h={"full"}
            alignItems={"center"}
            justifyContent={"end"}
          >
            <ButtonGroup
              size="xs"
              w={{ base: "full", sm: "full", md: "auto", lg: "auto" }}
              isAttached
              variant="outline"
            >
              <Button
                onClick={() => table.setPageIndex(0)}
                isDisabled={!table.getCanPreviousPage()}
                // colorScheme={"secondary"}
                variant={"outline"}
                width={"full"}
                minW={{ base: 0, sm: 0, md: "60px", lg: "60px" }}
              >
                <BsChevronBarLeft />
              </Button>
              <Button
                onClick={() => table.previousPage()}
                isDisabled={!table.getCanPreviousPage()}
                // colorScheme={"secondary"}
                variant={"outline"}
                width={"full"}
                minW={{ base: 0, sm: 0, md: "60px", lg: "60px" }}
              >
                <BsChevronLeft />
              </Button>
              <Button
                onClick={() => table.nextPage()}
                isDisabled={!table.getCanNextPage()}
                // colorScheme={"secondary"}
                variant={"outline"}
                width={"full"}
                minW={{ base: 0, sm: 0, md: "60px", lg: "60px" }}
              >
                <BsChevronRight />
              </Button>
              <Button
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                isDisabled={!table.getCanNextPage()}
                // colorScheme={"secondary"}
                variant={"outline"}
                width={"full"}
                minW={{ base: 0, sm: 0, md: "60px", lg: "60px" }}
              >
                <BsChevronBarRight />
              </Button>
            </ButtonGroup>
          </Flex>
        </GridItem>
      </Grid>
    </Flex>
  );
}

export function ControlTableSmx2({ table }: any) {
  const pageCount = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex + 1;

  // Create array for page numbers
  const visiblePages = Array.from(
    { length: Math.min(5, pageCount) },
    (_, i) => i + 1
  ); // Show first 5 pages for now

  return (
    <div style={{ overflowX: "auto" }}>
      <Flex
        minWidth="max-content"
        w={"full"}
        justifyContent="center"
        gap="2"
        my={4}
      >
        <Grid templateColumns="repeat(12, 1fr)" gap={2} w={"full"}>
          <GridItem colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }}>
            <HStack
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
              divider={<StackDivider borderColor="gray.300" />}
              // bg={"red"}
            >
              <TableInputShowPageSm table={table} />
              <>
                <Text fontWeight={600}>Halaman </Text>
                <Text> {table.getState().pagination.pageIndex + 1} </Text>/{" "}
                <Text> {table.getPageCount()} </Text>
              </>
            </HStack>
          </GridItem>
          <GridItem colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }}>
            <Flex
              gap="2"
              w={"full"}
              h={"full"}
              alignItems={"center"}
              justifyContent={"end"}
            >
              <ButtonGroup
                size="sm"
                w={{ base: "full", sm: "full", md: "auto", lg: "auto" }}
                isAttached
                variant="solid"
                colorScheme={"primary"}
              >
                <Button
                  onClick={() => table.setPageIndex(0)}
                  isDisabled={!table.getCanPreviousPage()}
                  minW="60px"
                >
                  Pertama
                </Button>
                <Button
                  onClick={() => table.previousPage()}
                  isDisabled={!table.getCanPreviousPage()}
                  minW="60px"
                >
                  <BsChevronLeft />
                </Button>

                {/* Page numbers */}
                {visiblePages.map((page) => (
                  <Button
                    key={page}
                    onClick={() => table.setPageIndex(page - 1)}
                    isActive={currentPage === page}
                    minW="40px"
                  >
                    {page}
                  </Button>
                ))}

                {/* Ellipsis for more pages */}
                {currentPage < pageCount - 5 && currentPage === 1 && (
                  <Button minW="40px">...</Button>
                )}
                {currentPage !== 1 && (
                  <Button
                    onClick={() => table.setPageIndex(pageCount - 1)}
                    minW="40px"
                  >
                    {pageCount}
                  </Button>
                )}

                <Button
                  onClick={() => table.nextPage()}
                  isDisabled={!table.getCanNextPage()}
                  minW="60px"
                >
                  <BsChevronRight />
                </Button>
                <Button
                  onClick={() => table.setPageIndex(pageCount - 1)}
                  isDisabled={!table.getCanNextPage()}
                  minW="60px"
                >
                  Terakhir
                </Button>
              </ButtonGroup>
            </Flex>
          </GridItem>
        </Grid>
      </Flex>
    </div>
  );
}
