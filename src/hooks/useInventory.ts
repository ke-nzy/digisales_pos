"use client";

/**
 * Inventory Hook
 *
 * Provides sellable inventory data and per-item price/qty/tax details.
 *
 * CHANGELOG:
 * - [FIX] Removed fetch_all_item_inventory from fetchInventoryData side-effect.
 *   It was fetching the full enhanced inventory on every inventory load unnecessarily.
 * - [FIX] Removed fetch_all_item_inventory from fetchItemDetails entirely.
 *   This was the primary cause of the endpoint being hammered - it was called
 *   once per item lookup, and AmountInput called it for every item in inventory on mount.
 * - [FIX] Added staleTime + refetchOnWindowFocus: false to useInventory to match
 *   the cache strategy already in useEnhancedInventory.
 * - [REMOVED] All IndexedDB read/write logic - system is now always-online.
 * - [REMOVED] forceRefresh param from fetchItemDetails - no longer relevant without IndexedDB.
 *
 * @author Kennedy Ngugi
 * @updated 2026-04-09
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { EnhancedPriceList } from "~/hawk-tuah/types/discount-types";
import {
  fetch_all_sellable_items,
  fetch_item_details,
} from "~/lib/actions/inventory.actions";
import { useAuthStore } from "~/store/auth-store";
import { getItemPriceDetails } from "~/utils/indexeddb";

export type ItemDetails = {
  stock_id: string;
  price: number;
  quantity_available: number;
  tax_mode: number;
};

// ---------------------------------------------------------------------------
// Core inventory fetch - only fetches sellable items list.
// Enhanced inventory (with discounts/balance) is handled by useEnhancedInventory.
// ---------------------------------------------------------------------------
const fetchInventoryData = async (): Promise<InventoryItem[]> => {
  const { site_company, account, site_url } = useAuthStore.getState();

  const sellable = await fetch_all_sellable_items(
    site_company!,
    account!,
    site_url!,
  );

  return sellable ?? [];
};

// ---------------------------------------------------------------------------
// getEnhancedItemData
// Utility: reads enhanced item data (price, discount, balance) from IndexedDB.
// NOTE: This still reads from IndexedDB because useEnhancedInventory populates
// it on app init. If IndexedDB is fully removed in a future phase, this should
// be replaced with a direct lookup from the in-memory enhancedInventoryMap.
// ---------------------------------------------------------------------------
export const getEnhancedItemData = async (
  stock_id: string,
): Promise<EnhancedPriceList | null | undefined> => {
  try {
    return await getItemPriceDetails(stock_id);
  } catch (error) {
    console.error("Failed to get enhanced item data:", error);
    return null;
  }
};

// Fetches price, quantity_available, and tax_mode for a single item.
//
// IMPORTANT: This function previously also called fetch_all_item_inventory
// as a side effect to refresh the IndexedDB cache. That has been removed.
// It was the primary cause of the endpoint being called excessively.
// Item details are now fetched directly and only for the specific item needed.
export const fetchItemDetails = async (
  stock_id?: string,
  kit?: string,
): Promise<ProductPriceDetails | null> => {  
  const { site_company, account, site_url } = useAuthStore.getState();

  if (!stock_id) return null;

  try {
    const item_details = await fetch_item_details(
      site_url!,
      site_company!.company_prefix,
      account!.id,
      stock_id,
      kit ?? "",
      undefined,
    );

    return item_details ?? null;
  } catch (error) {
    console.error(`Error fetching item details for [${stock_id}]:`, error);
    return null;
  }
};

// React Query hook for the sellable inventory list.
// staleTime: 30 min - inventory list doesn't change frequently mid-shift.
// refetchOnWindowFocus: false - prevents refetch every time user alt-tabs,
//   which was causing repeated endpoint hits on a busy POS screen.
export const useInventory = () => {
  const queryClient = useQueryClient();

  const { data, error, isLoading } = useQuery<InventoryItem[], Error>({
    queryKey: ["inventory"],
    queryFn: fetchInventoryData,
    staleTime: 30 * 60 * 1000,     // 30 minutes
    refetchOnWindowFocus: false,    // POS screens don't need refetch on focus
  });

  return {
    inventory: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
    refetch: () => queryClient.invalidateQueries({ queryKey: ["inventory"] }),
  };
};

// Per-item details hook. Fires only when a valid stock_id is present.
// staleTime: 5 min - item details (qty/price) can change more frequently
//   than the full inventory list, so a shorter window is appropriate.
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
    enabled: !!stock_id && stock_id.length > 0,
    retry: 2,
    staleTime: 5 * 60 * 1000,    // 5 minutes - shorter window for live qty
    refetchOnWindowFocus: false,
  });
};