import { create } from "zustand";

interface PaymentCart {
  paymentType?: string;
  payments: Payment[];
}

interface PayState {
  paymentCarts: PaymentCart[];
  addItemToPayments: (item: Payment, paymentType: string) => void;
  removeItemFromPayments: (
    paymentType: string,
    transID: string | number,
  ) => void;
  clearPaymentCarts: () => void;
}

export const usePayStore = create<PayState>((set) => ({
  paymentCarts: [],
  addItemToPayments: (item, paymentType) => {
    set((state) => {
      const existingCartIndex = state.paymentCarts.findIndex(
        (cart) => cart.paymentType === paymentType,
      );

      if (existingCartIndex !== -1) {
        // If paymentType already exists, add item to existing paymentCart
        const updatedPaymentCarts = [...state.paymentCarts];
        updatedPaymentCarts[existingCartIndex] = {
          ...updatedPaymentCarts[existingCartIndex],
          payments: [...updatedPaymentCarts[existingCartIndex]!.payments, item],
        };
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
      paymentCarts: state.paymentCarts.map((cart) =>
        cart.paymentType === paymentType
          ? {
              ...cart,
              payments: cart.payments.filter(
                (payment) => payment.TransID !== transID,
              ),
            }
          : cart,
      ),
    }));
  },
  clearPaymentCarts: () => {
    set({ paymentCarts: [] });
  },
}));
