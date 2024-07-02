"use client";
import { Search } from "lucide-react";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "~/components/common/dashboard-layout";
import { DateRangePicker } from "~/components/common/date-range-picker";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  useHeldTransactionsReport,
  usePosTransactionsReport,
} from "~/hooks/use-reports";
import { searchParamsSchema } from "~/lib/utils";
const TransactionCard = dynamic(
  () => import("~/components/common/transaction-card"),
  {
    ssr: false,
  },
);

export interface IndexPageProps {
  searchParams: SearchParams;
}

const TransactionsPage = ({ searchParams }: IndexPageProps) => {
  const params = searchParamsSchema.parse(searchParams);
  const [dateRange, setDateRange] = useState<SearchParams>({
    from: params.from,
    to: params.to,
  });

  const { posTransactionsReport, loading } = usePosTransactionsReport({
    ...dateRange,
  });

  const { heldTransactionsReport, loading: loadingHeld } =
    useHeldTransactionsReport(params);
  // const all = posTransactionsReport.concat(heldTransactionsReport);

  useEffect(() => {
    setDateRange({
      from: params.from,
      to: params.to,
    });
  }, [params.to]);

  if (loading || loadingHeld) {
    return (
      <DashboardLayout title="Transactions">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            <div className="flex flex-col space-y-3">
              <Skeleton className="h-[125px] w-[250px] rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
            <div className="flex flex-col space-y-3">
              <Skeleton className="h-[125px] w-[250px] rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
            <div className="flex flex-col space-y-3">
              <Skeleton className="h-[125px] w-[250px] rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <Skeleton className="h-[125px] w-[250px] rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Transactions">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <React.Suspense fallback={<Skeleton className="h-7 w-52" />}>
          <DateRangePicker
            triggerSize="sm"
            triggerClassName="ml-auto w-56 sm:w-60"
            align="end"
          />
        </React.Suspense>
        <Tabs defaultValue="held">
          <div className="flex items-center">
            <TabsList>
              {/* <TabsTrigger value="all">All</TabsTrigger> */}
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="held">Held</TabsTrigger>
            </TabsList>
            <div className="relative ml-auto flex-1 md:grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
              />
            </div>
          </div>

          {/* <TabsContent value="all">
            <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
              {all.map((x) => (
                <TransactionCard key={x.id} data={x} />
              ))}
            </div>
          </TabsContent> */}
          <TabsContent value="completed">
            <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
              {posTransactionsReport.map((x) => (
                <TransactionCard key={x.id} data={x} status="Completed" />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="held">
            <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
              {heldTransactionsReport.map((x) => (
                <TransactionCard key={x.id} data={x} status="Held" />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </DashboardLayout>
  );
};

export default TransactionsPage;
