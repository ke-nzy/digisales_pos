"use client";
import { ScanBarcodeIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useInventory, useItemDetails } from "~/hooks/useInventory";
import { useCartStore } from "~/store/cart-store";
import { toast } from "sonner";

const ItemSearchBox = () => {
  const { inventory, loading, error } = useInventory();
  const { addItemToCart } = useCartStore();
  const itemSearchRef = React.useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  useEffect(() => {
    if (searchTerm.length >= 13) {
      const item = inventory.find((invItem) => invItem.stock_id === searchTerm);
      console.log("item", item);

      if (item) {
        setSelectedItem(item);
        // Assuming that DirectSales object can be created from inventory item
        // const { itemDetails, error, loading } = useItemDetails(
        //   item.stock_id,
        //   item.kit,
        //   undefined,
        // );
        // console.log("res", itemDetails);
        // const directSalesItem: DirectSales = {
        //   __typename: "direct_sales",
        //   user: "current_user", // Replace with actual user info
        //   max_quantity: 3, // Example field
        //   item,
        //   details: {
        //     price: Number(item.rate), // Example conversion
        //     quantity_available: Number(item.units),
        //     tax_mode: Number(item.mb_flag), // Example conversion
        //   },
        //   quantity: 1,
        // };
        // addItemToCart(directSalesItem);
        // setSearchTerm(""); // Clear the input field
      } else {
        toast.error("Item not found in inventory");
        // setSearchTerm(""); // Clear the input field
      }
    }
  }, [searchTerm, inventory]);

  const { itemDetails } = useItemDetails(
    selectedItem?.stock_id ?? "",
    selectedItem?.kit ?? "",
    undefined,
  );

  useEffect(() => {
    if (selectedItem && itemDetails) {
      console.log("itemDetails", itemDetails);

      const directSalesItem: DirectSales = {
        __typename: "direct_sales",
        user: "current_user", // Replace with actual user info
        max_quantity: itemDetails.quantity_available, // Example field
        item: selectedItem,
        details: {
          price: Number(itemDetails.price), // Example conversion
          quantity_available: Number(itemDetails.quantity_available),
          tax_mode: Number(itemDetails.tax_mode), // Example conversion
        },
        quantity: 1,
      };
      if (
        directSalesItem.details.price > 0 ||
        directSalesItem.details.quantity_available > 0
      ) {
        if (
          directSalesItem.details.quantity_available < directSalesItem.quantity
        ) {
          addItemToCart(directSalesItem);
          setSearchTerm("");
        } else {
          toast.error("Quantity is greater than stock available");
        }
      } else {
        toast.error("Item is unavailable");
        setSearchTerm("");
      }
      // Clear the input field
    }
  }, [selectedItem, itemDetails, addItemToCart]);
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <form
      className="ml-auto flex-1 sm:flex-initial"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="relative flex items-center gap-2">
        <ScanBarcodeIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          ref={itemSearchRef}
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
