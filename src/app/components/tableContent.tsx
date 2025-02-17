"use client";

import {
  Button,
  Flex,
  Heading,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { flexRender } from "@tanstack/react-table";

export function TableContent({ table }: { table: any }) {
  return (
    <Flex w={"full"} justifyContent={"space-between"}>
      <TableContainer w={"full"}>
        <Table variant="simple">
          {/* HEAD TABLE CODE */}
          <Thead>
            {table.getHeaderGroups().map((headerGroup: any, idx: number) => (
              <Tr key={idx} bg={"primary.50"}>
                {headerGroup.headers.map((header: any) => {
                  return (
                    <Th
                      key={header.id}
                      colSpan={header.colSpan}
                      color={"primary.800"}
                    >
                      <Heading as="h5" size="sm">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </Heading>
                    </Th>
                  );
                })}
              </Tr>
            ))}
          </Thead>
          {/* BODY TABLE CODE */}
          <Tbody>
            {table.getRowModel().rows.length > 0 ? (
              // loop column data
              table.getRowModel().rows.map((row: any, index: any) => {
                return (
                  <Tr key={index}>
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
              // end loop column data
              <Tr>
                <Td colSpan={table.options.columns.length + 1}>
                  <Flex
                    justifyContent={"center"}
                    alignItems={"center"}
                    minH={"10vh"}
                  >
                    Belum ada data
                  </Flex>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </Flex>
  );
}

export function TableControlContent({ table }: { table: any }) {
  return (
    <Flex w={"full"} justifyContent="space-between" pt={8} gap="2">
      <Flex gap="2" width={"full"} justifyContent={"start"}>
        <strong>{table.getState().pagination.pageIndex + 1} </strong>/{" "}
        <strong> {table.getPageCount()} </strong>
      </Flex>
      <Flex gap="2" width={"full"} justifyContent={"end"}>
        <Button
          onClick={() => table.setPageIndex(0)}
          isDisabled={!table.getCanPreviousPage()}
          size="sm"
          colorScheme="primary"
        >
          Pertama
        </Button>
        <Button
          onClick={() => table.previousPage()}
          isDisabled={!table.getCanPreviousPage()}
          size="sm"
          colorScheme="primary"
        >
          Sebelumnya
        </Button>
        <Button
          onClick={() => table.nextPage()}
          isDisabled={!table.getCanNextPage()}
          size="sm"
          colorScheme="primary"
        >
          Selanjutnya
        </Button>
        <Button
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          isDisabled={!table.getCanNextPage()}
          size="sm"
          colorScheme="primary"
        >
          Terakhir
        </Button>
      </Flex>
    </Flex>
  );
}
