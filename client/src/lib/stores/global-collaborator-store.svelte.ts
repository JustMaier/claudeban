import type { Collaborator } from '$lib/generated';
import type { Identity } from '@clockworklabs/spacetimedb-sdk';
import { getConnection } from './connection-store.svelte';
import { idMatch } from '$lib/utils/db-utils';

interface BoardCollaboratorData {
  collaborators: Map<string, Collaborator>; // keyed by identity hex string
  lastUpdate: Date;
}

class GlobalCollaboratorStore {
  // Map<boardId, BoardCollaboratorData>
  private collaboratorsByBoard = $state<Map<bigint, BoardCollaboratorData>>(new Map());
  private subscription: { unsubscribe: () => void } | null = null;
  private isInitialized = $state(false);
  private error = $state<string | null>(null);

  constructor() {
    this.initialize();
  }

  private initialize() {
    const { conn, id: currentUserId } = getConnection();
    
    if (!currentUserId) {
      console.error('[GlobalCollaboratorStore] No user ID available');
      this.error = 'Not connected';
      return;
    }

    // Subscribe to collaborators
    this.subscription = conn.subscriptionBuilder()
      .onError((ctx) => {
        console.error('[GlobalCollaboratorStore] Subscription error:', ctx);
        this.error = 'Subscription failed';
      })
      .onApplied(() => {
        console.log('[GlobalCollaboratorStore] Subscription applied, loading initial data');
        this.loadInitialData();
        this.setupListeners();
        this.isInitialized = true;
        this.error = null;
      })
      .subscribe(['SELECT * FROM collaborator']);
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

    // Clear and reload all collaborators for user's boards
    this.collaboratorsByBoard.clear();
    
    for (const collab of conn.db.collaborator.iter()) {
      if (userBoards.has(collab.boardId)) {
        this.addCollaboratorToStore(collab);
      }
    }

    console.log(`[GlobalCollaboratorStore] Loaded collaborators for ${this.collaboratorsByBoard.size} boards`);
  }

  private setupListeners() {
    const { conn, id: currentUserId } = getConnection();

    // Listen for new collaborators
    conn.db.collaborator.onInsert((_ctx, collab) => {
      // If the current user is a collaborator on this board, track all collaborators
      if (this.isUserBoard(collab.boardId)) {
        console.log(`[GlobalCollaboratorStore] Collaborator added:`, collab);
        this.addCollaboratorToStore(collab);
      }
      
      // If the current user was just added to a board, load all collaborators for that board
      if (collab.identity.isEqual(currentUserId!)) {
        console.log(`[GlobalCollaboratorStore] User added to board ${collab.boardId}, loading board collaborators`);
        this.loadBoardCollaborators(collab.boardId);
      }
    });

    // Listen for collaborator removals
    conn.db.collaborator.onDelete((_ctx, collab) => {
      console.log(`[GlobalCollaboratorStore] Collaborator removed:`, collab);
      
      // If the current user was removed from a board, remove all data for that board
      if (collab.identity.isEqual(currentUserId!)) {
        console.log(`[GlobalCollaboratorStore] User removed from board ${collab.boardId}`);
        this.collaboratorsByBoard.delete(collab.boardId);
        this.collaboratorsByBoard = new Map(this.collaboratorsByBoard); // Trigger reactivity
      } else if (this.isUserBoard(collab.boardId)) {
        // Otherwise just remove the specific collaborator
        this.removeCollaborator(collab);
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

  private loadBoardCollaborators(boardId: bigint) {
    const { conn } = getConnection();
    
    for (const collab of conn.db.collaborator.iter()) {
      if (collab.boardId === boardId) {
        this.addCollaboratorToStore(collab);
      }
    }
  }

  private addCollaboratorToStore(collab: Collaborator) {
    let boardData = this.collaboratorsByBoard.get(collab.boardId);
    
    if (!boardData) {
      boardData = {
        collaborators: new Map(),
        lastUpdate: new Date()
      };
      this.collaboratorsByBoard.set(collab.boardId, boardData);
    }
    
    boardData.collaborators.set(collab.identity.toHexString(), collab);
    boardData.lastUpdate = new Date();
    
    // Trigger reactivity
    this.collaboratorsByBoard = new Map(this.collaboratorsByBoard);
  }

  private removeCollaborator(collab: Collaborator) {
    const boardData = this.collaboratorsByBoard.get(collab.boardId);
    
    if (boardData) {
      boardData.collaborators.delete(collab.identity.toHexString());
      boardData.lastUpdate = new Date();
      
      // Trigger reactivity
      this.collaboratorsByBoard = new Map(this.collaboratorsByBoard);
    }
  }

  // Public API
  getCollaboratorsForBoard(boardId: bigint): Collaborator[] {
    const boardData = this.collaboratorsByBoard.get(boardId);
    return boardData ? Array.from(boardData.collaborators.values()) : [];
  }

  isUserCollaborator(boardId: bigint, userId: Identity): boolean {
    const boardData = this.collaboratorsByBoard.get(boardId);
    if (!boardData) return false;
    
    for (const collab of boardData.collaborators.values()) {
      if (idMatch(collab.identity, userId)) {
        return true;
      }
    }
    return false;
  }

  getBoardActivity(boardId: bigint): { lastUpdate: Date | null; collaboratorCount: number } {
    const boardData = this.collaboratorsByBoard.get(boardId);
    return {
      lastUpdate: boardData?.lastUpdate || null,
      collaboratorCount: boardData?.collaborators.size || 0
    };
  }

  getLoadedBoardIds(): bigint[] {
    return Array.from(this.collaboratorsByBoard.keys());
  }

  // Collaborator operations (delegating to reducer)
  async addCollaborator(boardId: bigint, identity: Identity) {
    const { conn } = getConnection();
    await conn.reducers.addCollaborator(boardId, identity);
  }

  // Lifecycle
  destroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    this.collaboratorsByBoard.clear();
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
let globalCollaboratorStore: GlobalCollaboratorStore | null = null;

export function useGlobalCollaboratorStore() {
  if (!globalCollaboratorStore) {
    globalCollaboratorStore = new GlobalCollaboratorStore();
  }
  return globalCollaboratorStore;
}