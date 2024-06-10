"use client";
import { ScanBarcodeIcon } from "lucide-react";
import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useInventory } from "~/hooks/useInventory";

const ItemSearchBox = () => {
  const { inventory, loading, error } = useInventory();
  // const item_search_ref = React.useRef<HTMLInputElement>(null);
  // const [search_term, set_search_term] = React.useState<string>("");
  // useEffect(() => {
  //   data.fetchInventory();
  // }, []);
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  console.log("inv", inventory);

  return (
    <form className="ml-auto flex-1 sm:flex-initial">
      <div className="relative flex items-center gap-2">
        <ScanBarcodeIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="pl-8 sm:w-[300px] md:w-full"
        />
        <Button variant={"default"}>Pay Now</Button>
      </div>
    </form>
  );
};

export default ItemSearchBox;
