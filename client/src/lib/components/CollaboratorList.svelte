<script lang="ts">
  import { useCollaboratorStore } from '$lib/stores/collaborator-store.svelte';
  import { useUserStore } from '$lib/stores/user-store.svelte';
  import AddCollaboratorModal from './AddCollaboratorModal.svelte';
  import { idMatch } from '$lib/utils/db-utils';
  import type { Identity } from '@clockworklabs/spacetimedb-sdk';

  interface Props {
    boardId: bigint;
  }

  let { boardId }: Props = $props();
  
  const collaboratorStore = useCollaboratorStore(boardId);
  const userStore = useUserStore();
  
  let showAddModal = $state(false);

  async function handleAddCollaborator(identity: Identity) {
    await collaboratorStore.addCollaborator(identity);
  }
</script>

<div class="collaborator-list">
  <h3>Collaborators</h3>
  <button onclick={() => showAddModal = true}>Add Collaborator</button>
  
  <ul>
    {#each collaboratorStore.collaborators as collab (collab.identity.toHexString())}
      {@const user = userStore.users.find((u) => idMatch(u.id, collab.identity))}
      <li>{user?.name || 'Unnamed User'}</li>
    {/each}
  </ul>
</div>

<AddCollaboratorModal
  show={showAddModal}
  onClose={() => showAddModal = false}
  onAdd={handleAddCollaborator}
  existingCollaborators={collaboratorStore.collaborators}
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
</style>