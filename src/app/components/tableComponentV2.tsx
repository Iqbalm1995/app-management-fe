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

export function TableComponentWithFilter({ table }: any) {
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
