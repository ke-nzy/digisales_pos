"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetch_all_item_inventory,
  fetch_branch_inventory,
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
  const thirtyAgo = new Date(now.getTime() - 1000 * 60 * 30); // 30 minutes ago
  let list: InventoryItem[] = [];

  console.log("Last Update Timestamp:", lastUpdate);
  console.log("Current Time:", now);
  console.log("Thirty Minutes Ago:", thirtyAgo);

  // if (lastUpdate) {
  //   if (new Date(lastUpdate) >= thirtyAgo) {
  //     console.log("Fetching inventory from IndexedDB");
  //     const inventory = await getInventory("inventory", "");
  //     if (inventory) {
  //       list = inventory;
  //       return list;
  //     }
  //   }
  // }

  // console.log("Forcing fetch from API for testing.");
  const sellable = await fetch_all_sellable_items(
    site_company!,
    account!,
    site_url!,
  );

  const branchInventory = await fetch_branch_inventory(
    site_company!,
    account!,
    site_url!,
  );

  const item_inventory = await fetch_all_item_inventory(
    site_company!,
    site_url!,
    account!,
  );

  await setInventory("inventory", sellable || []);
  await setPriceList("priceList", item_inventory || []);
  await setMetadata("metadata", now.toISOString());
  list = sellable || [];

  return list;
};

export const fetchItemDetails = async (stock_id?: string, kit?: string, forceRefresh = true): Promise<any> => {
  const { site_company, account, site_url } = useAuthStore.getState();
  const lastUpdate = await getMetadata("metadata");
  const now = new Date();
  const thirtyAgo = new Date(now.getTime() - 1000 * 60 * 30); // 30 minutes ago
  let details;

  // Snippet determines whether to fetch from API or IndexedDB
  if (forceRefresh || !lastUpdate || new Date(lastUpdate) <= thirtyAgo) {
    // Fetch from Endpoint if forced or data is older than 30 minutes
    console.log("Fetching item details from Endpoint");

    try {
      const item_details = await fetch_item_details(
        site_url!,
        site_company!.company_prefix,
        account!.id,
        stock_id!,
        kit!,
        undefined,
      );

      // Handle response and store it in IndexedDB
      const sellable = await fetch_all_sellable_items(site_company!, account!, site_url!);
      const item_inventory = await fetch_all_item_inventory(site_company!, site_url!, account!);

      await setInventory("inventory", sellable || []);
      await setPriceList("priceList", item_inventory || []);
      await setMetadata("metadata", now.toISOString());

      details = item_details;
    } catch (error) {
      console.error("Error fetching item details from API:", error);
      details = await getItemPriceDetails(stock_id!); // Fallback to IndexedDB on error
    }

    return details;
  } else {
    // Fetch from IndexedDB if data is within the last 30 minutes
    console.log("Fetching item details from IndexedDB");
    console.log("stock_id:", stock_id);
    const itemDetails = await getItemPriceDetails(stock_id!);

    if (itemDetails) {
      details = itemDetails;
    } else {
      details = {
        price: "0",
        quantity_available: "0",
        tax_mode: "0",
      };
    }
    return details;
  }
};



export const useInventory = () => {
  const queryClient = useQueryClient();

  const { data, error, isLoading } = useQuery<InventoryItem[], Error>({
    queryKey: ["inventory"],
    queryFn: fetchInventoryData,
  });

  // Log the final inventory data, loading state, and any errors
  // console.log("Inventory Data:", data);
  console.log("Is Loading:", isLoading);
  console.log("Error:", error);

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
    retry: 2
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


