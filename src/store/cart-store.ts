import { toast } from "sonner";
import { create } from "zustand";
import { setCart, getCart, deleteCart } from "~/utils/indexeddb";

interface CartState {
  selectedCartItem: DirectSales | null;
  currentCart: Cart | null;
  addItemToCart: (item: DirectSales) => void;
  deleteItemFromCart: (item: DirectSales) => void;
  update_cart_item: (item: DirectSales) => void;
  saveCart: () => void;
  clearCart: () => void;
  loadCart: (cart_id: string) => void;
  holdCart: () => void;
  setSelectedCartItem: (item: DirectSales | null) => void;
}

const LOCAL_STORAGE_KEY = "currentCart";

export const useCartStore = create<CartState>((set, get) => ({
  selectedCartItem: null,
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
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newCart));
    } else {
      const existingItemIndex = state.currentCart.items.findIndex(
        (cartItem) =>
          cartItem.item.stock_id === item.item.stock_id &&
          cartItem.item.description === item.item.description,
      );

      if (existingItemIndex !== -1) {
        const existingItem = state.currentCart.items[existingItemIndex];
        if (existingItem!.quantity + item.quantity > item.max_quantity) {
          toast.error("You can't add more than the max quantity");
        }
        const newQuantity = Math.min(
          existingItem!.quantity + item.quantity,
          item.max_quantity,
        );

        const updatedItems = state.currentCart.items.map((cartItem, index) =>
          index === existingItemIndex
            ? { ...cartItem, quantity: newQuantity }
            : cartItem,
        );

        const updatedCart: Cart = {
          ...state.currentCart,
          items: updatedItems,
        };

        set({ currentCart: updatedCart });
        setCart(updatedCart).catch((error) =>
          console.error("Failed to update cart:", error),
        );
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedCart));
      } else {
        const updatedCart: Cart = {
          ...state.currentCart,
          items: [...state.currentCart.items, item],
        };
        set({ currentCart: updatedCart });
        setCart(updatedCart).catch((error) =>
          console.error("Failed to update cart:", error),
        );
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedCart));
      }
    }
  },
  deleteItemFromCart: (item: DirectSales) => {
    const state = get();
    if (state.currentCart) {
      const updatedItems = state.currentCart.items.filter(
        (cartItem) => cartItem.item.description !== item.item.description,
      );

      const updatedCart: Cart = {
        ...state.currentCart,
        items: updatedItems,
      };

      set({ currentCart: updatedCart });
      setCart(updatedCart).catch((error) =>
        console.error("Failed to update cart:", error),
      );
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedCart));
    }
  },
  update_cart_item: (item: DirectSales) => {
    const previous = [...get().currentCart!.items] as DirectSales[];
    const new_state = previous.map((x) => {
      if (
        x.item.stock_id === item.item.stock_id &&
        x.item.description === item.item.description
      ) {
        return item;
      }
      return x;
    });

    set({ currentCart: { ...get().currentCart!, items: new_state } });
  },
  saveCart: () => {
    const state = get();
    if (state.currentCart) {
      setCart(state.currentCart).catch((error) =>
        console.error("Failed to save cart:", error),
      );
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(state.currentCart),
      );
    }
  },
  clearCart: () => {
    const state = get();
    if (state.currentCart) {
      deleteCart(state.currentCart.cart_id)
        .then(() => set({ currentCart: null }))
        .catch((error) => console.error("Failed to clear cart:", error));
      localStorage.removeItem(LOCAL_STORAGE_KEY);
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
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  },
  setSelectedCartItem: (item: DirectSales | null) => {
    set({ selectedCartItem: item });
  },
}));

const loadCartFromLocalStorage = () => {
  const storedCart = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (storedCart) {
    useCartStore.setState({ currentCart: JSON.parse(storedCart) });
  }
};

loadCartFromLocalStorage();
