import type { Card } from '$lib/generated';
import { getConnection } from './connection-store.svelte';
import { StoreRegistry } from './store-registry';

interface CardStore {
  cards: Card[];
  addCard(title: string): Promise<void>;
  completeCard(cardId: bigint): Promise<void>;
  _cleanup?: () => void;
}

const cardStoreRegistry = new StoreRegistry<CardStore>();

function createCardStoreInstance(boardId: bigint): CardStore {
  let cardMap = $state<Map<bigint, Card>>(new Map());
  const { conn } = getConnection();

  // Subscribe first without listeners to get initial data
  const subscription = conn.subscriptionBuilder()
    .onError((ctx, error) => {
      console.error(`[CardStore ${boardId}] Subscription error:`, error);
    })
    .onApplied(() => {
      console.log(`[CardStore ${boardId}] Card subscription applied`);
      // Get initial cards for this board using a Map for deduplication
      cardMap.clear();
      for (const card of conn.db.card.iter()) {
        if (card.boardId === boardId) {
          cardMap.set(card.cardId, card);
        }
      }
      console.log(`[CardStore ${boardId}] Loaded:`, cardMap.size, 'cards');

      // Set up listeners after initial data is loaded
      conn.db.card.onInsert((_ctx, card) => {
        if (card.boardId === boardId) {
          console.log(`[CardStore ${boardId}] Card inserted:`, card);
          cardMap.set(card.cardId, card);
          cardMap = new Map(cardMap); // Trigger reactivity
        }
      });

      conn.db.card.onUpdate((_ctx, _old, card) => {
        if (card.boardId === boardId) {
          console.log(`[CardStore ${boardId}] Card updated:`, card);
          cardMap.set(card.cardId, card);
          cardMap = new Map(cardMap); // Trigger reactivity
        }
      });

      conn.db.card.onDelete((_ctx, card) => {
        if (card.boardId === boardId) {
          console.log(`[CardStore ${boardId}] Card deleted:`, card);
          cardMap.delete(card.cardId);
          cardMap = new Map(cardMap); // Trigger reactivity
        }
      });
    })
    .subscribe([`SELECT * FROM card WHERE BoardId = ${boardId}`]);

  // Cleanup function for when refCount hits 0
  const cleanup = () => {
    console.log(`[CardStore ${boardId}] Cleaning up`);
    subscription.unsubscribe();
  };

  return {
    get cards() { return Array.from(cardMap.values()); },
    async addCard(title: string) {
      await conn.reducers.addCard(boardId, title);
    },
    async completeCard(cardId: bigint) {
      await conn.reducers.completeCard(cardId);
    },
    _cleanup: cleanup
  };
}

export function getCardStore(boardId: bigint): CardStore & { release: () => void } {
  const key = `board-${boardId}`;
  const store = cardStoreRegistry.get(key, () => createCardStoreInstance(boardId));

  return {
    get cards() { return store.cards; },
    addCard: store.addCard,
    completeCard: store.completeCard,
    release: () => cardStoreRegistry.release(key)
  };
}

// Svelte helper hook that automatically manages lifecycle
export function useCardStore(boardId: bigint) {
  const store = getCardStore(boardId);

  $effect(() => {
    return () => store.release();
  });

  return store;
}