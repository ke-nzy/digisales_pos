"use client";
import { Activity, CreditCard, DollarSign, User, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { DashboardLayout } from "~/components/common/dashboard-layout";
import { DateRangePicker } from "~/components/common/date-range-picker";
import { Avatar } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import {
  useDailySalesTargetReport,
  useHeldTransactionsReport,
  useItemizedSalesReport,
  usePosTransactionsReport,
} from "~/hooks/use-reports";
import { submit_start_shift } from "~/lib/actions/user.actions";
import { useAuthStore } from "~/store/auth-store";
import { IndexPageProps } from "../transactions/page";
import { searchParamsSchema } from "~/lib/utils";

const DashBoard = ({ searchParams }: IndexPageProps) => {
  const params = searchParamsSchema.parse(searchParams);
  const { site_company, account, site_url } = useAuthStore();
  const { posTransactionsReport } = usePosTransactionsReport(params);
  const { heldTransactionsReport } = useHeldTransactionsReport(params);
  const { salesReport, loading: loadingItemizedSalesReport } =
    useItemizedSalesReport();
  const router = useRouter();
  const { dailyTargets, loading, error } = useDailySalesTargetReport();
  console.log("dailyTargets", dailyTargets);

  const shift = localStorage.getItem("start_shift");
  const handleCheckin = async () => {
    if (shift) {
      router.push("/");
    } else {
      console.log("checkin");
      const response = await submit_start_shift(
        site_url!,
        site_company!.company_prefix,
        account!.id,
      );
      if (response?.id) {
        toast.success("Shift started");
        router.push("/");
      } else {
        toast.error("Failed to start shift");
      }
    }
  };
  const completedTrnasactions = posTransactionsReport.length;
  const heldTrnasactions = heldTransactionsReport.length;

  function findTop5PopularItems(
    items: SalesReportItem[],
  ): { parentItem: string; totalQuantity: number }[] {
    // Step 1: Initialize quantityMap
    const quantityMap: Record<string, number> = {};

    // Step 2: Aggregate quantities sold based on parent_item
    items.forEach((item) => {
      const parentItem = item.parent_item;
      const quantity = parseInt(item.quantity, 10); // Parse quantity as integer

      // Initialize quantityMap[parentItem] if it doesn't exist
      if (!quantityMap[parentItem]) {
        quantityMap[parentItem] = 0;
      }

      // Add quantity to quantityMap[parentItem]
      quantityMap[parentItem] += quantity;
    });

    // Step 3: Convert quantityMap to an array of objects for sorting
    const sortedItems = Object.keys(quantityMap).map((parentItem) => ({
      parentItem: parentItem,
      totalQuantity: quantityMap[parentItem], // This is guaranteed to be defined and a number
    }));

    // Step 4: Sort items based on totalQuantity in descending order

    sortedItems.sort((a, b) => b.totalQuantity! - a.totalQuantity!);

    // Step 5: Get the top 5 popular items
    const top5Items = sortedItems.slice(0, 5);

    return top5Items as { parentItem: string; totalQuantity: number }[];
  }
  const popularItems = findTop5PopularItems(salesReport);
  return (
    <DashboardLayout title={site_company?.branch ?? " Digisales"}>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <React.Suspense fallback={<Skeleton className="h-7 w-52" />}>
          <DateRangePicker
            triggerSize="sm"
            triggerClassName="ml-auto w-56 sm:w-60"
            align="end"
          />
        </React.Suspense>
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                KES
                {dailyTargets?.status === "SUCCESS"
                  ? dailyTargets.data.sales_to_date
                  : 0}
                {/* {dailyTargets?.data.sales_to_date &&
                dailyTargets?.data.sales_to_date
                  ? dailyTargets?.data.sales_to_date
                  : 0} */}
              </div>
              <p className="text-xs text-muted-foreground">
                {dailyTargets?.status === "SUCCESS"
                  ? (parseFloat(dailyTargets.data.sales_to_date) /
                      parseFloat(dailyTargets.data.target)) *
                    100
                  : 0}
                % achieved against KES
                {dailyTargets?.status === "SUCCESS"
                  ? dailyTargets.data.target
                  : 0}{" "}
                target
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Transactions
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTrnasactions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Transactions
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{heldTrnasactions}</div>
            </CardContent>
          </Card>

          <div className="flex-col items-center space-y-6 ">
            <Button
              onClick={() => handleCheckin()}
              variant={"default"}
              className="w-full"
            >
              {shift && shift?.length > 0 ? "Continue" : "Start Shift"}
            </Button>
            <div className="grid-col grid gap-4"></div>
          </div>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-8">
              {posTransactionsReport.length > 0 &&
                posTransactionsReport.slice(0, 5).map((item, index) => (
                  <div key={index} className="grid w-full grid-cols-2 ">
                    <div className="flex flex-col space-y-4">
                      <p className="text-sm font-medium leading-none">
                        {item.customername}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {JSON.parse(item.pitems).length} Item(s)
                      </p>
                    </div>
                    <div className="ml-auto flex flex-col justify-start text-xs  font-medium">
                      KES {item.ptotal}
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Held Carts</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-8">
              {heldTransactionsReport.length > 0 &&
                heldTransactionsReport.slice(0, 5).map((item, index) => (
                  <div key={index} className="grid w-full grid-cols-2 ">
                    <div className="flex flex-col space-y-4">
                      <p className="text-sm font-medium leading-none">
                        {item.customername}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.pitems.length > 0
                          ? JSON.parse(item.pitems).length
                          : 0}{" "}
                        Item(s)
                      </p>
                    </div>
                    <div className="ml-auto flex flex-col justify-start text-xs  font-medium">
                      KES {item.ptotal}
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Popular Items</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-8">
              {popularItems.map((item, index) => (
                <div key={index} className="grid w-full grid-cols-2 ">
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">
                      {item.parentItem}
                    </p>
                  </div>
                  <div className="ml-auto flex flex-col justify-start text-xs  font-medium">
                    {item.totalQuantity}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default DashBoard;
