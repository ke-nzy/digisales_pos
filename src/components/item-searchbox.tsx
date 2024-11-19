"use client";
import { ScanBarcodeIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useInventory, useItemDetails } from "~/hooks/useInventory";
import { useCartStore } from "~/store/cart-store";
import { toast } from "sonner";
import { useAuthStore } from "~/store/auth-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
// import { Label } from "./ui/label";
import { DataTable } from "./data-table";
import { paymentColumns } from "~/lib/utils";
import { usePayStore } from "~/store/pay-store";
import { useUpdateCart } from "../hooks/use-cart";
import { useRouter } from "next/navigation";

const ItemSearchBox = () => {
  const { addItemToPayments } = usePayStore();
  const { inventory, loading, error } = useInventory();
  const { site_url, site_company, account } = useAuthStore.getState();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const { addItemToCart, currentCart } = useCartStore();
  const { mutate: updateCartMutate } = useUpdateCart();
  const itemSearchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const item = inventory.find((invItem) => invItem.stock_id === searchTerm);
  const {
    data: details,
    isLoading: detailsLoading,
    error: detailsError,
  } = useItemDetails(
    site_url!,
    site_company!,
    account!,
    item?.stock_id ?? "",
    item?.kit ?? "",
  );

  const dt = {
    paymentType: "MPESA",
    payments: [],
  };
  const at = {
    paymentType: "CASH",
    payments: [],
  };

  const handleUpdateCart = (cart_id: string, newCart: Cart) => {
    updateCartMutate({ cart_id, newCart });
  };
  useEffect(() => {
    if (site_company === null || site_company === undefined || !site_company || !account) {
      toast.error("Please sign in to access this page.");
      router.replace("/sign-in");
    }
    if (account === null || account === undefined) {
      router.replace("/sign-in");
    }
  }, [account, site_company]);
  useEffect(() => {
    if (currentCart) {
      handleUpdateCart(currentCart.cart_id, currentCart);
    }
  }, [currentCart]);
  useEffect(() => {
    // console.log(
    //   "item",
    //   inventory.find((invItem) => invItem.stock_id.startsWith("C")),
    // );
    if (item) {
      console.log("item", item);
      if (details !== null && details !== undefined) {
        console.log("details", details);
        if (details.quantity_available <= 0) {
          toast.error("Item is out of stock");
          return;
        }
        const directSalesItem: DirectSales = {
          __typename: "direct_sales",
          user: "current_user",
          max_quantity: details.quantity_available,
          item,
          details,
          quantity: 1,
          discount: "0.00",
        };

        addItemToCart(directSalesItem);
        setSearchTerm("");
      }
    } else if (searchTerm.length >= 13) {
    } else if (searchTerm.length >= 15) {
      toast.error("Item not found in inventory");
      setSearchTerm(""); // Clear the input field
    }
  }, [searchTerm, item, details]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "F1") {
        itemSearchRef.current?.focus();
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (loading || detailsLoading)
    return (
      <div className="max-w-full animate-pulse">
        <div className="mb-2.5 h-2 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="mb-2.5 h-2 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="mb-2.5 h-2 rounded-full bg-gray-200 dark:bg-gray-700"></div>
      </div>
    );
  if (error) return <div>Error: {error}</div>;
  // if (detailsError) return <div>Error: {detailsError.message}</div>;

  const handleMpesaRowClick = (rowData: Payment) => {
    const paymentType = dt.paymentType; // Extract the payment type from the data table
    addItemToPayments(rowData, paymentType);
    setDialogOpen(false);
  };
  const handleAccRowClick = (rowData: Payment) => {
    const paymentType = at.paymentType; // Extract the payment type from the data table
    addItemToPayments(rowData, paymentType);
    setDialogOpen(false);
  };

  // useEffect(() => {
  //   console.log("selectedddd", selectedRows);
  // }, [selectedRows]);

  return (
    <form
      className="ml-auto flex-1 sm:flex-initial"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="relative flex items-center gap-2">
        <ScanBarcodeIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          ref={itemSearchRef}
          name="item-search"
          autoFocus={true}
          type="search"
          placeholder="Search..."
          className="pl-8 sm:w-[300px] md:w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild className="flex md:hidden">
            <Button variant={"default"} onClick={() => setDialogOpen(true)}>
              Pay Now
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Payment</DialogTitle>
              <DialogDescription>
                Select mode of payment and enter the payment details.
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="mpesa" className=" max-w-sm">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="mpesa">Mpesa</TabsTrigger>
                <TabsTrigger value="other">Accounts</TabsTrigger>
              </TabsList>
              <TabsContent value="mpesa">
                <Card>
                  <CardHeader>
                    <CardTitle>Mpesa</CardTitle>
                    <CardDescription>
                      Search using amount or customer name to find payment
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="no-scrollbar max-h-[200px] overflow-y-auto">
                    <DataTable
                      columns={paymentColumns}
                      filCol="name"
                      data={dt.payments}
                      onRowClick={handleMpesaRowClick}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="other">
                <Card>
                  <CardHeader>
                    <CardTitle>Accounts</CardTitle>
                  </CardHeader>
                  <CardContent className="no-scrollbar max-h-[200px] overflow-y-auto">
                    <DataTable
                      columns={paymentColumns}
                      filCol="name"
                      data={at.payments}
                      onRowClick={handleAccRowClick}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </form>
  );
};

export default ItemSearchBox;
