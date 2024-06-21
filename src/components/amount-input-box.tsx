"use client";
import React, { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

import { useCartStore } from "~/store/cart-store";
import {
  calculateCartTotal,
  calculateDiscount,
  cn,
  tallyTotalAmountPaid,
} from "~/lib/utils";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { useAuthStore } from "~/store/auth-store";
import { usePayStore } from "~/store/pay-store";
import { submit_direct_sale_request } from "~/lib/actions/pay.actions";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";
import { Button } from "./ui/button";

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  paid: number;
  selectedCustomer: Customer | null;
}
const AmountInput = ({
  value,
  onChange,
  paid,
  selectedCustomer,
}: AmountInputProps) => {
  const { site_company, site_url, account } = useAuthStore();
  const { paymentCarts, removeItemFromPayments } = usePayStore();
  const totalPaid = tallyTotalAmountPaid(paymentCarts);
  const { currentCart, clearCart } = useCartStore();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();
  const total = calculateCartTotal(currentCart!);
  const discount = calculateDiscount(currentCart!);
  const balance = total - discount - paid;
  const handleProcessInvoice = async () => {
    if (isLoading) {
      return;
    }
    if (!currentCart) {
      toast.error("Please add items to cart");
      // setIsLoading(false);
      return;
    }
    if (!selectedCustomer) {
      toast.error("Please select a customer");
      // setIsLoading(false);
      return;
    }

    if (totalPaid < total - discount || !totalPaid) {
      toast.error("Insufficient funds");
      return;
    }

    setIsLoading(true);
    try {
      const result = await submit_direct_sale_request(
        site_url!,
        site_company!.company_prefix,
        account!.id,
        account!.user_id,
        currentCart.items,
        selectedCustomer,
        paymentCarts,
        selectedCustomer.br_name,
        Date.now(),
      );
      console.log("result", result);
      if (!result) {
        // sentry.captureException(result);
        toast.error("Transaction failed");
        setIsLoading(false);
        return;
      }

      // process receipt

      toast.success("Invoice processed successfully");
      clearCart();
      router.push("/");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }

    // clearCart();
  };
  return (
    <div className="flex h-full w-full flex-col space-y-6">
      <div className="flex-grow">
        <div className="flex w-full flex-col space-y-4 py-4">
          <Label className="text-xl">Payment</Label>
          <div className="flex w-full flex-row justify-between">
            <span>SubTotal</span>
            <span className="font-semibold">KES {total - discount}</span>
          </div>
          <div className="flex w-full flex-row justify-between gap-6">
            <span className="flex-row py-4">Amount</span>
            <span className="flex-grow">
              <Input
                type="text"
                id="cart-payment"
                placeholder={value}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-14 border-gray-700 bg-transparent px-1 text-right text-xl shadow-none"
              />
            </span>
          </div>
          <Separator className="my-4" />
          <div className="flex w-full flex-row justify-between">
            <span>Balance</span>
            <span
              className={cn(
                "font-semibold",
                balance > 0 ? "text-red-700" : "text-green-800",
              )}
            >
              KES {total - discount - paid}
            </span>
          </div>
        </div>
        <div className="flex w-full flex-col space-y-2">
          <div className="font-semibold">Payment Details</div>
          {paymentCarts.map((cart, index) => (
            <ul key={index} className="grid w-full gap-3">
              <li className="flex items-center">
                <span className="font-medium text-gray-600">
                  {cart.paymentType}
                </span>
              </li>
              {cart.payments.map((detail, index) => (
                <ul key={index} className="grid gap-3 font-normal">
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {detail.TransID}
                    </span>
                    <span className="overflow-hidden text-clip text-center">
                      {detail.name}
                    </span>
                    <span className="text-right">{detail.TransAmount}</span>
                    <span className="text-right">
                      <Trash2Icon
                        onClick={() =>
                          removeItemFromPayments(
                            cart.paymentType!,
                            detail.TransID,
                          )
                        }
                        className="h-6 w-6 cursor-pointer text-red-600 hover:h-4 hover:w-4"
                      />
                    </span>
                  </li>
                </ul>
              ))}
            </ul>
          ))}
        </div>
      </div>
      <div className="flex w-full justify-end px-6">
        <Button
          onClick={handleProcessInvoice}
          variant={"default"}
          className="w-full"
          disabled={isLoading}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default AmountInput;
