"use client";
import React from "react";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { Card, CardContent } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "~/components/ui/table";
import { useCartStore } from "../store/cart-store";
import { useStore } from "~/hooks/use-store";
import { useSidebarToggle } from "~/hooks/use-sidebar-toggle";
import { cn } from "~/lib/utils";

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
        <Table>
          <TableHeader>
            <TableRow>
              {/* <TableHead className="hidden w-[100px] sm:table-cell">
                SKU
              </TableHead> */}
              <TableHead>Item Name</TableHead>
              <TableHead className="w-[50px]">Qty</TableHead>
              <TableHead className="w-[80px]">Price</TableHead>
              <TableHead className="w-[50px]">Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="pb-6 ">
            {currentCart?.items.reverse().map((item, index) => (
              <TableRow key={index} className="text-xs">
                {/* <TableCell className="hidden font-semibold sm:table-cell">
                  {item.item.stock_id}
                </TableCell> */}
                <TableCell className="font-semibold sm:table-cell">
                  {item.item.description}
                </TableCell>
                <TableCell className="font-semibold sm:table-cell">
                  {item.quantity}
                </TableCell>
                <TableCell className="font-semibold sm:table-cell">
                  {item.details.price}
                </TableCell>
                <TableCell className="font-semibold sm:table-cell">
                  {item.details.quantity_available}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ShoppingCart;
