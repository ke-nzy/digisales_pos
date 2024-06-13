"use client";
import dynamic from "next/dynamic";
import { ContentLayout } from "~/components/common/content-layout";
import { useAuthStore } from "~/store/auth-store";
const ItemSearchBox = dynamic(() => import("~/components/item-searchbox"), {
  ssr: false,
});
const ShoppingCart = dynamic(() => import("~/components/cart"), {
  ssr: false,
});
const InvoiceSummary = dynamic(() => import("~/components/invoice-summary"), {
  ssr: false,
});

export default function HomePage() {
  const { site_company } = useAuthStore();

  return (
    <ContentLayout title={site_company?.branch ?? ""}>
      <div className="flex min-h-[69vh] w-full flex-col items-start gap-4  md:flex-row ">
        <div className="">
          <ShoppingCart />
        </div>
        <div className=" sticky top-0  flex-grow overflow-hidden ">
          <InvoiceSummary />
        </div>
      </div>
      <div className=" sticky bottom-0 z-10 mt-4 bg-zinc-50 p-2  dark:bg-zinc-900">
        <ItemSearchBox />
      </div>
    </ContentLayout>
  );
}
