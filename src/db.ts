import { openDB } from 'idb';
import { Element, BoardItem } from './types';

const DB_NAME = 'InfiniteCraftDB';
const STORE_NAME = 'progress';

export async function initDB() {
  return openDB(DB_NAME, 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore('discoveredElements', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

export async function saveProgress(
  discoveredElements: Element[],
  boardItems: BoardItem[],
  currentTier: number
) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  
  await store.put(discoveredElements, 'discoveredElements');
  await store.put(boardItems, 'boardItems');
  await store.put(currentTier, 'currentTier');
  
  await tx.done;
}

export async function loadProgress(): Promise<{
  discoveredElements: Element[] | null;
  boardItems: BoardItem[] | null;
  currentTier: number | null;
}> {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  
  return {
    discoveredElements: await store.get('discoveredElements'),
    boardItems: await store.get('boardItems'),
    currentTier: await store.get('currentTier'),
  };
}
