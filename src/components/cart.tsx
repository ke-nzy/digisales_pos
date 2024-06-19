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
import { TicketPercent, Trash2 } from "lucide-react";
import { useCartStore } from "../store/cart-store";

const ShoppingCart = () => {
  const { currentCart } = useCartStore();

  if (!currentCart) return null;

  return (
    <Card className=" no-scrollbar h-[26rem] flex-grow overflow-y-auto  ">
      <CardContent className="overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                SKU
              </TableHead>
              <TableHead>Item Name</TableHead>
              <TableHead className="w-[50px]">Qty</TableHead>
              <TableHead className="w-[80px]">Price</TableHead>
              <TableHead className="w-[50px]">Stock</TableHead>
              <TableHead className="hidden sm:table-cell">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="pb-6 ">
            {currentCart?.items.reverse().map((item, index) => (
              <TableRow key={index} className="text-xs">
                <TableCell className="hidden font-semibold sm:table-cell">
                  {item.item.stock_id}
                </TableCell>
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
                <TableCell className="hidden sm:table-cell">
                  <ToggleGroup type="single" defaultValue="s" variant="outline">
                    <ToggleGroupItem value="s">
                      <TicketPercent className="h-4 w-4 text-green-600" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="s">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </ToggleGroupItem>
                  </ToggleGroup>
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
