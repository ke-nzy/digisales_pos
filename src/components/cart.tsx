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

const ShoppingCart = () => {
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
              <TableHead className="w-[100px]">Item Name</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="hidden sm:table-cell">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
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
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ShoppingCart;
