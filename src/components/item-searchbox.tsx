"use client";
import { ScanBarcodeIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useInventory, useItemDetails } from "~/hooks/useInventory";
import { useCartStore } from "~/store/cart-store";
import { toast } from "sonner";
import { useAuthStore } from "~/store/auth-store";

const ItemSearchBox = () => {
  const { inventory, loading, error } = useInventory();
  const { site_url, site_company, account } = useAuthStore.getState();
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
        <Button onClick={() => console.log("paye")} variant={"default"}>
          Pay Now
        </Button>
      </div>
    </form>
  );
};

export default ItemSearchBox;
