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
import { useState, useEffect, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

// Define the structure of the sales report item
interface SalesReportItem {
  stock_id: string;
  description: string;
  unit_price: string;
  quantity: string;
  category_name: string;
  parent_item: string;
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  onRowClick: (rowData: TData) => void;
}

export function TransactionsDataTable<TData extends SalesReportItem>({
  columns,
  data,
  onRowClick,
}: DataTableProps<TData>) {
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedParentItem, setSelectedParentItem] = useState<string>("");
  const tableRef = useRef<HTMLDivElement>(null);

  const table = useReactTable({
    data,
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

  const handleKeyDown = (
    event: React.KeyboardEvent,
    rowIndex: number,
    rowData: TData,
  ) => {
    if (event.key === "Tab") {
      setFocusedRowIndex((prevIndex) =>
        prevIndex === null
          ? 0
          : Math.min(prevIndex + 1, table.getRowModel().rows.length - 1),
      );
    } else if (event.key === "Enter") {
      onRowClick(rowData);
    }
  };

  useEffect(() => {
    if (focusedRowIndex !== null && tableRef.current) {
      const rows = tableRef.current.querySelectorAll("tr");
      if (rows[focusedRowIndex]) {
        (rows[focusedRowIndex] as HTMLElement).focus();
      }
    }
  }, [focusedRowIndex]);

  const filteredData = data.filter(
    (item) =>
      (selectedCategory ? item.category_name === selectedCategory : true) &&
      (selectedParentItem ? item.parent_item === selectedParentItem : true),
  );

  const totalSum = filteredData.reduce((sum, item) => {
    return sum + parseFloat(item.unit_price) * parseInt(item.quantity);
  }, 0);

  return (
    <>
      <div className="flex items-center space-x-4 py-4">
        <Select onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            {Array.from(new Set(data.map((item) => item.category_name))).map(
              (category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>

        <Select onValueChange={setSelectedParentItem}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Parent Item" />
          </SelectTrigger>
          <SelectContent>
            {Array.from(new Set(data.map((item) => item.parent_item))).map(
              (parentItem) => (
                <SelectItem key={parentItem} value={parentItem}>
                  {parentItem}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

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
            {filteredData.length ? (
              table.getRowModel().rows.map((row, rowIndex) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  tabIndex={0}
                  onClick={() => onRowClick(row.original)}
                  onKeyDown={(event) =>
                    handleKeyDown(event, rowIndex, row.original)
                  }
                  onFocus={() => setFocusedRowIndex(rowIndex)}
                  className={focusedRowIndex === rowIndex ? "bg-gray-100" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
          <TableFooter>
            <TableRow>
              <TableCell colSpan={columns.length - 1} className="text-right">
                Total:
              </TableCell>
              <TableCell className="text-right">
                {totalSum.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </>
  );
}

export default TransactionsDataTable;
