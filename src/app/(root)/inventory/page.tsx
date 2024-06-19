"use client";
import React from "react";
import { DashboardLayout } from "~/components/common/dashboard-layout";
import { DataTable } from "~/components/data-table";
import { useBranchInventory } from "~/hooks/useBranchInventory";
import { inventoryColumns } from "~/lib/utils";
import { useAuthStore } from "~/store/auth-store";

const InventoryPage = () => {
  const { site_company } = useAuthStore();
  const { inventory, loading, error } = useBranchInventory();
  return (
    <DashboardLayout title={site_company?.branch ?? ""}>
      <main className="flex min-h-[60vh] flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Inventory</h1>
        </div>
        {inventory.length === 0 && !loading && !error ? (
          <div className="flex h-full flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
            <div className="flex flex-col items-center gap-1 text-center">
              <h3 className="text-2xl font-bold tracking-tight">
                You have no products
              </h3>
              <p className="text-sm text-muted-foreground">
                You can start selling as soon as you add a product to your
                inventory.
              </p>
            </div>
          </div>
        ) : (
          <DataTable
            columns={inventoryColumns}
            data={inventory}
            filCol="stock_id"
            onRowClick={(rowData) => console.log(rowData)}
          />
        )}
      </main>
    </DashboardLayout>
  );
};

export default InventoryPage;
