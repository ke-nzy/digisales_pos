"use client";
import { openDB } from "idb";

interface InventoryItem {
  stock_id: string;
  description: string;
  rate: string;
  kit: string;
  units: string;
  mb_flag: string;
}

interface Cart {
  cart_id: string;
  items: DirectSales[];
}

interface Database {
  inventory: InventoryItem[];
  carts: Cart[];
  metadata: Record<string, string>;
  // add other items e.g transactions
}

const dbPromise = openDB<Database>("posdatabase", 1, {
  upgrade(db) {
    db.createObjectStore("inventory", { keyPath: "stock_id" });
    db.createObjectStore("carts", { keyPath: "cart_id" });
    db.createObjectStore("metadata");
  },
});

export const setInventory = async (
  storeName: keyof Database,
  value: InventoryItem[],
): Promise<void> => {
  const db = await dbPromise;
  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  for (const item of value) {
    await store.put(item); // Ensure each item has a `stock_id`
  }
  await tx.done;
};

export const getInventory = async (
  storeName: keyof Database,
  key: string,
): Promise<InventoryItem[] | undefined> => {
  const db = await dbPromise;
  if (storeName === "inventory") {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const allItems: InventoryItem[] = await store.getAll();
    return allItems;
  }
  return await db.get(storeName, key);
};

export const setCart = async (cart: Cart): Promise<void> => {
  const db = await dbPromise;
  const tx = db.transaction("carts", "readwrite");
  const store = tx.objectStore("carts");
  await store.put(cart);
  await tx.done;
};

export const getCart = async (cart_id: string): Promise<Cart | undefined> => {
  const db = await dbPromise;
  const tx = db.transaction("carts", "readonly");
  const store = tx.objectStore("carts");
  return await store.get(cart_id);
};

export const deleteCart = async (cart_id: string): Promise<void> => {
  const db = await dbPromise;
  const tx = db.transaction("carts", "readwrite");
  const store = tx.objectStore("carts");
  await store.delete(cart_id);
  await tx.done;
};

export const setMetadata = async (
  key: string,
  value: string,
): Promise<void> => {
  const db = await dbPromise;
  const tx = db.transaction("metadata", "readwrite");
  const store = tx.objectStore("metadata");
  await store.put(value, key);
  await tx.done;
};

export const getMetadata = async (key: string): Promise<string | undefined> => {
  const db = await dbPromise;
  return await db.get("metadata", key);
};
