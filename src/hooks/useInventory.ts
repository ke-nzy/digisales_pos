"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetch_all_sellable_items,
  fetch_item_details,
} from "~/lib/actions/inventory.actions";
import { useAuthStore } from "~/store/auth-store";
import { getMetadata, setInventory, setMetadata } from "~/utils/indexeddb";

const fetchInventoryData = async (): Promise<InventoryItem[]> => {
  const { site_company, account, site_url } = useAuthStore.getState();
  const lastUpdate = await getMetadata("metadata");
  const now = new Date();
  const aDayAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24);

  //  / console.log("fes", new Date(lastUpdate!) < aDayAgo);

  // if (!lastUpdate || new Date(lastUpdate) < aDayAgo) {
  const sellable = await fetch_all_sellable_items(
    site_company!,
    account!,
    site_url!,
  );

  const list = sellable || [];
  await setMetadata("metadata", now.toISOString());
  await setInventory("inventory", list);
  return list;
  // }

  // TODO: handle fetching from IndexedDB if data is already up-to-date
  return [];
  //   SHOULD WE FETCH FROM INDEXEDDB HERE AS A FALLBACK?
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
    queryFn: () =>
      fetch_item_details(
        site_url,
        site_company.company_prefix,
        account.id,
        stock_id!,
        kit!,
        undefined,
      ),
    enabled: !!stock_id && !!kit,
  });
};
