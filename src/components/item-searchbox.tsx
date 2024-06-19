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

const ItemSearchBox = () => {
  const { addItemToPayments } = usePayStore();
  const { inventory, loading, error } = useInventory();
  const { site_url, site_company, account } = useAuthStore.getState();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const { addItemToCart } = useCartStore();
  const itemSearchRef = useRef<HTMLInputElement>(null);
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
    item?.stock_id ?? undefined,
    item?.kit ?? undefined,
  );

  const dt = {
    paymentType: "MPESA",
    payments: [
      {
        Auto: "101486",
        name: "LUCY W KIRURI",
        TransID: "QAA5E62PK3",
        TransAmount: "600",
        TransTime: "20240614094602",
      },
      {
        Auto: "101482",
        name: "LILIAN NJERI WACHIRA",
        TransID: "QAA5E50E2Z",
        TransAmount: "3300",
        TransTime: "20220110092658",
      },
    ],
  };
  const at = {
    paymentType: "CASH",
    payments: [
      {
        Auto: "101463",
        name: "JOYCE WANGARI WARUGURU",
        TransID: "QA97DL3MD5",
        TransAmount: "600",
        TransTime: "1718365989933",
      },
      {
        Auto: "101462",
        name: "HENNEDY FLORA K NGAI",
        TransID: "QA94DC9PEG",
        TransAmount: "15000",
        TransTime: "20220109180425",
      },
      {
        Auto: "101461",
        name: "JACKSON MUREITHI ",
        TransID: "QA97DC475V",
        TransAmount: "7800",
        TransTime: "20220109180214",
      },
    ],
  };

  useEffect(() => {
    if (searchTerm.length >= 13 && item) {
      if (details) {
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
      toast.error("Item not found in inventory");
      setSearchTerm(""); // Clear the input field
    }
  }, [searchTerm, item, details, addItemToCart]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "F1") {
        itemSearchRef.current?.focus();
        event.preventDefault(); // Optional: Prevents the default browser action for F1
      }
      if (event.key === "F9") {
        setDialogOpen(true);
        event.preventDefault(); // Optional: Prevents the default browser action for F9
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
  if (detailsError) return <div>Error: {detailsError.message}</div>;

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
