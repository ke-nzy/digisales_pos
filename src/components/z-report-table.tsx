import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface ZReportTableProps {
  data: TransactionReportItem[];
}
type PaymentTypes = Record<string, number>;
const ZReportTable = ({ data }: ZReportTableProps) => {
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
  const paymentTypes = processZReportData(data);

  return (
    <Table>
      <TableCaption>Summary of payment types and amounts.</TableCaption>
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
  );
};

export default ZReportTable;
