import type { Board } from '$lib/generated';
import { getConnection } from './connection-store.svelte';

let boardMap = $state<Map<bigint, Board>>(new Map());
let activeBoard = $state<bigint | null>(null);
let initialized = false;
let subscription: any = null;

export function initializeBoardStore() {
  if (initialized) {
    console.log('[BoardStore] Already initialized, skipping');
    return;
  }
  console.log('[BoardStore] Initializing...');
  initialized = true;

  const { conn } = getConnection();

  // Unsubscribe from any existing subscription
  if (subscription) {
    subscription.unsubscribe();
  }
  
  // Subscribe first without listeners to get initial data
  subscription = conn.subscriptionBuilder()
    .onApplied(() => {
      console.log('[BoardStore] Board subscription applied');
      // Clear existing boards and repopulate
      boardMap.clear();
      for (const board of conn.db.board.iter()) {
        boardMap.set(board.boardId, board);
      }
      
      // Set up listeners after initial data is loaded
      conn.db.board.onInsert((ctx, board) => {
        console.log('[BoardStore] Board inserted:', board, 'Event:', ctx.event);
        boardMap.set(board.boardId, board);
        boardMap = new Map(boardMap); // Trigger reactivity
      });

      conn.db.board.onUpdate((_ctx, _old, board) => {
        console.log('[BoardStore] Board updated:', board);
        boardMap.set(board.boardId, board);
        boardMap = new Map(boardMap); // Trigger reactivity
      });

      conn.db.board.onDelete((_ctx, board) => {
        console.log('[BoardStore] Board deleted:', board);
        boardMap.delete(board.boardId);
        boardMap = new Map(boardMap); // Trigger reactivity
        if (activeBoard === board.boardId) {
          activeBoard = null;
        }
      });
    })
    .subscribe(['SELECT * FROM board']);
}

export function useBoardStore() {
  return {
    get boards() { return Array.from(boardMap.values()); },
    get boardMap() { return boardMap; },
    get activeBoard() { return activeBoard; },
    setActiveBoard(boardId: bigint | null) {
      activeBoard = boardId;
    },
    async createBoard(slug: string, title: string) {
      const { conn } = getConnection();
      await conn.reducers.createBoard(slug, title);
    },
    getBoard(boardId: bigint) {
      return boardMap.get(boardId);
    }
  };
}