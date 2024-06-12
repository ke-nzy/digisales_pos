"use client";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { ContentLayout } from "~/components/common/content-layout";
import ShoppingCart from "~/components/cart";
import InvoiceSummary from "~/components/invoice-summary";
import { useCartStore } from "~/store/cart-store";
import { useAuthStore } from "~/store/auth-store";
const ItemSearchBox = dynamic(() => import("~/components/item-searchbox"), {
  ssr: false,
});
export default function HomePage() {
  const { site_company } = useAuthStore();
  const { loadCart, currentCart } = useCartStore();

  // useEffect(() => {
  //   // Load the most recent cart when the page loads
  //   loadCart("current-cart-id");
  // }, [loadCart]);
  return (
    <ContentLayout title={site_company?.branch ?? ""}>
      <div className=" flex flex-col items-start gap-4  md:flex-row ">
        <div className="">
          <ShoppingCart />
        </div>
        <div className=" sticky top-0 overflow-hidden ">
          <InvoiceSummary />
        </div>
      </div>
      <div className=" sticky bottom-0 z-10 mt-4 bg-zinc-50 p-2  dark:bg-zinc-900">
        <ItemSearchBox />
      </div>
    </ContentLayout>
  );
}
