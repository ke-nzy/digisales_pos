"use client";

/**
 * Site Inventory Hook
 *
 * Fetches full inventory across all branches (used by AllInventoryPage).
 * Uses fetchAllItemsInSiteInventory which does NOT filter by branch_code,
 * so it returns all branches - intentional for the all-branches inventory view.
 *
 * CHANGELOG:
 * - [REMOVED] IndexedDB read/write logic - system is now always-online.
 *   Cache is handled entirely by React Query's staleTime.
 * - [REMOVED] Commented-out IndexedDB cache check block (was already disabled).
 * - [FIX] Added staleTime + refetchOnWindowFocus: false to prevent
 *   unnecessary refetches on POS screen focus changes.
 *
 * @author Kennedy Ngugi
 * @updated 2026-04-09
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAllItemsInSiteInventory } from "~/lib/actions/inventory.actions";
import { useAuthStore } from "~/store/auth-store";

// Fetches all-branch inventory. No filtering by branch_code here -
// that filtering happens at the component level in AllInventoryPage.
const fetchSiteInventoryData = async (): Promise<PriceList[]> => {
    const { site_company, site_url } = useAuthStore.getState();

    const siteInventory = await fetchAllItemsInSiteInventory(
        site_company!,
        site_url!,
    );

    return siteInventory ?? [];
};

// Used exclusively by AllInventoryPage (manager/admin inventory view).
// Separate query key from ['inventory'] to avoid collision with
// the POS sellable-items list used by useInventory.
export const useSiteInventory = () => {
    const queryClient = useQueryClient();

    const { data, error, isLoading } = useQuery<PriceList[], Error>({
        queryKey: ["siteInventory"],
        queryFn: fetchSiteInventoryData,
        staleTime: 30 * 60 * 1000,   // 30 minutes
        refetchOnWindowFocus: false,
    });

    return {
        siteInventory: data ?? [],
        loading: isLoading,
        error: error?.message ?? null,
        refetch: () =>
            queryClient.invalidateQueries({ queryKey: ["siteInventory"] }),
    };
};