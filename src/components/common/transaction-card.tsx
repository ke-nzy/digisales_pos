"use client";
import React, { useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  CheckCheckIcon,
  PrinterIcon,
  ShoppingBasketIcon,
  Timer,
} from "lucide-react";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { cn } from "~/lib/utils";
import { useCartStore } from "~/store/cart-store";
import { getCart } from "~/utils/indexeddb";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { pdf } from "@react-pdf/renderer";
import TransactionReceiptPDF from "../thermal-receipt";
import { useAuthStore } from "~/store/auth-store";
import { TrashIcon } from "@radix-ui/react-icons";
interface TransactionCardProps {
  data: TransactionReportItem;
  status?: "Completed" | "Held";
  // onPrint: (data: TransactionReportItem) => void;
}
const TransactionCard = ({ data, status }: TransactionCardProps) => {
  const { currentCart } = useCartStore();
  const { receipt_info, account } = useAuthStore();
  const router = useRouter();
  const items: TransactionInvItem[] =
    data.pitems.length > 0 ? JSON.parse(data.pitems) : [];

  const handleReOpen = async () => {
    console.log(`cart_${data.unique_identifier}`);

    const loadCart = await getCart(`${data.unique_identifier}`);

    console.log("loadCart", loadCart);

    try {
      // check if currentCart is null only then set it to the loaded cart
      if (currentCart !== null) {
        toast.error("Clear current cart instance");
      }
      // handleReopen to cart by setting currentCart to the loaded cart
      useCartStore.setState({ currentCart: loadCart });

      // useCartStore.setState({currentCart:{
      //     cart_id: `cart_${data.unique_identifier}`,
      //     items: items,

      // }})
    } catch (error) {
      console.error("Failed to load cart:", error);
      toast.error("Failed to load cart");
    } finally {
      router.push("/");
    }

    // redirect to POS
  };

  const handlePrint = async (data: TransactionReportItem) => {
    try {
      console.log("handlePrint", data);

      const pdfBlob = await pdf(
        <TransactionReceiptPDF
          data={data}
          receipt_info={receipt_info!}
          account={account!}
        />,
      ).toBlob();

      const url = URL.createObjectURL(pdfBlob);
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.zIndex = "1000";
      iframe.src = url;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        iframe.focus();
        iframe.contentWindow!.print();
        iframe.contentWindow!.onafterprint = () => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(url); // Revoke the URL to free up resources
        };
      };
    } catch (error) {
      console.error("Failed to print document:", error);
      toast.error("Failed to print document");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-4">
            {/* <Avatar className="hidden h-9 w-9 p-2 sm:flex">
              <User2Icon className="h-9 w-9 text-zinc-700" />
            </Avatar> */}
            <div className="grid w-full  gap-1">
              <div className="flex flex-row items-center justify-between gap-4">
                <p className="text-sm font-medium leading-none">
                  {data.customername}
                </p>
                <span
                  className={cn(
                    "flex flex-row items-center justify-evenly space-x-2 rounded-sm  p-1",
                    data.status === "1" || status === "Completed"
                      ? "bg-green-200"
                      : "bg-orange-200",
                  )}
                >
                  {(data.status === "1" || status === "Completed") && (
                    <CheckCheckIcon className="h-3 w-3 text-emerald-950" />
                  )}
                  {(data.status === "0" || status === "Held") && (
                    <Timer className="h-3 w-3 text-orange-950" />
                  )}
                  {(data.status === "1" || status === "Completed") && (
                    <p className="text-sm text-emerald-950">Completed</p>
                  )}
                  {(data.status === "0" || status === "Held") && (
                    <p className="text-sm text-orange-950">On Hold</p>
                  )}
                  {data.status === "3" && status === "Held" && (
                    <p className="text-sm text-red-950">Cancelled</p>
                  )}
                </span>
              </div>
              <div className="flex flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  {data.unique_identifier}
                </p>
              </div>
            </div>
          </div>
        </CardTitle>
        <CardDescription>
          <div className="flex flex-row items-center justify-between gap-4">
            <p>{new Date(data.pdate).toLocaleDateString()}</p>
            <p>{new Date(data.pdate).toLocaleTimeString()}</p>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-56">
          <Table className="h-full">
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length > 0 &&
                items.map((x) => (
                  <TableRow key={x.item_option_id}>
                    <TableCell className="w-[200px] text-xs">
                      {x.item_option}
                    </TableCell>
                    <TableCell className="w-[70px] text-xs">
                      {x.quantity}
                    </TableCell>
                    <TableCell className="text-xs">KES {x.price}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </ScrollArea>
        <div className="mt-4 flex flex-row items-center justify-between gap-4">
          <p className="text-md font-semibold text-zinc-900">Total</p>
          <p className="text-md font-semibold   text-zinc-900">
            KES {data.ptotal}
          </p>
        </div>
      </CardContent>
      {(data.status === "1" || status === "Completed") && (
        <CardFooter className="justify-center border-t p-4">
          <Button
            size="sm"
            variant="default"
            className="gap-1"
            onClick={() => handlePrint(data)}
          >
            <PrinterIcon className="h-3.5 w-3.5" />
            Re-Print
          </Button>
        </CardFooter>
      )}
      {(data.status === "0" || status === "Held") && (
        <CardFooter className="flex flex-row justify-between space-x-3 border-t p-4">
          <Button size="sm" variant="destructive" className="flex-grow gap-2">
            <TrashIcon className="h-3.5 w-3.5" />
            Clear
          </Button>
          <Button
            onClick={handleReOpen}
            size="sm"
            variant="default"
            className="flex-grow gap-2"
          >
            <ShoppingBasketIcon className="h-3.5 w-3.5" />
            Open
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default TransactionCard;
