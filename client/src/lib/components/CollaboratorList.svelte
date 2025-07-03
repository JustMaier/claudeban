<script lang="ts">
  import { useGlobalCollaboratorStore } from '$lib/stores/global-collaborator-store.svelte';
  import { useUserStore } from '$lib/stores/user-store.svelte';
  import AddCollaboratorModal from './AddCollaboratorModal.svelte';
  import { idMatch } from '$lib/utils/db-utils';
  import type { Identity } from '@clockworklabs/spacetimedb-sdk';

  interface Props {
    boardId: bigint;
  }

  let { boardId }: Props = $props();
  
  const globalCollaboratorStore = useGlobalCollaboratorStore();
  const userStore = useUserStore();
  
  let showAddModal = $state(false);

  // Get collaborators for this board from the global store
  const collaborators = $derived(globalCollaboratorStore.getCollaboratorsForBoard(boardId));

  async function handleAddCollaborator(identity: Identity) {
    await globalCollaboratorStore.addCollaborator(boardId, identity);
  }
</script>

<div class="collaborator-list">
  <h3>Collaborators</h3>
  <button onclick={() => showAddModal = true}>Add Collaborator</button>
  
  {#if !globalCollaboratorStore.initialized}
    <p class="loading">Loading...</p>
  {:else}
    <ul>
      {#each collaborators as collab (collab.identity.toHexString())}
        {@const user = userStore.users.find((u) => idMatch(u.id, collab.identity))}
        <li>{user?.name || 'Unnamed User'}</li>
      {/each}
    </ul>
  {/if}
</div>

<AddCollaboratorModal
  show={showAddModal}
  onClose={() => showAddModal = false}
  onAdd={handleAddCollaborator}
  existingCollaborators={collaborators}
/>

<style>
  .collaborator-list {
    margin-bottom: 1rem;
  }

  h3 {
    display: inline-block;
    margin-right: 1rem;
  }

  ul {
    list-style: none;
    padding: 0;
    margin-top: 0.5rem;
  }

  li {
    padding: 0.25rem 0;
  }
  
  .loading {
    color: #666;
    font-style: italic;
    margin: 0.5rem 0;
  }
</style>