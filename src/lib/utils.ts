import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import { type ColumnDef } from "@tanstack/react-table";
import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1 < 10 ? "0" : ""}${date.getMonth() + 1}`;
  const day = `${date.getDate() < 10 ? "0" : ""}${date.getDate()}`;

  return `${year}-${month}-${day}`;
}

export const authFormSchema = () =>
  z
    .object({
      // sign in
      site_name: z
        .string({
          required_error: "Please enter Site name.",
        })
        .min(1, {
          message: "Please enter site name.",
        }),
      username: z
        .string({
          required_error: "Please Enter UserName.",
        })
        .min(1, {
          message: "Please enter valid username.",
        }),
      password: z.string({
        required_error: "Please Enter Password.",
      }),
    })
    .required();

export function generateRandomString(length: number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export const calculateCartTotal = (cart: Cart): number => {
  if (!cart) return 0;
  return cart.items.reduce((total, cartItem) => {
    return total + cartItem.quantity * cartItem.details.price;
  }, 0);
};

export const calculateDiscount = (cart: Cart): number => {
  if (!cart) return 0;
  return cart.items.reduce((total, cartItem) => {
    return total + parseInt(cartItem.discount ?? "0.00");
  }, 0);
};

export const tallyTotalAmountPaid = (paymentCarts: PaymentCart[]): number => {
  return paymentCarts.reduce((total, cart) => {
    const cartTotal = cart.payments.reduce((cartSum, payment) => {
      const amount =
        typeof payment.TransAmount === "string"
          ? parseFloat(payment.TransAmount)
          : payment.TransAmount;
      return cartSum + (isNaN(amount) ? 0 : amount);
    }, 0);
    return total + cartTotal;
  }, 0);
};

export const paymentColumns: ColumnDef<Payment>[] = [
  {
    accessorKey: "TransID",
    header: "RefNo",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "TransAmount",
    header: "Amnt",
  },
];

export const posFilterFields: DataTableFilterField<TransactionReportItem>[] = [
  {
    label: "Payment Type",
    value: "ptype",
    placeholder: "Filter by Payment Type",
    options: [
      { label: "Cash", value: "Cash" },
      { label: "Cheque", value: "Cheque" },
      { label: "Credit Card", value: "Credit Card" },
      { label: "Debit Card", value: "Debit Card" },
      { label: "Other", value: "Other" },
    ],
  },
  {
    label: "Item Category",
    value: "pitems",
    placeholder: "Filter by Item Category",
    // modify options based on Item Category
    options: [
      { label: "Food", value: "Food" },
      { label: "Clothing", value: "Clothing" },
      { label: "Electronics", value: "Electronics" },
      { label: "Home", value: "Home" },
      { label: "Other", value: "Other" },
    ],
  },
];
// export const inventoryColumns: ColumnDef<StockItem>[] = [
//   {
//     accessorKey: "stock_id",
//     header: "Item Code",
//   },
//   {
//     accessorKey: "item",
//     header: "Item Name",
//   },
//   {
//     accessorKey: "balance",
//     header: "Balance",
//   },
//   {
//     id: "actions",
//   },
// ];

// export const salesReportColumns: ColumnDef<SalesReportItem>[] = [
//   {
//     accessorKey: "stock_id",
//     header: "Item Code",
//     footer: "Total",
//   },
//   {
//     accessorKey: "category_name",
//     header: "Category",
//   },

//   {
//     accessorKey: "parent_item",
//     header: "Item Type",
//   },
//   {
//     accessorKey: "description",
//     header: "Item Name",
//   },
//   {
//     accessorKey: "unit_price",
//     header: "Unit Price",
//   },
//   {
//     accessorKey: "quantity",
//     header: "Quantity",
//   },
//   {
//     id: "total",
//     header: "Total",
//     cell: (props) => {
//       const row = props.row.original;
//       const rowTotal = parseInt(row.quantity) * parseFloat(row.unit_price);
//       return React.createElement(
//         "span",
//         { className: "text-right" },
//         rowTotal.toFixed(2),
//       );
//     },
//     footer: (props) => {
//       const total = props.table.getCoreRowModel().rows.reduce((sum, row) => {
//         const rowData = row.original;
//         return (
//           sum + parseInt(rowData.quantity) * parseFloat(rowData.unit_price)
//         );
//       }, 0);
//       return React.createElement(
//         "span",
//         { className: "text-right" },
//         total.toFixed(2),
//       );
//     },
//   },
// ];
// Sample usage
export const salesReportColumns: ColumnDef<SalesReportItem>[] = [
  {
    id: "stock_id",
    accessorKey: "stock_id",
    header: "Item Code",
    footer: "Total",
    cell: (props) => props.getValue(),
  },
  {
    id: "category_name",
    accessorKey: "category_name",
    header: "Category",
    cell: (props) => props.getValue(),
  },
  {
    id: "parent_item",
    accessorKey: "parent_item",
    header: "Item Type",
    cell: (props) => props.getValue(),
  },
  {
    id: "description",
    accessorKey: "description",
    header: "Item Name",
    cell: (props) => props.getValue(),
  },
  {
    id: "unit_price",
    accessorKey: "unit_price",
    header: "Unit Price",
    cell: (props) => props.getValue(),
  },
  {
    id: "quantity",
    accessorKey: "quantity",
    header: "Quantity",
    cell: (props) => props.getValue(),
  },
  {
    id: "total",
    header: "Total",
    cell: (props) => {
      const row = props.row.original;
      const rowTotal = parseInt(row.quantity) * parseFloat(row.unit_price);
      return rowTotal.toFixed(2);
    },
    footer: (props) => {
      const total = props.table.getCoreRowModel().rows.reduce((sum, row) => {
        const rowData = row.original;
        return (
          sum + parseInt(rowData.quantity) * parseFloat(rowData.unit_price)
        );
      }, 0);
      return total.toFixed(2);
    },
  },
];

export const cartColumns: ColumnDef<DirectSales>[] = [
  {
    id: "description",
    accessorKey: "item.description",
    header: "Item Name",
  },

  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "details.price",
    header: "Unit Price",
  },
  {
    accessorKey: "details.quantity_available",
    header: "Stock Available",
  },
  {
    id: "total",
    header: "Total",
    cell: (props) => {
      const row = props.row.original;
      const rowTotal =
        parseInt(row.quantity.toString()) *
        parseFloat(row.details.price.toString());
      const subTotal = rowTotal - parseInt(row.discount ?? "0.00");
      return React.createElement(
        "span",
        { className: "text-right" },
        subTotal.toFixed(2),
      );
    },
  },
];

export function calculateSubtotalAndDiscount(data: TransactionReportItem) {
  // Parse the pitems JSON string into an array of objects
  const pitems: TransactionInvItem[] = JSON.parse(data.pitems);

  // Calculate the subtotal and total discount
  const result = pitems.reduce(
    (acc, item) => {
      const total =
        typeof item.total === "string" ? parseFloat(item.total) : item.total;
      const discount = parseFloat(item.discount);
      acc.subtotal += total;
      acc.totalDiscount += discount;
      return acc;
    },
    { subtotal: 0, totalDiscount: 0 },
  );

  return result;
}
// export const exportToCSV = (
//   data: SalesReportItem[],
//   columns: ColumnDef<SalesReportItem>[],
// ) => {
//   const csvData = data.map((row) => {
//     const rowData: any = {};
//     columns.forEach((column) => {
//       rowData[column.id as keyof SalesReportItem] =
//         row[column.id as keyof SalesReportItem];
//     });
//     return rowData;
//   });
//   return csvData;
// };

export const exportToPDF = (
  data: SalesReportItem[],
  columns: ColumnDef<SalesReportItem>[],
) => {
  const doc = new jsPDF();
  const tableColumn = columns.map((column) => column.id!);
  const tableRows: any[] = [];

  data.forEach((row) => {
    const rowData = columns.map(
      (column) => row[column.id as keyof SalesReportItem],
    );
    tableRows.push(rowData);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
  });

  doc.save("item-report.pdf");
};

export const searchParamsSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});
