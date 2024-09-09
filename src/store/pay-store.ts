import { toast } from "sonner";
import { create } from "zustand";

interface PaymentCart {
  paymentType?: string;
  payments: Payment[];
}

interface PayState {
  paymentCarts: PaymentCart[];
  paidStatus: boolean;
  addItemToPayments: (item: Payment, paymentType: string) => void;
  removeItemFromPayments: (
    paymentType: string,
    transID: string | number,
  ) => void;
  clearPaymentCarts: () => void;
  setPaidStatus: (status: boolean) => void;
}

export const usePayStore = create<PayState>((set) => ({
  paymentCarts: [],
  paidStatus: false,
  addItemToPayments: (item, paymentType) => {
    set((state) => {
      const existingCartIndex = state.paymentCarts.findIndex(
        (cart) => cart.paymentType === paymentType,
      );

      if (existingCartIndex !== -1) {
        // If paymentType already exists, add item to existing paymentCart
        const updatedPaymentCarts = [...state.paymentCarts];
        console.log("updated items", item);
        console.log(
          "updatedPaymentCarts",
          updatedPaymentCarts[existingCartIndex],
        );

        if (
          updatedPaymentCarts[existingCartIndex]?.paymentType?.includes("CASH")
        ) {
          const newPmnts = updatedPaymentCarts[existingCartIndex].payments.map(
            (payment) => {
              return {
                ...payment, // Copy the existing properties
                TransAmount: (
                  parseFloat(payment.TransAmount as string) +
                  parseFloat(item.TransAmount as string)
                ).toString(), // Sum the amounts and convert back to string
                TransTime: item.TransTime, // Update the time
              };
            },
          );
          console.log("newPmnts", newPmnts);
          updatedPaymentCarts[existingCartIndex] = {
            ...updatedPaymentCarts[existingCartIndex],
            payments: newPmnts,
          };
        } else {
          // check if existing payments already exist based on transaction id
          const existingPaymentIndex = updatedPaymentCarts[
            existingCartIndex
          ]?.payments.findIndex((payment) => payment.TransID === item.TransID);
          if (existingPaymentIndex !== -1) {
            toast.error("Transaction already exists");
            updatedPaymentCarts[existingCartIndex] = {
              ...updatedPaymentCarts[existingCartIndex],
              payments: [...updatedPaymentCarts[existingCartIndex]!.payments],
            };
          } else {
            updatedPaymentCarts[existingCartIndex] = {
              ...updatedPaymentCarts[existingCartIndex],
              payments: [
                ...updatedPaymentCarts[existingCartIndex]!.payments,
                item,
              ],
            };
          }
        }

        return { paymentCarts: updatedPaymentCarts };
      } else {
        // If paymentType does not exist, create a new paymentCart
        return {
          paymentCarts: [
            ...state.paymentCarts,
            { paymentType: paymentType || "", payments: [item] },
          ],
        };
      }
    });
  },
  removeItemFromPayments: (paymentType, transID) => {
    set((state) => ({
      paymentCarts: state.paymentCarts
        .map((cart) =>
          cart.paymentType === paymentType
            ? {
                ...cart,
                payments: cart.payments.filter(
                  (payment) => payment.TransID !== transID,
                ),
              }
            : cart,
        )
        .filter((cart) => cart.payments.length > 0), // Remove paymentCart if payments array is empty
    }));
  },
  clearPaymentCarts: () => {
    set({ paymentCarts: [] });
  },
  setPaidStatus: (status) => {
    set({ paidStatus: status });
  },
}));
