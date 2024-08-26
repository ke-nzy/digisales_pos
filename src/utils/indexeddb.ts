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
interface PriceList {
  balance: string;
  description: string;
  kit: string;
  mb_flag: string;
  price: string;
  rate: string;
  stock_id: string;
  units: string;
}

interface Cart {
  cart_id: string;
  items: DirectSales[];
}

interface Database {
  inventory: InventoryItem[];
  carts: Cart[];
  priceList: PriceList[];
  metadata: Record<string, string>;
  // add other items e.g transactions
}

interface Invoice {
  uid: string;
  inv_date: string;
  pos_payments: string;
  pos_items: string;
  synced: boolean;
  synced_at: string;
}

const dbPromise = openDB<Database>("posdatabase", 1, {
  upgrade(db) {
    db.createObjectStore("inventory", { keyPath: "stock_id" });
    db.createObjectStore("carts", { keyPath: "cart_id" });
    db.createObjectStore("priceList", { keyPath: "stock_id" });
    db.createObjectStore("metadata");
    if (!db.objectStoreNames.contains("unsynced_invoices")) {
      db.createObjectStore("unsynced_invoices", { keyPath: "uid" });
    }
  },
});

export const setPriceList = async (
  storeName: keyof Database,
  value: PriceList[],
): Promise<void> => {
  const db = await dbPromise;
  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  for (const item of value) {
    await store.put(item); // Ensure each item has a `stock_id`
  }
  await tx.done;
};

export const getPriceList = async (
  storeName: keyof Database,
  key: string,
): Promise<PriceList[] | undefined> => {
  const db = await dbPromise;
  if (storeName === "priceList") {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const allItems: PriceList[] = await store.getAll();
    return allItems;
  }
  return await db.get(storeName, key);
};

export const getItemPriceDetails = async (
  stock_id: string,
): Promise<PriceList | undefined> => {
  const db = await dbPromise;
  const tx = db.transaction("priceList", "readonly");
  const store = tx.objectStore("priceList");
  const item = await store.get(stock_id);
  if (item) {
    const itemPriceDetails: any = {
      quantity_available: parseFloat(item.balance as string),
      tax_mode: item.rate,
      price: parseFloat(item.price as string),
    };
    return itemPriceDetails;
  }
  return undefined; // Return undefined if no item found
};

export const deletePriceList = async (
  storeName: keyof Database,
  key: string,
): Promise<void> => {
  const db = await dbPromise;
  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  await store.delete(key);
  await tx.done;
};

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

export const updateCart = async (
  cart_id: string,
  newCart: Cart,
): Promise<void> => {
  const db = await dbPromise;
  const tx = db.transaction("carts", "readwrite");
  const store = tx.objectStore("carts");
  const existingCart = await store.get(cart_id);
  if (existingCart) {
    await store.put(newCart);
  } else {
    throw new Error(`Cart with ID ${cart_id} does not exist`);
  }
  await tx.done;
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

export const deleteMetadata = async (): Promise<void> => {
  const db = await dbPromise;
  const tx = db.transaction("metadata", "readwrite");
  const store = tx.objectStore("metadata");
  await store.delete("metadata");
  await tx.done;
};

//  invoices
export const addInvoice = async (invoice: Invoice): Promise<void> => {
  console.log("addInvoice", invoice);
  const db = await dbPromise;
  const tx = db.transaction("unsynced_invoices", "readwrite");
  const store = tx.objectStore("unsynced_invoices");
  await store.put(invoice);
  await tx.done;
};

export const getAllUnsyncedInvoices = async (): Promise<Invoice[]> => {
  const db = await dbPromise;
  const tx = db.transaction("unsynced_invoices", "readonly");
  const store = tx.objectStore("unsynced_invoices");
  return await store.getAll();
};

export const getUnsyncedInvoices = async (): Promise<Invoice[]> => {
  const db = await dbPromise;
  const tx = db.transaction("unsynced_invoices", "readonly");
  const store = tx.objectStore("unsynced_invoices");

  const unsyncedInvoices: Invoice[] = [];
  let cursor = await store.openCursor();

  while (cursor) {
    const invoice = cursor.value as Invoice; // Explicitly type the value as Invoice
    if (!invoice.synced) {
      unsyncedInvoices.push(invoice);
    }
    cursor = await cursor.continue();
  }

  return unsyncedInvoices;
};

export const updateInvoice = async (
  uid: string,
  updatedInvoice: Partial<Invoice>,
): Promise<void> => {
  const db = await dbPromise;
  const tx = db.transaction("unsynced_invoices", "readwrite");
  const store = tx.objectStore("unsynced_invoices");
  const existingInvoice = await store.get(uid);
  if (existingInvoice) {
    const mergedInvoice = { ...existingInvoice, ...updatedInvoice };
    await store.put(mergedInvoice);
  } else {
    throw new Error(`Invoice with UID ${uid} does not exist`);
  }
  await tx.done;
};
