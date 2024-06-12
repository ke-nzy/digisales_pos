import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInventory, setCart, getCart, deleteCart } from "~/utils/indexeddb";

export const useInventory = () => {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const data = await getInventory("inventory", "");
      return data || [];
    },
  });
};

export const useCart = (cart_id: string) => {
  return useQuery({
    queryKey: ["cart", cart_id],
    queryFn: async () => {
      const data = await getCart(cart_id);
      return data || { cart_id, items: [] };
    },
  });
};

export const useSaveCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setCart,

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["carts"] });
    },
  });
};

export const useDeleteCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCart,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["carts"] });
    },
  });
};
