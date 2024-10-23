"use client";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

import { useCartStore } from "~/store/cart-store";
import {
  toDate,
  calculateCartTotal,
  calculateDiscount,
  cn,
  generateRandomString,
  tallyTotalAmountPaid,
} from "~/lib/utils";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { useAuthStore } from "~/store/auth-store";
import { usePayStore } from "~/store/pay-store";
import { submit_direct_sale_request } from "~/lib/actions/pay.actions";
import { useRouter } from "next/navigation";
import { Loader2, Trash2Icon } from "lucide-react";
import { Button } from "./ui/button";
import TransactionReceiptPDF from "./sales-themal-receipt";
import { pdf } from "@react-pdf/renderer";
import { fetch_pos_transactions_report } from "~/lib/actions/user.actions";
import { addInvoice } from "~/utils/indexeddb";
import OfflineTransactionReceiptPDF from "./pdfs/offlineprint";
import { checkItemQuantities, highlightProblematicItems } from "./temporaryFixes";
import { useInventory, useItemDetails } from "~/hooks/useInventory";

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  paid: number;
  selectedCustomer: Customer | null;
  pin: string;
  setPin: (pin: string) => void;
}
const AmountInput = ({
  value,
  onChange,
  paid,
  selectedCustomer,
  pin,
  setPin,
}: AmountInputProps) => {
  const { site_company, site_url, account, receipt_info } = useAuthStore();
  const {
    paidStatus,
    paymentCarts,
    removeItemFromPayments,
    clearPaymentCarts,
    setPaidStatus,
  } = usePayStore();

  const totalPaid = tallyTotalAmountPaid(paymentCarts);
  const { currentCart, clearCart, currentCustomer, setCurrentCustomer } =
    useCartStore();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPrinted, setIsPrinted] = useState<boolean>(false);


  type ItemDetails = {
    stock_id: string;
    price: number;
    quantity_available: number;
    tax_mode: number;
  };


  const { inventory } = useInventory();  // Fetch the entire inventory
  const allDetails: ItemDetails[] = [];

  inventory.forEach(item => {
    const { data: details } = useItemDetails(
      site_url!,
      site_company!,
      account!,
      item.stock_id,
      item.kit ?? ""
    );

    if (details) {
      allDetails.push({
        stock_id: item.stock_id,
        price: details.price,
        quantity_available: details.quantity_available,
        tax_mode: details.tax_mode
      });
    }
  });

  console.log("All details", allDetails);

  const router = useRouter();
  useEffect(() => {
    setCurrentCustomer(selectedCustomer);
  }, [selectedCustomer]);

  useEffect(() => {
    if (!currentCart && !paidStatus) {
      router.push("/");
    } else if (!currentCart && paidStatus) {
      router.push("/payment/paid");
    }
  }, [currentCart, router, paidStatus]);

  const total = calculateCartTotal(currentCart!);
  const discount = calculateDiscount(currentCart!);
  const balance = total - discount - paid;

  // const updateCashPayments = (
  //   paymentCart: PaymentCart[],
  //   invoiceTotal: number,
  // ): PaymentCart[] => {
  //   console.log("paymentCart", paymentCart);
  //   console.log("invoiceTotal", invoiceTotal);
  //   return paymentCart.map((cart) => {
  //     if (cart.paymentType?.includes("CASH")) {
  //       const totalCashPayments = cart.payments.reduce((total, payment) => {
  //         return total + typeof payment.TransAmount === "string"
  //           ? parseFloat(payment.TransAmount as string)
  //           : parseFloat(payment.TransAmount.toString());
  //       }, 0);

  //       console.log("totalCashPayments", totalCashPayments);
  //       const otherpayments = paymentCart.filter(
  //         (payment) => !payment.paymentType?.includes("CASH"),
  //       );

  //       // export const tallyTotalAmountPaid = (
  //       //   paymentCarts: PaymentCart[],
  //       // ): number => {
  //       //   return paymentCarts.reduce((total, cart) => {
  //       //     const cartTotal = cart.payments.reduce((cartSum, payment) => {
  //       //       const amount =
  //       //         typeof payment.TransAmount === "string"
  //       //           ? parseFloat(payment.TransAmount)
  //       //           : payment.TransAmount;
  //       //       return cartSum + (isNaN(amount) ? 0 : amount);
  //       //     }, 0);
  //       //     return total + cartTotal;
  //       //   }, 0);
  //       // };

  //       const totalOtherPayments = otherpayments.reduce((total, payment) => {
  //         const totals = payment.payments.reduce((total, payment) => {
  //           return total + typeof payment.TransAmount === "string"
  //             ? parseFloat(payment.TransAmount as string)
  //             : parseFloat(payment.TransAmount.toString());
  //         }, 0);
  //         return total + totals;
  //       }, 0);

  //       console.log("otherpayments", otherpayments);
  //       console.log("totalOtherPayments", totalOtherPayments);
  //       console.log("newCash", invoiceTotal - totalOtherPayments);
  //       console.log("cart", cart);

  //       if (totalCashPayments > invoiceTotal) {
  //         const updatedPayments: Payment[] = [
  //           {
  //             Auto: generateRandomString(6),
  //             name: generateRandomString(6),
  //             TransID: ` CASH ${generateRandomString(4)}`,
  //             TransAmount: (invoiceTotal - totalOtherPayments).toString(),
  //             TransTime: new Date().toISOString(),
  //             Transtype: cart.paymentType,
  //             balance: totalCashPayments - invoiceTotal,
  //           },
  //         ];

  //         return {
  //           ...cart,
  //           payments: updatedPayments,
  //         };
  //       }
  //     }

  //     return cart;
  //   });
  // };

  const updateCashPayments = (
    paymentCart: PaymentCart[],
    invoiceTotal: number,
  ): PaymentCart[] => {
    console.log("paymentCart", paymentCart);
    console.log("invoiceTotal", invoiceTotal);

    return paymentCart.map((cart) => {
      if (cart.paymentType?.includes("CASH")) {
        const totalCashPayments = cart.payments.reduce((total, payment) => {
          const amount =
            typeof payment.TransAmount === "string"
              ? parseFloat(payment.TransAmount)
              : parseFloat(payment.TransAmount.toString());
          return total + (isNaN(amount) ? 0 : amount);
        }, 0);

        console.log("totalCashPayments", totalCashPayments);

        // Filter out other payment types that are not 'CASH'
        const otherPayments = paymentCart.filter(
          (payment) => !payment.paymentType?.includes("CASH"),
        );

        // Calculate the total for non-cash payments
        const totalOtherPayments = otherPayments.reduce((total, payment) => {
          const totals = payment.payments.reduce((total, payment) => {
            const amount =
              typeof payment.TransAmount === "string"
                ? parseFloat(payment.TransAmount)
                : parseFloat(payment.TransAmount.toString());
            return total + (isNaN(amount) ? 0 : amount);
          }, 0);
          return total + totals;
        }, 0);

        console.log("otherPayments", otherPayments);
        console.log("totalOtherPayments", totalOtherPayments);

        // Calculate the new cash payment value based on invoice total
        const newCashAmount = invoiceTotal - totalOtherPayments;

        console.log("newCashAmount", newCashAmount);
        console.log("cart", cart);

        if (totalCashPayments + totalOtherPayments > invoiceTotal) {
          // If total payments exceed invoice total, calculate the balance
          const totalPaid = totalCashPayments + totalOtherPayments;
          const overPayment = totalPaid - invoiceTotal;
          const adjustedCashAmount = newCashAmount > 0 ? newCashAmount : 0;

          console.log("overPayment", overPayment);
          console.log("adjustedCashAmount", adjustedCashAmount);

          const updatedPayments: Payment[] = [
            {
              Auto: generateRandomString(6),
              name: generateRandomString(6),
              TransID: ` CASH ${generateRandomString(4)}`,
              TransAmount: adjustedCashAmount.toString(),
              TransTime: new Date().toISOString(),
              Transtype: cart.paymentType,
              balance: overPayment, // The balance should reflect the overpayment
            },
          ];

          return {
            ...cart,
            payments: updatedPayments,
          };
        }
      }

      return cart;
    });
  };

  const handleProcessInvoice = async () => {
    if (isLoading) {
      return;
    }

    if (!currentCart) {
      toast.error("Please add items to cart");
      return;
    }

    if (!currentCustomer) {
      toast.error("Please select a customer");
      return;
    }

    if (totalPaid < total - discount || !totalPaid) {
      toast.error("Insufficient funds");
      return;
    }

    // Check item quantities in the cart based on available inventory
    const { isValid, invalidItems = [] } = await checkItemQuantities(currentCart.items, allDetails);
    console.log("quantitiesAreValid:", isValid);
    console.log("currentCart.items:", currentCart.items);

    if (!isValid) {
      // Highlight problematic items in the cart
      highlightProblematicItems(currentCart.items, allDetails);

      // Create an error message listing the problematic items
      const invalidItemsMessage = invalidItems
        .map(item => `${item.item.description} (Requested: ${item.quantity})`)
        .join(", ");

      // Show a toast error with the problematic items
      toast.error(`Error! Quantities are insufficient for the following items: ${invalidItemsMessage}`);
      return; // Stop the process if quantities are invalid
    }

    const pmnts = updateCashPayments(paymentCarts, total);
    console.log("pmnts", pmnts);

    setIsLoading(true);

    console.log("currentCart-submit");
    try {
      const result = await submit_direct_sale_request(
        site_url!,
        site_company!.company_prefix,
        account!.id,
        account!.user_id,
        currentCart.items,
        currentCustomer,
        pmnts,
        currentCustomer.br_name,
        currentCart.cart_id,
        pin,
      );
      console.log("result", result);

      if (!result) {
        toast.error("Transaction failed");
        setIsLoading(false);
        return;
      } else if (result && (result as OfflineSalesReceiptInformation).offline) {
        await addInvoice(result as OfflineSalesReceiptInformation);
        toast.info("Transaction saved Offline");
        await handleOfflinePrint(result as UnsynchedInvoice);
        clearCart();
        clearPaymentCarts();
        setPin("");
        setIsLoading(false);
        return;
      } else {
        toast.success("Invoice processed successfully");
        console.log("result", result);

        if (result as SalesReceiptInformation) {
          await handlePrint(result as SalesReceiptInformation);

          localStorage.setItem(
            "transaction_history",
            JSON.stringify(result as SalesReceiptInformation),
          );
          clearCart();
          clearPaymentCarts();
          setPaidStatus(true);
        } else {
          toast.error("Failed to print - Could not find transaction");
          setIsPrinted(false);
        }
        setPin("");
      }

      if (!(result as OfflineSalesReceiptInformation).offline && result) {
        clearCart();
        clearPaymentCarts();
        setPaidStatus(true);
      }
    } catch (error) {
      console.error("Something went wrong", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };


  const handlePrint = async (data: SalesReceiptInformation) => {
    try {
      console.log("handlePrint", data);
      setPaidStatus(true);

      const pdfBlob = await pdf(
        <TransactionReceiptPDF
          data={data}
          receipt_info={receipt_info!}
          account={account!}
          duplicate={true}
        />,
      ).toBlob();

      console.log("pdfBlob", pdfBlob);

      const url = URL.createObjectURL(pdfBlob);
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.zIndex = "1000";
      iframe.src = url;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        iframe.focus();
        iframe.contentWindow!.print();
        iframe.contentWindow!.onafterprint = () => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(url); // Revoke the URL to free up resources
          setIsPrinted(true);
        };
      };
      const cleanup = () => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(url);
        setIsPrinted(true);

        // Force reload or redirection after printing to ensure no page residue
        window.location.reload(); // or window.history.back(); if you want to return to the previous page
      };

      iframe.contentWindow!.onafterprint = cleanup;

      // Fallback to force cleanup in case onafterprint fails
      setTimeout(cleanup, 50000);
    } catch (error) {
      console.error("Failed to print document:", error);
      toast.error("Failed to print document");
      setIsPrinted(false);
    }
  };

  const handleOfflinePrint = async (data: UnsynchedInvoice) => {
    try {
      console.log("handlePrint", data);
      setPaidStatus(true);

      const pdfBlob = await pdf(
        <OfflineTransactionReceiptPDF
          data={data}
          receipt_info={receipt_info!}
          account={account!}
          duplicate={true}
        />,
      ).toBlob();
      const url = URL.createObjectURL(pdfBlob);
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.zIndex = "1000";
      iframe.src = url;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        iframe.focus();
        iframe.contentWindow!.print();
        iframe.contentWindow!.onafterprint = () => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(url); // Revoke the URL to free up resources
          setIsPrinted(true);
        };
      };
    } catch (error) {
      console.error("Failed to print document:", error);
      toast.error("Failed to print document");
      setIsPrinted(false);
    }
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
                <ul key={index} className="grid w-full gap-3 font-normal">
                  <li className="flex w-full items-center justify-between space-x-4 px-2">
                    <span className="text-muted-foreground">
                      {detail.TransID}
                    </span>
                    <span className="flex-grow overflow-hidden text-clip text-center">
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
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" /> &nbsp;
            </>
          ) : (
            <>Submit</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AmountInput;