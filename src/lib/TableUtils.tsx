import { type ColumnDef } from "@tanstack/react-table";
import React from "react";
import DataTableColumnHeader from "~/components/data-table-column-header";

export const inventoryColumns: ColumnDef<StockItem>[] = [
  {
    accessorKey: "stock_id",
    header: "Item Code",
  },
  {
    accessorKey: "item",
    header: "Item Name",
  },
  {
    accessorKey: "balance",
    header: ({ column }) => (
      <DataTableColumnHeader
        className="text-left"
        column={column}
        title="Balance"
      />
    ),
    cell: (props) => {
      const row = props.row.original;
      const rowTotal = parseInt(row.balance);
      return React.createElement(
        "span",
        { className: "text-right" },
        rowTotal.toFixed(2),
      );
    },
  },
  {
    id: "actions",
  },
];
