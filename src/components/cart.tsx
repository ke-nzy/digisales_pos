"use client";
import React from "react";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "./ui/table";
import { Label } from "./ui/label";
import { TicketPercent, Trash2 } from "lucide-react";
import { useCartStore } from "../store/cart-store";

const ShoppingCart = () => {
  const { currentCart, clearCart, holdCart } = useCartStore();

  const handleClearCart = () => {
    clearCart();
    alert("Cart cleared successfully");
  };

  const handleHoldCart = () => {
    holdCart();
    alert("Cart held successfully");
  };
  return (
    <Card className="">
      <CardHeader>
        <CardTitle>Customer Cart</CardTitle>
        <CardDescription>...</CardDescription>
      </CardHeader>
      <CardContent className="">
        <Table className="">
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
          <TableBody>
            {currentCart?.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="hidden font-semibold sm:table-cell">
                  {item.item.stock_id}
                  {/* 123 */}
                </TableCell>
                <TableCell className="hidden font-semibold sm:table-cell">
                  {item.item.description}
                </TableCell>
                <TableCell className="hidden font-semibold sm:table-cell">
                  {item.quantity}
                </TableCell>
                <TableCell className="hidden font-semibold sm:table-cell">
                  {item.details.price}
                </TableCell>
                <TableCell className="hidden font-semibold sm:table-cell">
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
            {/* <TableRow>
              <TableCell className="hidden font-semibold sm:table-cell">
                GGPC-001
              </TableCell>
              <TableCell className="font-semibold">Mens T-ShIrt</TableCell>
              <TableCell>
                <Label htmlFor="stock-1" className="sr-only">
                  Stock
                </Label>
                <Input id="stock-1" type="number" defaultValue="100" />
              </TableCell>
              <TableCell>
                <Label htmlFor="price-1" className="sr-only">
                  Price
                </Label>
                <Input id="price-1" type="number" defaultValue="99.99" />
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
            </TableRow> */}
            {/* <TableRow>
              <TableCell className="hidden font-semibold sm:table-cell">
                GGPC-002
              </TableCell>
              <TableCell className="font-semibold">Mens T-ShIrt</TableCell>
              <TableCell>
                <Label htmlFor="stock-2" className="sr-only">
                  Stock
                </Label>
                <Input id="stock-2" type="number" defaultValue="143" />
              </TableCell>
              <TableCell>
                <Label htmlFor="price-2" className="sr-only">
                  Price
                </Label>
                <Input id="price-2" type="number" defaultValue="99.99" />
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <ToggleGroup type="single" defaultValue="m" variant="outline">
                  <ToggleGroupItem value="s">
                    <TicketPercent className="h-4 w-4 text-green-600" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="s">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </TableCell>
            </TableRow> */}

            {/* <TableRow>
              <TableCell className="hidden font-semibold sm:table-cell">
                GGPC-002
              </TableCell>
              <TableCell className="font-semibold">Mens T-ShIrt</TableCell>
              <TableCell>
                <Label htmlFor="stock-2" className="sr-only">
                  Stock
                </Label>
                <Input id="stock-2" type="number" defaultValue="143" />
              </TableCell>
              <TableCell>
                <Label htmlFor="price-2" className="sr-only">
                  Price
                </Label>
                <Input id="price-2" type="number" defaultValue="99.99" />
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <ToggleGroup type="single" defaultValue="m" variant="outline">
                  <ToggleGroupItem value="s">
                    <TicketPercent className="h-4 w-4 text-green-600" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="s">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="hidden font-semibold sm:table-cell">
                GGPC-002
              </TableCell>
              <TableCell className="font-semibold">Mens T-ShIrt</TableCell>
              <TableCell>
                <Label htmlFor="stock-2" className="sr-only">
                  Stock
                </Label>
                <Input id="stock-2" type="number" defaultValue="143" />
              </TableCell>
              <TableCell>
                <Label htmlFor="price-2" className="sr-only">
                  Price
                </Label>
                <Input id="price-2" type="number" defaultValue="99.99" />
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <ToggleGroup type="single" defaultValue="m" variant="outline">
                  <ToggleGroupItem value="s">
                    <TicketPercent className="h-4 w-4 text-green-600" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="s">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="hidden font-semibold sm:table-cell">
                GGPC-002
              </TableCell>
              <TableCell className="font-semibold">Mens T-ShIrt</TableCell>
              <TableCell>
                <Label htmlFor="stock-2" className="sr-only">
                  Stock
                </Label>
                <Input id="stock-2" type="number" defaultValue="143" />
              </TableCell>
              <TableCell>
                <Label htmlFor="price-2" className="sr-only">
                  Price
                </Label>
                <Input id="price-2" type="number" defaultValue="99.99" />
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <ToggleGroup type="single" defaultValue="m" variant="outline">
                  <ToggleGroupItem value="s">
                    <TicketPercent className="h-4 w-4 text-green-600" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="s">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="hidden font-semibold sm:table-cell">
                GGPC-002
              </TableCell>
              <TableCell className="font-semibold">Mens T-ShIrt</TableCell>
              <TableCell>
                <Label htmlFor="stock-2" className="sr-only">
                  Stock
                </Label>
                <Input id="stock-2" type="number" defaultValue="143" />
              </TableCell>
              <TableCell>
                <Label htmlFor="price-2" className="sr-only">
                  Price
                </Label>
                <Input id="price-2" type="number" defaultValue="99.99" />
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <ToggleGroup type="single" defaultValue="m" variant="outline">
                  <ToggleGroupItem value="s">
                    <TicketPercent className="h-4 w-4 text-green-600" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="s">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="hidden font-semibold sm:table-cell">
                GGPC-002
              </TableCell>
              <TableCell className="font-semibold">Mens T-ShIrt</TableCell>
              <TableCell>
                <Label htmlFor="stock-2" className="sr-only">
                  Stock
                </Label>
                <Input id="stock-2" type="number" defaultValue="143" />
              </TableCell>
              <TableCell>
                <Label htmlFor="price-2" className="sr-only">
                  Price
                </Label>
                <Input id="price-2" type="number" defaultValue="99.99" />
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <ToggleGroup type="single" defaultValue="m" variant="outline">
                  <ToggleGroupItem value="s">
                    <TicketPercent className="h-4 w-4 text-green-600" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="s">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="hidden font-semibold sm:table-cell">
                GGPC-002
              </TableCell>
              <TableCell className="font-semibold">Mens T-ShIrt</TableCell>
              <TableCell>
                <Label htmlFor="stock-2" className="sr-only">
                  Stock
                </Label>
                <Input id="stock-2" type="number" defaultValue="143" />
              </TableCell>
              <TableCell>
                <Label htmlFor="price-2" className="sr-only">
                  Price
                </Label>
                <Input id="price-2" type="number" defaultValue="99.99" />
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <ToggleGroup type="single" defaultValue="m" variant="outline">
                  <ToggleGroupItem value="s">
                    <TicketPercent className="h-4 w-4 text-green-600" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="s">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="hidden font-semibold sm:table-cell">
                GGPC-002
              </TableCell>
              <TableCell className="font-semibold">Mens T-ShIrt</TableCell>
              <TableCell>
                <Label htmlFor="stock-2" className="sr-only">
                  Stock
                </Label>
                <Input id="stock-2" type="number" defaultValue="143" />
              </TableCell>
              <TableCell>
                <Label htmlFor="price-2" className="sr-only">
                  Price
                </Label>
                <Input id="price-2" type="number" defaultValue="99.99" />
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <ToggleGroup type="single" defaultValue="m" variant="outline">
                  <ToggleGroupItem value="s">
                    <TicketPercent className="h-4 w-4 text-green-600" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="s">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold">GGPC-003</TableCell>
              <TableCell className="font-semibold">Mens T-Short</TableCell>
              <TableCell>
                <Label htmlFor="stock-3" className="sr-only">
                  Stock
                </Label>
                <Input id="stock-3" type="number" defaultValue="32" />
              </TableCell>
              <TableCell>
                <Label htmlFor="price-3" className="sr-only">
                  Stock
                </Label>
                <Input id="price-3" type="number" defaultValue="99.99" />
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
            </TableRow> */}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ShoppingCart;
