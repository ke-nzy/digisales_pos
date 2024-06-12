import { create } from "zustand";
import { setCart, getCart, deleteCart } from "~/utils/indexeddb";
interface Cart {
  cart_id: string;
  items: DirectSales[];
}

interface CartState {
  currentCart: Cart | null;
  addItemToCart: (item: DirectSales) => void;
  saveCart: () => void;
  clearCart: () => void;
  loadCart: (cart_id: string) => void;
  holdCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  currentCart: null,
  addItemToCart: (item: DirectSales) => {
    const state = get();
    if (!state.currentCart) {
      const newCart: Cart = { cart_id: `cart_${Date.now()}`, items: [item] };
      console.log("new cart", newCart);

      set({ currentCart: newCart });
      setCart(newCart).catch((error) =>
        console.error("Failed to set cart:", error),
      );
    } else {
      const updatedCart: Cart = {
        ...state.currentCart,
        items: [...state.currentCart.items, item],
      };
      set({ currentCart: updatedCart });
      setCart(updatedCart).catch((error) =>
        console.error("Failed to update cart:", error),
      );
    }
  },
  saveCart: () => {
    const state = get();
    if (state.currentCart) {
      setCart(state.currentCart).catch((error) =>
        console.error("Failed to save cart:", error),
      );
    }
  },
  clearCart: () => {
    const state = get();
    if (state.currentCart) {
      deleteCart(state.currentCart.cart_id)
        .then(() => set({ currentCart: null }))
        .catch((error) => console.error("Failed to clear cart:", error));
    }
  },
  loadCart: (cart_id: string) => {
    // Wrap async logic in a function
    const loadCartAsync = async () => {
      try {
        const cart = await getCart(cart_id);
        if (cart) {
          set({ currentCart: cart });
        }
      } catch (error) {
        console.error("Failed to load cart:", error);
      }
    };
    // Call the async function
    loadCartAsync().catch((error) =>
      console.error("Failed to load cart:", error),
    );
  },

  holdCart: () => {
    set({ currentCart: null });
  },
}));
