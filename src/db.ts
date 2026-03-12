import { openDB, IDBPDatabase } from 'idb';
import { Element } from './types';

const DB_NAME = 'InfiniteCraftDB';
const STORE_NAME = 'discoveredElements';

export async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}

export async function saveDiscovery(elements: Element[]) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  
  // Clear and re-save for simplicity in this standalone version
  await store.clear();
  for (const el of elements) {
    await store.put(el);
  }
  await tx.done;
}

export async function loadDiscovery(): Promise<Element[]> {
  const db = await initDB();
  return db.getAll(STORE_NAME);
}
