"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetch_pos_transactions_report,
  fetch_sales_person_summary_report,
} from "~/lib/actions/user.actions";

import { useAuthStore } from "~/store/auth-store";

const fetchItemizedSalesReport = async (): Promise<SalesReportItem[]> => {
  const { site_company, account, site_url } = useAuthStore.getState();

  // Fetch from API
  const sreport = await fetch_sales_person_summary_report(
    site_company!,
    account!,
    site_url!,
    new Date(),
    new Date(),
  );

  const list = sreport || [];

  return list;
};

const fetchPosTransactionsReport = async (): Promise<
  TransactionReportItem[]
> => {
  const { site_company, account, site_url } = useAuthStore.getState();

  // Fetch from API
  const sreport = await fetch_pos_transactions_report(
    site_company!,
    account!,
    site_url!,
    new Date(),
    new Date(),
  );

  const list = sreport || [];

  return list;
};

export const useItemizedSalesReport = () => {
  const queryClient = useQueryClient();

  const { data, error, isLoading } = useQuery<SalesReportItem[], Error>({
    queryKey: ["salesReport"],
    queryFn: fetchItemizedSalesReport,
    // staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  return {
    salesReport: data || [],
    loading: isLoading,
    error: error ? error.message : null,
    refetch: () => queryClient.invalidateQueries({ queryKey: ["salesReport"] }),
  };
};

export const usePosTransactionsReport = () => {
  const queryClient = useQueryClient();

  const { data, error, isLoading } = useQuery<TransactionReportItem[], Error>({
    queryKey: ["posTransactionsReport"],
    queryFn: fetchPosTransactionsReport,
    // staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  return {
    posTransactionsReport: data || [],
    loading: isLoading,
    error: error ? error.message : null,
    refetch: () =>
      queryClient.invalidateQueries({ queryKey: ["posTransactionsReport"] }),
  };
};
