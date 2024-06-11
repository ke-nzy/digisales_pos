"use client";
import React from "react";
import { ContentLayout } from "~/components/common/content-layout";
import { useAuthStore } from "~/store/auth-store";

const InventoryPage = () => {
  const { site_company } = useAuthStore();
  return (
    <ContentLayout title={site_company?.branch ?? ""}>
      <main className="flex min-h-full flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Inventory</h1>
        </div>
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
      </main>
    </ContentLayout>
  );
};

export default InventoryPage;
