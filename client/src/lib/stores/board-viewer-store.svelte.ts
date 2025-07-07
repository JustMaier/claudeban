import type { Identity } from '@clockworklabs/spacetimedb-sdk';
import { getConnection } from './connection-store.svelte';
import type { BoardViewer } from '$lib/generated';

interface BoardViewerData {
  viewers: Map<string, BoardViewer>; // keyed by Identity hex
  lastUpdate: Date;
}

// Module-level state
let viewersByBoard = $state<Map<bigint, BoardViewerData>>(new Map());
let initialized = false;
let subscription: any = null;
let featureAvailable = false;

export function initializeBoardViewerStore() {
  if (initialized) {
    console.log('[BoardViewerStore] Already initialized, skipping');
    return;
  }
  console.log('[BoardViewerStore] Initializing...');
  initialized = true;

  const { conn } = getConnection();

  // Unsubscribe from any existing subscription
  if (subscription) {
    console.log('[BoardViewerStore] Unsubscribing from previous subscription');
    subscription.unsubscribe();
  }

  // Subscribe first without listeners to get initial data
  subscription = conn.subscriptionBuilder()
    .onApplied(() => {
      console.log('[BoardViewerStore] Board viewer subscription applied');
      // Clear existing viewers and repopulate
      viewersByBoard.clear();

      // Check if boardViewer table exists before accessing it
      if (conn.db.boardViewer) {
        featureAvailable = true;

        // Load initial data
        for (const viewer of conn.db.boardViewer.iter()) {
          addViewer(viewer.boardId, viewer);
        }

        // Set up listeners after initial data is loaded
        conn.db.boardViewer.onInsert((ctx, viewer) => {
          console.log('[BoardViewerStore] Viewer joined:', viewer);
          addViewer(viewer.boardId, viewer);
        });

        // conn.db.boardViewer.onUpdate((ctx, oldViewer, newViewer) => {
        //   console.log('[BoardViewerStore] Viewer updated:', newViewer);
        //   removeViewer(oldViewer.boardId, oldViewer);
        //   addViewer(newViewer.boardId, newViewer);
        // });

        conn.db.boardViewer.onDelete((ctx, viewer) => {
          console.log('[BoardViewerStore] Viewer left:', viewer);
          removeViewer(viewer.boardId, viewer);
        });
      } else {
        console.warn('[BoardViewerStore] boardViewer table not yet available - presence features disabled');
        featureAvailable = false;
      }
    })
    .subscribe(['SELECT * FROM board_viewer']);
}

function addViewer(boardId: bigint, viewer: BoardViewer) {
  let boardData = viewersByBoard.get(boardId);
  if (!boardData) {
    boardData = {
      viewers: new Map(),
      lastUpdate: new Date()
    };
    viewersByBoard.set(boardId, boardData);
  }

  boardData.viewers.set(viewer.identity.toHexString(), viewer);
  boardData.lastUpdate = new Date();
  viewersByBoard = new Map(viewersByBoard); // Trigger reactivity
}

function removeViewer(boardId: bigint, viewer: BoardViewer) {
  const boardData = viewersByBoard.get(boardId);
  if (boardData) {
    boardData.viewers.delete(viewer.identity.toHexString());
    boardData.lastUpdate = new Date();

    // Clean up empty board data
    if (boardData.viewers.size === 0) {
      viewersByBoard.delete(boardId);
    }
    viewersByBoard = new Map(viewersByBoard); // Trigger reactivity
  }
}

// Helper functions that don't need to be in the store object
function getViewersForBoard(boardId: bigint): BoardViewer[] {
  const boardData = viewersByBoard.get(boardId);
  return boardData ? Array.from(boardData.viewers.values()) : [];
}

function getActiveViewerCount(boardId: bigint): number {
  return getViewersForBoard(boardId).length;
}

function getViewerUsers(boardId: bigint): Identity[] {
  // Get unique users (may have multiple tabs)
  const viewers = getViewersForBoard(boardId);
  const uniqueUsers = new Map<string, Identity>();

  viewers.forEach(v => {
    uniqueUsers.set(v.identity.toHexString(), v.identity);
  });

  return Array.from(uniqueUsers.values());
}

async function startViewing(boardId: bigint): Promise<() => void> {
  // Don't start viewing if not initialized
  if (!initialized) {
    console.warn('[BoardViewerStore] Cannot start viewing - store not initialized');
    return () => {};
  }

  const { conn } = getConnection();

  // Check if the boardViewer table and reducers are available
  if (!conn.db.boardViewer || !conn.reducers.startViewingBoard) {
    console.warn('[BoardViewerStore] Board viewer feature not available');
    return () => {};
  }

  try {
    await conn.reducers.startViewingBoard(boardId);

    // Backend handles everything automatically
    return () => {}; // No-op cleanup
  } catch (error) {
    console.error('Failed to start viewing board:', error);
    // Don't throw - just return a no-op cleanup function
    return () => {};
  }
}


// Create singleton store instance
const boardViewerStore = {
  getViewersForBoard,
  getActiveViewerCount,
  getViewerUsers,
  startViewing,

  getBoardActivity(boardId: bigint): { lastUpdate: Date | null; viewerCount: number } {
    const boardData = viewersByBoard.get(boardId);
    return {
      lastUpdate: boardData?.lastUpdate || null,
      viewerCount: boardData?.viewers.size || 0
    };
  },

  get initialized() {
    return initialized;
  },

  get isFeatureAvailable() {
    return featureAvailable;
  }
};

export function useGlobalBoardViewerStore() {
  return boardViewerStore;
}

// Simplified hook for managing board presence lifecycle
export function useBoardPresence(boardId: bigint) {
  // Use regular variable, not reactive state, to avoid infinite loops
  let hasStarted = false;

  // Reactive derived state
  const viewers = $derived(boardViewerStore.getViewerUsers(boardId));
  const viewerCount = $derived(boardViewerStore.getActiveViewerCount(boardId));

  // Start viewing effect - only runs once per boardId
  $effect(() => {
    // Only start viewing if store is initialized and we haven't started for this boardId
    if (boardViewerStore.initialized && !hasStarted) {
      hasStarted = true;
      boardViewerStore.startViewing(boardId).catch(err => {
        console.error('[useBoardPresence] Failed to start viewing:', err);
      });
    }
  });

  // Cleanup effect - separate from start effect
  $effect(() => {
    return () => {
      hasStarted = false;
    };
  });

  return { viewers, viewerCount };
}