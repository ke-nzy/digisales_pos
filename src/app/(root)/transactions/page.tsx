"use client";
import { Search } from "lucide-react";
import dynamic from "next/dynamic";
import React from "react";
import { DashboardLayout } from "~/components/common/dashboard-layout";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  useHeldTransactionsReport,
  usePosTransactionsReport,
} from "~/hooks/use-reports";
const TransactionCard = dynamic(
  () => import("~/components/common/transaction-card"),
  {
    ssr: false,
  },
);

const TransactionsPage = () => {
  const { posTransactionsReport, loading } = usePosTransactionsReport();
  const { heldTransactionsReport, loading: loadingHeld } =
    useHeldTransactionsReport();
  console.log("posTransactionsReport", heldTransactionsReport);
  const all = posTransactionsReport.concat(heldTransactionsReport);
  if (loading || loadingHeld) {
    return <div>Loading...</div>;
  }
  return (
    <DashboardLayout title="Transactions">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Tabs defaultValue="all">
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="held">Held</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
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

          <TabsContent value="all">
            <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
              {all.map((x) => (
                <TransactionCard key={x.id} data={x} />
              ))}
            </div>
          </TabsContent>
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
