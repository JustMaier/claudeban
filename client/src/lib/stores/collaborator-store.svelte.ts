import type { Collaborator } from '$lib/generated';
import { getConnection } from './connection-store.svelte';
import { StoreRegistry } from './store-registry';
import { idMatch } from '$lib/utils/db-utils';

interface CollaboratorStore {
  collaborators: Collaborator[];
  addCollaborator(userId: string): Promise<void>;
  _cleanup?: () => void;
}

const collaboratorStoreRegistry = new StoreRegistry<CollaboratorStore>();

function createCollaboratorStoreInstance(boardId: bigint): CollaboratorStore {
  let collaborators = $state<Collaborator[]>([]);
  const { conn } = getConnection();

  // Set up listeners first
  const unsubInsert = conn.db.collaborator.onInsert((_ctx, collab) => {
    if (collab.boardId === boardId) {
      console.log(`[CollaboratorStore ${boardId}] Collaborator inserted:`, collab);
      collaborators = [...collaborators, collab];
    }
  });

  const unsubDelete = conn.db.collaborator.onDelete((_ctx, collab) => {
    if (collab.boardId === boardId) {
      console.log(`[CollaboratorStore ${boardId}] Collaborator deleted:`, collab);
      collaborators = collaborators.filter(
        (c) => !(c.boardId === collab.boardId && idMatch(c.identity, collab.identity))
      );
    }
  });

  // Then subscribe (after listeners are ready)
  const unsubData = conn.subscriptionBuilder()
    .subscribe([`SELECT * FROM collaborator WHERE boardId = ${boardId}`])
    .onApplied(() => {
      console.log(`[CollaboratorStore ${boardId}] Collaborator subscription applied`);
      // Get initial collaborators for this board
      collaborators = Array.from(conn.db.collaborator.iter()).filter(c => c.boardId === boardId);
    });

  // Cleanup function for when refCount hits 0
  const cleanup = () => {
    console.log(`[CollaboratorStore ${boardId}] Cleaning up`);
    unsubInsert();
    unsubDelete();
    unsubData();
  };

  return {
    get collaborators() { return collaborators; },
    async addCollaborator(userId: string) {
      await conn.reducers.addCollaborator(boardId, userId);
    },
    _cleanup: cleanup
  };
}

export function getCollaboratorStore(boardId: bigint): CollaboratorStore & { release: () => void } {
  const key = `board-${boardId}-collaborators`;
  const store = collaboratorStoreRegistry.get(key, () => createCollaboratorStoreInstance(boardId));

  return {
    get collaborators() { return store.collaborators; },
    addCollaborator: store.addCollaborator,
    release: () => collaboratorStoreRegistry.release(key)
  };
}

// Svelte helper hook that automatically manages lifecycle
export function useCollaboratorStore(boardId: bigint) {
  const store = getCollaboratorStore(boardId);

  $effect(() => {
    return () => store.release();
  });

  return store;
}