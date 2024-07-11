"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";
import { exportToPDF } from "~/lib/utils";
import CsvDownloader from "react-csv-downloader";
import { useAuthStore } from "~/store/auth-store";

interface DataTableProps<TData> {
  from: string | undefined;
  to: string | undefined;
  columns: ColumnDef<TData>[];
  data: TData[];
  onRowClick: (rowData: TData) => void;
}

export function TransactionsDataTable<TData extends TransactionReportItem>({
  from,
  to,
  columns,
  data,
  onRowClick,
}: DataTableProps<TData>) {
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const { receipt_info } = useAuthStore();
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedParentItem, setSelectedParentItem] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedParentItems, setSelectedParentItems] = useState<string[]>([]);
  const getCurrentDate = () => new Date().toISOString().split("T")[0];
  const tableRef = useRef<HTMLDivElement>(null);

  //   const filteredData = useMemo(() => {
  //     return data.filter((item) =>
  //       selectedCategory ? item.user_id === selectedCategory : true,
  //     );
  //   }, [data, selectedCategory]);

  const table = useReactTable({
    data: data,
    columns,
    state: {
      rowSelection: rowSelection,
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <>
      <div className="flex items-center space-x-4 py-4">Transaction report</div>
      <div className="rounded-md border" ref={tableRef}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {data.length ? (
              table.getRowModel().rows.map((row, rowIndex) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  tabIndex={0}
                  onClick={() => onRowClick(row.original)}
                  onFocus={() => setFocusedRowIndex(rowIndex)}
                  className={focusedRowIndex === rowIndex ? "bg-gray-100" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-center">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {/* <TableFooter>
            <TableRow>
              <TableCell colSpan={columns.length - 2} className="text-right">
                Total:
              </TableCell>
              <TableCell className="text-right">
                {totalSum.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableFooter> */}
        </Table>
      </div>
    </>
  );
}
