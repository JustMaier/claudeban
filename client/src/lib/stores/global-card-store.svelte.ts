import type { Card } from '$lib/generated';
import type { Identity } from '@clockworklabs/spacetimedb-sdk';
import { getConnection } from './connection-store.svelte';

interface BoardCardData {
  cards: Map<bigint, Card>;
  lastUpdate: Date;
}

class GlobalCardStore {
  // Map<boardId, BoardCardData>
  private cardsByBoard = $state<Map<bigint, BoardCardData>>(new Map());
  private subscription: { unsubscribe: () => void } | null = null;
  private isInitialized = $state(false);
  private error = $state<string | null>(null);

  constructor() {
    this.initialize();
  }

  private initialize() {
    const { conn, id: currentUserId } = getConnection();
    
    if (!currentUserId) {
      console.error('[GlobalCardStore] No user ID available');
      this.error = 'Not connected';
      return;
    }

    // Subscribe to all cards for boards where the current user is a collaborator
    this.subscription = conn.subscriptionBuilder()
      .onError((ctx) => {
        console.error('[GlobalCardStore] Subscription error:', ctx);
        this.error = 'Subscription failed';
      })
      .onApplied(() => {
        console.log('[GlobalCardStore] Subscription applied, loading initial data');
        this.loadInitialData();
        this.setupListeners();
        this.isInitialized = true;
        this.error = null;
      })
      .subscribe([
        // First, let's subscribe to all cards and filter client-side
        // We'll optimize with JOIN later if needed
        'SELECT * FROM card',
        'SELECT * FROM collaborator'
      ]);
  }

  private loadInitialData() {
    const { conn, id: currentUserId } = getConnection();
    
    // Get all boards where current user is a collaborator
    const userBoards = new Set<bigint>();
    for (const collab of conn.db.collaborator.iter()) {
      if (collab.identity.isEqual(currentUserId!)) {
        userBoards.add(collab.boardId);
      }
    }

    // Clear and reload all cards for user's boards
    this.cardsByBoard.clear();
    
    for (const card of conn.db.card.iter()) {
      if (userBoards.has(card.boardId)) {
        this.addCardToStore(card);
      }
    }

    console.log(`[GlobalCardStore] Loaded cards for ${this.cardsByBoard.size} boards`);
  }

  private setupListeners() {
    const { conn, id: currentUserId } = getConnection();

    // Listen for new cards
    conn.db.card.onInsert((_ctx, card) => {
      if (this.isUserBoard(card.boardId)) {
        console.log(`[GlobalCardStore] Card inserted:`, card);
        this.addCardToStore(card);
      }
    });

    // Listen for card updates
    conn.db.card.onUpdate((_ctx, _old, card) => {
      if (this.isUserBoard(card.boardId)) {
        console.log(`[GlobalCardStore] Card updated:`, card);
        this.addCardToStore(card);
      }
    });

    // Listen for card deletions
    conn.db.card.onDelete((_ctx, card) => {
      if (this.isUserBoard(card.boardId)) {
        console.log(`[GlobalCardStore] Card deleted:`, card);
        this.removeCard(card);
      }
    });

    // Listen for collaborator changes that might affect board access
    conn.db.collaborator.onInsert((_ctx, collab) => {
      if (collab.identity.isEqual(currentUserId!)) {
        console.log(`[GlobalCardStore] User added to board ${collab.boardId}`);
        this.loadBoardCards(collab.boardId);
      }
    });

    conn.db.collaborator.onDelete((_ctx, collab) => {
      if (collab.identity.isEqual(currentUserId!)) {
        console.log(`[GlobalCardStore] User removed from board ${collab.boardId}`);
        this.cardsByBoard.delete(collab.boardId);
        this.cardsByBoard = new Map(this.cardsByBoard); // Trigger reactivity
      }
    });
  }

  private isUserBoard(boardId: bigint): boolean {
    const { conn, id: currentUserId } = getConnection();
    
    for (const collab of conn.db.collaborator.iter()) {
      if (collab.boardId === boardId && collab.identity.isEqual(currentUserId!)) {
        return true;
      }
    }
    return false;
  }

  private loadBoardCards(boardId: bigint) {
    const { conn } = getConnection();
    
    for (const card of conn.db.card.iter()) {
      if (card.boardId === boardId) {
        this.addCardToStore(card);
      }
    }
  }

  private addCardToStore(card: Card) {
    let boardData = this.cardsByBoard.get(card.boardId);
    
    if (!boardData) {
      boardData = {
        cards: new Map(),
        lastUpdate: new Date()
      };
      this.cardsByBoard.set(card.boardId, boardData);
    }
    
    boardData.cards.set(card.cardId, card);
    boardData.lastUpdate = new Date();
    
    // Trigger reactivity
    this.cardsByBoard = new Map(this.cardsByBoard);
  }

  private removeCard(card: Card) {
    const boardData = this.cardsByBoard.get(card.boardId);
    
    if (boardData) {
      boardData.cards.delete(card.cardId);
      boardData.lastUpdate = new Date();
      
      // Remove board data if no cards left
      if (boardData.cards.size === 0) {
        this.cardsByBoard.delete(card.boardId);
      }
      
      // Trigger reactivity
      this.cardsByBoard = new Map(this.cardsByBoard);
    }
  }

  // Public API
  getCardsForBoard(boardId: bigint): Card[] {
    const boardData = this.cardsByBoard.get(boardId);
    return boardData ? Array.from(boardData.cards.values()) : [];
  }

  getBoardActivity(boardId: bigint): { lastUpdate: Date | null; cardCount: number } {
    const boardData = this.cardsByBoard.get(boardId);
    return {
      lastUpdate: boardData?.lastUpdate || null,
      cardCount: boardData?.cards.size || 0
    };
  }

  getTotalCardCount(): number {
    let total = 0;
    for (const boardData of this.cardsByBoard.values()) {
      total += boardData.cards.size;
    }
    return total;
  }

  getLoadedBoardIds(): bigint[] {
    return Array.from(this.cardsByBoard.keys());
  }

  // Card operations (delegating to reducer)
  async addCard(boardId: bigint, title: string) {
    const { conn } = getConnection();
    await conn.reducers.addCard(boardId, title);
  }

  async completeCard(cardId: bigint) {
    const { conn } = getConnection();
    await conn.reducers.completeCard(cardId);
  }

  async updateCardStatus(cardId: bigint, newStatus: string) {
    const { conn } = getConnection();
    await conn.reducers.updateCardStatus(cardId, newStatus);
  }

  async reassignCard(cardId: bigint, newAssignee: Identity) {
    const { conn } = getConnection();
    await conn.reducers.reassignCard(cardId, newAssignee);
  }

  // Lifecycle
  destroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    this.cardsByBoard.clear();
    this.isInitialized = false;
  }

  get initialized() {
    return this.isInitialized;
  }

  get lastError() {
    return this.error;
  }
}

// Singleton instance
let globalCardStore: GlobalCardStore | null = null;

export function useGlobalCardStore() {
  if (!globalCardStore) {
    globalCardStore = new GlobalCardStore();
  }
  return globalCardStore;
}