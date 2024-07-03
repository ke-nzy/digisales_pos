"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import ZReportPDF from "./pdfs/zReport";
import { pdf } from "@react-pdf/renderer";
import { useAuthStore } from "~/store/auth-store";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { PrinterIcon } from "lucide-react";

interface ZReportTableProps {
  data: TransactionReportItem[];
  sales: SalesReportItem[];
}
interface ParentItemSummary {
  parent_item: string;
  total_unit_price: number;
  total_quantity: number;
}
type PaymentTypes = Record<string, number>;
const ZReportTable = ({ data, sales }: ZReportTableProps) => {
  const { account, receipt_info } = useAuthStore();
  const processZReportData = (data: TransactionReportItem[]) => {
    const paymentTypes: PaymentTypes = {};

    data.forEach((entry) => {
      const ptype = entry.ptype;
      if (paymentTypes[ptype] === undefined) {
        paymentTypes[ptype] = 0;
      }
      paymentTypes[ptype] += parseFloat(entry.ptotal);
    });

    console.log("paymentTypes", paymentTypes);

    return paymentTypes;
  };
  function summarizeParentItems(items: SalesReportItem[]): ParentItemSummary[] {
    const summaryMap: Record<string, ParentItemSummary> = {};

    items.forEach((item) => {
      const unitPrice = parseFloat(item.unit_price);
      const quantity = parseInt(item.quantity, 10);

      if (!summaryMap[item.parent_item]) {
        summaryMap[item.parent_item] = {
          parent_item: item.parent_item,
          total_unit_price: 0,
          total_quantity: 0,
        };
      }

      const summary = summaryMap[item.parent_item]!;
      summary.total_unit_price += unitPrice;
      summary.total_quantity += quantity;
    });
    return Object.values(summaryMap);
  }
  const handlePrint = async () => {
    try {
      console.log("handlePrint", data);

      const pdfBlob = await pdf(
        <ZReportPDF
          parentItemSummary={parentItemSummary}
          paymentTypes={paymentTypes}
          receipt_info={receipt_info!}
          account={account!}
        />,
      ).toBlob();

      const url = URL.createObjectURL(pdfBlob);
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.zIndex = "1000";
      iframe.src = url;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        iframe.focus();
        iframe.contentWindow!.print();
        iframe.contentWindow!.onafterprint = () => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(url); // Revoke the URL to free up resources
        };
      };
    } catch (error) {
      console.error("Failed to print document:", error);
      toast.error("Failed to print document");
    }
  };

  const paymentTypes = processZReportData(data);
  const parentItemSummary = summarizeParentItems(sales);

  console.log("parentItemSummary", parentItemSummary);

  return (
    <div className="flex flex-col gap-4 space-y-5 ">
      <div className="flex flex-row justify-end">
        {parentItemSummary.length > 0 ? (
          <Button variant="outline" size="sm" onClick={() => handlePrint()}>
            <PrinterIcon className="h-6 w-6 cursor-pointer text-gray-500 hover:text-gray-700" />
            Print
          </Button>
        ) : (
          <></>
        )}
      </div>
      <div className="">
        {parentItemSummary.length > 0 ? (
          <Table className="rounded-lg border border-dashed shadow-sm">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Item</TableHead>
                <TableHead className="text-right">Sold(Pcs)</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parentItemSummary.map((is) => (
                <TableRow key={is.parent_item}>
                  <TableCell className="font-medium">
                    {is.parent_item}
                  </TableCell>
                  <TableCell className="text-right">
                    {is.total_quantity}
                  </TableCell>
                  <TableCell className="text-right">
                    KES {is.total_unit_price}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex h-full flex-1 items-center justify-center rounded-lg border border-dashed py-10 shadow-sm">
            <div className="flex flex-col items-center gap-1 text-center">
              <h3 className="text-2xl font-bold tracking-tight">
                You have no sales today
              </h3>
              <p className="text-sm text-muted-foreground">
                You can start generating a z report as soon as you make a sale
                today.
              </p>
            </div>
          </div>
        )}
      </div>
      <div>
        {Object.keys(paymentTypes).length > 0 ? (
          <Table className="rounded-lg border border-dashed shadow-sm">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Payment Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.keys(paymentTypes).map((ptype) => (
                <TableRow key={ptype}>
                  <TableCell className="font-medium">{ptype}</TableCell>
                  <TableCell className="text-right">
                    {paymentTypes[ptype]!.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell>Total</TableCell>
                <TableCell className="text-right">
                  {Object.values(paymentTypes)
                    .reduce((acc, val) => acc + val, 0)
                    .toFixed(2)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default ZReportTable;
