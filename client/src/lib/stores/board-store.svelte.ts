import type { Board } from '$lib/generated';
import { getConnection } from './connection-store.svelte';

let boards = $state<Board[]>([]);
let activeBoard = $state<bigint | null>(null);
let initialized = false;

export function initializeBoardStore() {
  if (initialized) return;
  initialized = true;

  const { conn } = getConnection();

  // Set up listeners first
  conn.db.board.onInsert((_ctx, board) => {
    console.log('[BoardStore] Board inserted:', board);
    boards = [...boards, board];
  });

  conn.db.board.onUpdate((_ctx, _old, board) => {
    console.log('[BoardStore] Board updated:', board);
    boards = boards.map((b) => (b.boardId === board.boardId ? board : b));
  });

  // Then subscribe
  conn.subscriptionBuilder()
    .onApplied(() => {
      console.log('[BoardStore] Board subscription applied');
      boards = Array.from(conn.db.board.iter());
    })
    .subscribe(['SELECT * FROM board']);
}

export function useBoardStore() {
  return {
    get boards() { return boards; },
    get activeBoard() { return activeBoard; },
    setActiveBoard(boardId: bigint | null) {
      activeBoard = boardId;
    },
    async createBoard(slug: string, title: string) {
      const { conn } = getConnection();
      await conn.reducers.createBoard(slug, title);
    },
    getBoard(boardId: bigint) {
      return boards.find(b => b.boardId === boardId);
    }
  };
}