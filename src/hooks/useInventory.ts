"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetch_all_item_inventory,
  fetch_all_sellable_items,
  fetch_item_details,
} from "~/lib/actions/inventory.actions";
import { useAuthStore } from "~/store/auth-store";
import {
  getInventory,
  getItemPriceDetails,
  getMetadata,
  setInventory,
  setMetadata,
  setPriceList,
} from "~/utils/indexeddb";

const fetchInventoryData = async (): Promise<InventoryItem[]> => {
  const { site_company, account, site_url } = useAuthStore.getState();
  const lastUpdate = await getMetadata("metadata");
  const now = new Date();
  const thirtyAgo = new Date(now.getTime() - 1000 * 60 * 60 * 0.5);
  let list: InventoryItem[] = [];
  if (lastUpdate) {
    if (new Date(lastUpdate) >= thirtyAgo) {
      // Fetch from Endpoint
      const sellable = await fetch_all_sellable_items(
        site_company!,
        account!,
        site_url!,
      );

      const item_inventory = await fetch_all_item_inventory(
        site_company!,
        account!,
        site_url!,
      );

      await setInventory("inventory", sellable || []);
      await setPriceList("priceList", item_inventory || []);
      await setMetadata("metadata", now.toISOString());
      list = sellable || [];
      return list;
    } else {
      // Fetch from IndexedDB
      const inventory = await getInventory("inventory", "");
      if (inventory) {
        list = inventory;
        return list;
      }
    }
  } else {
    const sellable = await fetch_all_sellable_items(
      site_company!,
      account!,
      site_url!,
    );

    const item_inventory = await fetch_all_item_inventory(
      site_company!,
      account!,
      site_url!,
    );

    await setInventory("inventory", sellable || []);
    await setPriceList("priceList", item_inventory || []);
    await setMetadata("metadata", now.toISOString());
    list = sellable || [];
    return list;
  }

  // if (lastUpdate && new Date(lastUpdate) >= aDayAgo) {
  //   // Fetch from IndexedDB
  //   const inventory = await getInventory("inventory", "");
  //   if (inventory) {
  //     return inventory;
  //   }
  // }

  // Fetch from API
  // const sellable = await fetch_all_sellable_items(
  //   site_company!,
  //   account!,
  //   site_url!,
  // );

  // const item_inventory = await fetch_all_item_inventory(
  //   site_company!,
  //   account!,
  //   site_url!,
  // );

  // console.log("item_inventory", item_inventory);

  // const list = sellable || [];
  // const pl = item_inventory || [];
  // await setMetadata("metadata", now.toISOString());
  // await setInventory("inventory", list);
  // await setPriceList("priceList", pl);
  return list;
};

const fetchItemDetails = async (
  stock_id?: string,
  kit?: string,
): Promise<any> => {
  const { site_company, account, site_url } = useAuthStore.getState();
  const lastUpdate = await getMetadata("metadata");
  const now = new Date();
  const thirtyAgo = new Date(now.getTime() - 1000 * 60 * 60 * 0.5);
  let details;
  if (lastUpdate) {
    if (new Date(lastUpdate) <= thirtyAgo) {
      // Fetch from Endpoint
      console.log("fetch_item_details from Endpoint (30 minutes ago)");

      const item_details = await fetch_item_details(
        site_url!,
        site_company!.company_prefix,
        account!.id,
        stock_id!,
        kit!,
        undefined,
      );

      console.log("item_details", item_details);

      const sellable = await fetch_all_sellable_items(
        site_company!,
        account!,
        site_url!,
      );

      const item_inventory = await fetch_all_item_inventory(
        site_company!,
        account!,
        site_url!,
      );

      await setInventory("inventory", sellable || []);
      await setPriceList("priceList", item_inventory || []);
      await setMetadata("metadata", now.toISOString());
      details = item_details;
      return details;
    } else {
      // Fetch from IndexedDB
      console.log("fetch_item_details from IndexedDB");
      console.log("stock_id", stock_id);
      const itemDetails = await getItemPriceDetails(stock_id!);
      console.log("itemDetails", itemDetails);
      if (itemDetails) {
        details = itemDetails;
      } else {
        details = {
          price: "0",
          quantity_available: "0",
          tax_mode: "0",
        };
      }
    }
  } else {
    console.log("fetch_item_details no lastUpdate");
    const item_details = await fetch_item_details(
      site_url!,
      site_company!.company_prefix,
      account!.id,
      stock_id!,
      kit!,
      undefined,
    );
    const sellable = await fetch_all_sellable_items(
      site_company!,
      account!,
      site_url!,
    );

    const item_inventory = await fetch_all_item_inventory(
      site_company!,
      account!,
      site_url!,
    );

    await setInventory("inventory", sellable || []);
    await setPriceList("priceList", item_inventory || []);
    await setMetadata("metadata", now.toISOString());
    details = item_details;
  }
  return details;
};

export const useInventory = () => {
  const queryClient = useQueryClient();

  const { data, error, isLoading } = useQuery<InventoryItem[], Error>({
    queryKey: ["inventory"],
    queryFn: fetchInventoryData,
    // staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  return {
    inventory: data || [],
    loading: isLoading,
    error: error ? error.message : null,
    refetch: () => queryClient.invalidateQueries({ queryKey: ["inventory"] }),
  };
};

export const useItemDetails = (
  site_url: string,
  site_company: SiteCompany,
  account: UserAccountInfo,
  stock_id?: string,
  kit?: string,
) => {
  return useQuery({
    queryKey: ["itemDetails", stock_id],
    queryFn: () => fetchItemDetails(stock_id, kit),
    enabled: !(stock_id?.length === 0),
    // fetch_item_details(
    //   site_url,
    //   site_company.company_prefix,
    //   account.id,
    //   stock_id!,
    //   kit!,
    //   undefined,
    // ),

    // enabled: !!stock_id && !!kit,
  });
};
