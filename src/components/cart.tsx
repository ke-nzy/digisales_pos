"use client";
import React from "react";
import { Card, CardContent } from "~/components/ui/card";

import { useCartStore } from "../store/cart-store";
import { useStore } from "~/hooks/use-store";
import { useSidebarToggle } from "~/hooks/use-sidebar-toggle";
import { cartColumns, cn } from "~/lib/utils";
import { DataTable } from "./data-table";

const ShoppingCart = () => {
  const { currentCart } = useCartStore();
  const sidebar = useStore(useSidebarToggle, (state) => state);

  return (
    <Card
      className={cn(
        "no-scrollbar h-[26rem] flex-grow overflow-y-auto",
        sidebar?.isOpen === false ? "md:min-w-[48rem]" : "md:min-w-[30rem]",
      )}
    >
      <CardContent className="overflow-y-auto">
        <DataTable
          columns={cartColumns}
          data={currentCart?.items ?? []}
          filCol="description"
          onRowClick={(rowData) => console.log(rowData)}
        />
      </CardContent>
    </Card>
  );
};

export default ShoppingCart;
