import type { Collaborator } from '$lib/generated';
import type { Identity } from '@clockworklabs/spacetimedb-sdk';
import { getConnection } from './connection-store.svelte';
import { StoreRegistry } from './store-registry';
import { idMatch } from '$lib/utils/db-utils';

interface CollaboratorStore {
  collaborators: Collaborator[];
  addCollaborator(identity: Identity): Promise<void>;
  _cleanup?: () => void;
}

const collaboratorStoreRegistry = new StoreRegistry<CollaboratorStore>();

function createCollaboratorStoreInstance(boardId: bigint): CollaboratorStore {
  console.log(`[CollaboratorStore] Creating new instance for board ${boardId}`);
  let collaboratorMap = $state<Map<string, Collaborator>>(new Map());
  const { conn } = getConnection();

  // Subscribe first without listeners to get initial data
  const subscription = conn.subscriptionBuilder()
    .onError((ctx, error) => {
      console.error(`[CollaboratorStore ${boardId}] Subscription error:`, error);
    })
    .onApplied(() => {
      console.log(`[CollaboratorStore ${boardId}] Collaborator subscription applied`);
      // Get initial collaborators for this board
      collaboratorMap.clear();
      for (const collab of conn.db.collaborator.iter()) {
        if (collab.boardId === boardId) {
          collaboratorMap.set(collab.identity.toHexString(), collab);
        }
      }
      console.log(`[CollaboratorStore ${boardId}] Loaded:`, collaboratorMap.size, 'collaborators');
      
      // Set up listeners after initial data is loaded
      conn.db.collaborator.onInsert((ctx, collab) => {
        if (collab.boardId === boardId) {
          console.log(`[CollaboratorStore ${boardId}] Collaborator inserted:`, collab, 'Event:', ctx.event);
          collaboratorMap.set(collab.identity.toHexString(), collab);
          collaboratorMap = new Map(collaboratorMap); // Trigger reactivity
        }
      });

      conn.db.collaborator.onDelete((_ctx, collab) => {
        if (collab.boardId === boardId) {
          console.log(`[CollaboratorStore ${boardId}] Collaborator deleted:`, collab);
          collaboratorMap.delete(collab.identity.toHexString());
          collaboratorMap = new Map(collaboratorMap); // Trigger reactivity
        }
      });
    })
    .subscribe([`SELECT * FROM collaborator WHERE BoardId = ${boardId}`]);

  // Cleanup function for when refCount hits 0
  const cleanup = () => {
    console.log(`[CollaboratorStore ${boardId}] Cleaning up`);
    subscription.unsubscribe();
  };

  return {
    get collaborators() { return Array.from(collaboratorMap.values()); },
    async addCollaborator(identity: Identity) {
      await conn.reducers.addCollaborator(boardId, identity);
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