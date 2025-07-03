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
  let cards = $state<Card[]>([]);
  const { conn } = getConnection();

  // Set up listeners first
  conn.db.card.onInsert((_ctx, card) => {
    if (card.boardId === boardId) {
      console.log(`[CardStore ${boardId}] Card inserted:`, card);
      cards = [...cards, card];
    }
  });

  conn.db.card.onUpdate((_ctx, _old, card) => {
    if (card.boardId === boardId) {
      console.log(`[CardStore ${boardId}] Card updated:`, card);
      cards = cards.map((c) => (c.cardId === card.cardId ? card : c));
    }
  });

  conn.db.card.onDelete((_ctx, card) => {
    if (card.boardId === boardId) {
      console.log(`[CardStore ${boardId}] Card deleted:`, card);
      cards = cards.filter((c) => c.cardId !== card.cardId);
    }
  });

  // Then subscribe (after listeners are ready)
  const subscription = conn.subscriptionBuilder()
    .onApplied(() => {
      console.log(`[CardStore ${boardId}] Card subscription applied`);
      // Get initial cards for this board
      cards = Array.from(conn.db.card.iter()).filter(c => c.boardId === boardId);
    })
    .subscribe([`SELECT * FROM card WHERE boardId = ${boardId}`]);

  // Cleanup function for when refCount hits 0
  const cleanup = () => {
    console.log(`[CardStore ${boardId}] Cleaning up`);
    subscription.unsubscribe();
  };

  return {
    get cards() { return cards; },
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