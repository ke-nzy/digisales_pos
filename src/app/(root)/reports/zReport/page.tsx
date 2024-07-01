"use client";
import React from "react";
import { DashboardLayout } from "~/components/common/dashboard-layout";
import ZReportTable from "~/components/z-report-table";
import { usePosTransactionsReport } from "~/hooks/use-reports";
import { toDate } from "~/lib/utils";

const zReport = () => {
  const { posTransactionsReport, loading } = usePosTransactionsReport({
    from: toDate(new Date()),
    to: toDate(new Date()),
  });
  // const processZReportData = (data: TransactionReportItem[]) => {
  //   let totalSales = 0;
  //   let totalTax = 0;
  //   const paymentSummary: any = {};
  //   const paymentTypes: any = {};

  //   data.forEach((entry) => {
  //     totalSales += parseFloat(entry.ptotal);
  //     const items: TransactionInvItem[] = JSON.parse(entry.pitems);

  //     items.forEach((item) => {
  //       totalTax += parseFloat(item.tax);
  //     });

  //     if (!paymentTypes[entry.ptype]) {
  //       paymentTypes[entry.ptype] = 0;
  //     }
  //     paymentTypes[entry.ptype] += parseFloat(entry.ptotal);

  //     const payments: Payment[] = JSON.parse(entry.payments);
  //     payments.forEach((payment) => {
  //       const { TransAmount, TransID, name } = payment;
  //       if (!paymentSummary[TransID]) {
  //         paymentSummary[TransID] = {
  //           amount:
  //             typeof TransAmount === "string"
  //               ? parseFloat(TransAmount)
  //               : TransAmount,
  //           name,
  //         };
  //       }
  //     });
  //   });

  //   return { totalSales, totalTax, paymentSummary, paymentTypes };
  // };
  return (
    <DashboardLayout title={"ZREPOrt"}>
      <div className="flex h-full flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <div className="h-full w-full flex-grow  flex-col items-center justify-center gap-1 ">
          <ZReportTable data={posTransactionsReport} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default zReport;
