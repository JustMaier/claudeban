import { useGlobalCardStore } from './global-card-store.svelte';
import { useGlobalCollaboratorStore } from './global-collaborator-store.svelte';
import { getConnection } from './connection-store.svelte';
import type { Card } from '$lib/generated';

export interface BoardActivity {
  boardId: bigint;
  lastViewed: Date | null;
  unreadCardCount: number;
  recentlyCompletedCount: number;
  newCollaboratorCount: number;
  hasActivity: boolean;
}

class ActivityStore {
  // Map<boardId, lastViewedDate>
  private lastViewedMap = $state<Map<bigint, Date>>(new Map());
  
  // Cache of activity summaries
  private activityCache = new Map<bigint, BoardActivity>();
  
  constructor() {
    // Load last viewed timestamps from localStorage
    this.loadLastViewed();
    
    // Set up listeners for card and collaborator changes
    this.setupListeners();
  }

  private loadLastViewed() {
    try {
      const stored = localStorage.getItem('boardLastViewed');
      if (stored) {
        const data = JSON.parse(stored);
        for (const [boardIdStr, timestamp] of Object.entries(data)) {
          this.lastViewedMap.set(BigInt(boardIdStr), new Date(timestamp as string));
        }
      }
    } catch (err) {
      console.error('[ActivityStore] Failed to load last viewed data:', err);
    }
  }

  private saveLastViewed() {
    try {
      const data: Record<string, string> = {};
      for (const [boardId, date] of this.lastViewedMap.entries()) {
        data[boardId.toString()] = date.toISOString();
      }
      localStorage.setItem('boardLastViewed', JSON.stringify(data));
    } catch (err) {
      console.error('[ActivityStore] Failed to save last viewed data:', err);
    }
  }

  private setupListeners() {
    const { conn } = getConnection();
    const cardStore = useGlobalCardStore();
    const collaboratorStore = useGlobalCollaboratorStore();

    // Listen for card changes
    conn.db.card.onInsert((_ctx, card) => {
      this.invalidateBoardActivity(card.boardId);
    });

    conn.db.card.onUpdate((_ctx, _old, card) => {
      this.invalidateBoardActivity(card.boardId);
    });

    conn.db.card.onDelete((_ctx, card) => {
      this.invalidateBoardActivity(card.boardId);
    });

    // Listen for collaborator changes
    conn.db.collaborator.onInsert((_ctx, collab) => {
      this.invalidateBoardActivity(collab.boardId);
    });

    conn.db.collaborator.onDelete((_ctx, collab) => {
      this.invalidateBoardActivity(collab.boardId);
    });
  }

  private invalidateBoardActivity(boardId: bigint) {
    // Remove from cache to force recalculation
    this.activityCache.delete(boardId);
  }

  // Mark a board as viewed
  markBoardViewed(boardId: bigint) {
    const now = new Date();
    this.lastViewedMap.set(boardId, now);
    this.lastViewedMap = new Map(this.lastViewedMap); // Trigger reactivity
    this.saveLastViewed();
    this.invalidateBoardActivity(boardId);
  }

  // Get activity summary for a board
  getBoardActivity(boardId: bigint): BoardActivity {
    // Check cache first
    const cached = this.activityCache.get(boardId);
    if (cached) {
      return cached;
    }

    const cardStore = useGlobalCardStore();
    const collaboratorStore = useGlobalCollaboratorStore();
    const lastViewed = this.lastViewedMap.get(boardId) || null;
    
    // Calculate activity
    const cards = cardStore.getCardsForBoard(boardId);
    const cardActivity = cardStore.getBoardActivity(boardId);
    const collabActivity = collaboratorStore.getBoardActivity(boardId);
    
    let unreadCardCount = 0;
    let recentlyCompletedCount = 0;
    
    if (lastViewed) {
      for (const card of cards) {
        // Count cards created after last view
        if (card.createdAt && new Date(card.createdAt.toString()) > lastViewed) {
          unreadCardCount++;
        }
        
        // Count cards completed in the last 24 hours
        if (card.completedAt) {
          const completedDate = new Date(card.completedAt.toString());
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          if (completedDate > dayAgo) {
            recentlyCompletedCount++;
          }
        }
      }
    } else {
      // If never viewed, all cards are "new"
      unreadCardCount = cards.length;
    }
    
    // Count new collaborators
    let newCollaboratorCount = 0;
    if (lastViewed && collabActivity.lastUpdate && collabActivity.lastUpdate > lastViewed) {
      // This is approximate - we'd need to track individual collaborator join times for accuracy
      newCollaboratorCount = 1; // At least one change happened
    }
    
    const activity: BoardActivity = {
      boardId,
      lastViewed,
      unreadCardCount,
      recentlyCompletedCount,
      newCollaboratorCount,
      hasActivity: unreadCardCount > 0 || recentlyCompletedCount > 0 || newCollaboratorCount > 0
    };
    
    // Cache the result
    this.activityCache.set(boardId, activity);
    
    return activity;
  }

  // Get all boards with activity
  getBoardsWithActivity(): BoardActivity[] {
    const cardStore = useGlobalCardStore();
    const boardIds = cardStore.getLoadedBoardIds();
    
    return boardIds
      .map(boardId => this.getBoardActivity(boardId))
      .filter(activity => activity.hasActivity);
  }

  // Get total unread count across all boards
  getTotalUnreadCount(): number {
    const cardStore = useGlobalCardStore();
    const boardIds = cardStore.getLoadedBoardIds();
    
    return boardIds.reduce((total, boardId) => {
      const activity = this.getBoardActivity(boardId);
      return total + activity.unreadCardCount;
    }, 0);
  }

  // Clear activity for a board
  clearBoardActivity(boardId: bigint) {
    this.markBoardViewed(boardId);
  }

  // Clear all activity
  clearAllActivity() {
    const cardStore = useGlobalCardStore();
    const boardIds = cardStore.getLoadedBoardIds();
    
    const now = new Date();
    for (const boardId of boardIds) {
      this.lastViewedMap.set(boardId, now);
    }
    
    this.lastViewedMap = new Map(this.lastViewedMap); // Trigger reactivity
    this.saveLastViewed();
    this.activityCache.clear();
  }
}

// Singleton instance
let activityStore: ActivityStore | null = null;

export function useActivityStore() {
  if (!activityStore) {
    activityStore = new ActivityStore();
  }
  return activityStore;
}