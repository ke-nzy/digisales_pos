"use client";
import React from "react";
import { DashboardLayout } from "~/components/common/dashboard-layout";
import { DataTable } from "~/components/data-table";
import { useSalesReport } from "~/hooks/use-reports";
import { salesReportColumns } from "~/lib/utils";
import { useAuthStore } from "~/store/auth-store";

const SalesReports = () => {
  const { site_company } = useAuthStore();
  const { salesReport, loading, error } = useSalesReport();
  return (
    <DashboardLayout title={site_company?.branch ?? ""}>
      <main className="flex min-h-[60vh] flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Sales Reports</h1>
        </div>
        {salesReport.length === 0 && !loading && !error ? (
          <div className="flex h-full flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
            <div className="flex flex-col items-center gap-1 text-center">
              <h3 className="text-2xl font-bold tracking-tight">
                You have no sales reports
              </h3>
              <p className="text-sm text-muted-foreground">
                You can start generating a report as soon as you make a sale.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <DataTable
              columns={salesReportColumns}
              data={salesReport}
              filCol="stock_id"
              onRowClick={(rowData) => console.log(rowData)}
            />
          </div>
        )}
      </main>
    </DashboardLayout>
  );
};

export default SalesReports;
