"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetch_daily_sales_target_summary,
  fetch_held_transactions_report,
  fetch_pos_transactions_report,
  fetch_sales_person_summary_report,
} from "~/lib/actions/user.actions";

import { useAuthStore } from "~/store/auth-store";

interface DateParams {
  from?: string;
  to?: string;
}
const fetchItemizedSalesReport = async (
  params: DateParams,
): Promise<SalesReportItem[]> => {
  const { site_company, account, site_url } = useAuthStore.getState();

  // Fetch from API
  const sreport = await fetch_sales_person_summary_report(
    site_company!,
    account!,
    site_url!,
    params.from,
    params.to,
  );

  const list = sreport || [];

  return list;
};
const fetchDailyTargetsReport =
  async (): Promise<DailyTargetReportSummary | null> => {
    const { site_company, account, site_url } = useAuthStore.getState();

    // Fetch from API
    const streport = await fetch_daily_sales_target_summary(
      site_url!,
      site_company!.company_prefix,
      new Date(),
      account!.default_store,
    );

    const list = streport;

    return list;
  };
const fetchPosTransactionsReport = async (
  params: DateParams,
): Promise<TransactionReportItem[]> => {
  const { site_company, account, site_url } = useAuthStore.getState();

  // Fetch from API
  const sreport = await fetch_pos_transactions_report(
    site_company!,
    account!,
    site_url!,
    params.from,
    params.to,
  );

  const list = sreport || [];

  return list;
};
const fetchHeldTransactionsReport = async (
  params: DateParams,
): Promise<TransactionReportItem[]> => {
  const { site_company, account, site_url } = useAuthStore.getState();

  // Fetch from API
  const sreport = await fetch_held_transactions_report(
    site_company!,
    account!,
    site_url!,
    params.from,
    params.to,
  );

  const list = sreport || [];

  return list;
};

export const useItemizedSalesReport = (params: DateParams) => {
  const queryClient = useQueryClient();

  const { data, error, isLoading } = useQuery<SalesReportItem[], Error>({
    queryKey: ["salesReport"],
    queryFn: () => fetchItemizedSalesReport(params),
    // staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  return {
    salesReport: data || [],
    loading: isLoading,
    error: error ? error.message : null,
    refetch: () => queryClient.invalidateQueries({ queryKey: ["salesReport"] }),
  };
};

export const usePosTransactionsReport = (params: DateParams) => {
  const queryClient = useQueryClient();

  const { data, error, isLoading } = useQuery<TransactionReportItem[], Error>({
    queryKey: ["posTransactionsReport", params.to],
    queryFn: () => fetchPosTransactionsReport(params),
    // staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  return {
    posTransactionsReport: data || [],
    loading: isLoading,
    error: error ? error.message : null,
    refetch: () =>
      queryClient.invalidateQueries({
        queryKey: ["posTransactionsReport", params.to],
      }),
  };
};
export const useHeldTransactionsReport = (params: DateParams) => {
  const queryClient = useQueryClient();

  const { data, error, isLoading } = useQuery<TransactionReportItem[], Error>({
    queryKey: ["heldTransactionsReport", params.to],
    queryFn: () => fetchHeldTransactionsReport(params),
    // staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  return {
    heldTransactionsReport: data || [],
    loading: isLoading,
    error: error ? error.message : null,
    refetch: () =>
      queryClient.invalidateQueries({
        queryKey: ["heldTransactionsReport", params.to],
      }),
  };
};

export const useDailySalesTargetReport = () => {
  const queryClient = useQueryClient();

  const { data, error, isLoading } = useQuery<
    DailyTargetReportSummary | null,
    Error
  >({
    queryKey: ["posDailySalesReport"],
    queryFn: fetchDailyTargetsReport,
    // staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  return {
    dailyTargets: data,
    loading: isLoading,
    error: error ? error.message : null,
    refetch: () =>
      queryClient.invalidateQueries({ queryKey: ["posDailySalesReport"] }),
  };
};
