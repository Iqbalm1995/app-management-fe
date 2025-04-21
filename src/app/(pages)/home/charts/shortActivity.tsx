import { convertToCustomDateFormat } from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { UserActivityResponse } from "@/app/services/useUserActivity";
import { Flex, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

export const ActvitiesShortTable = () => {
  const [data, setData] = useState<UserActivityResponse[]>([]);
  const showToast = useToastHelper();
  const [IsProcessLoadData, setIsProcessLoadData] = useState(true);
  const [totalPages, setTotalPageData] = useState<number>(0);
  const [RefreshData, setRefreshData] = useState(0);
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
  const columns = useMemo<ColumnDef<UserActivityResponse>[]>(
    () => [
      {
        accessorFn: (row) => row.userId,
        id: "userId",
        cell: (info) => (
          <Flex>{`${info.row.original.userData.userFirstName} ${info.row.original.userData.userLastName} (${info.row.original.userData.username})`}</Flex>
        ),
        header: () => <span>User ID</span>,
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.activity,
        id: "activity",
        cell: (info) => info.getValue(),
        header: () => <span>Action</span>,
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.createdAt,
        id: "createdAt",
        cell: (info) => (
          <Flex>{convertToCustomDateFormat(info.row.original.createdAt)}</Flex>
        ),
        header: () => <span>Date</span>,
        footer: (props) => props.column.id,
      },
    ],
    [pageIndex, pageSize]
  );
  useEffect(() => {
    console.log("Render Data");
  }, [RefreshData, pageIndex, pageSize]);

  const RefreshAction = () => {
    setIsProcessLoadData(true);
    setTotalPageData(0);
    setData([]);
    setRefreshData(RefreshData + 1);
  };

  const table = useReactTable({
    data,
    columns: columns,
    pageCount: totalPages ?? -1,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    debugTable: false,
    manualFiltering: true,
    manualPagination: true,
  });

  return (
    <>
      <Flex w={"full"}>
        <Table variant="striped" colorScheme="gray" size={"sm"}>
          <Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                <Th>#</Th>
                {headerGroup.headers.map((header) => {
                  return (
                    <Th
                      key={header.id}
                      colSpan={header.colSpan}
                      fontWeight={800}
                      color={"secondary.800"}
                    >
                      {header.isPlaceholder ? null : (
                        <div>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </div>
                      )}
                    </Th>
                  );
                })}
              </Tr>
            ))}
          </Thead>
          <Tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, index) => {
                const startingNumber = index + 1;
                return (
                  <Tr key={row.id}>
                    <Td key={index}>{startingNumber}</Td>
                    {row.getVisibleCells().map((cell) => {
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
                    minH={"250px"}
                  >
                    Belum ada data
                  </Flex>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Flex>
    </>
  );
};
