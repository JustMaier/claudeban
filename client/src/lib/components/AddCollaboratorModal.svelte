<script lang="ts">
  import { useUserStore } from '$lib/stores/user-store.svelte';
  import { useConnection } from '$lib/stores/connection-store.svelte';
  import { idMatch } from '$lib/utils/db-utils';
  import type { Identity } from '@clockworklabs/spacetimedb-sdk';

  interface Props {
    show: boolean;
    onClose: () => void;
    onAdd: (identity: Identity) => void;
  }

  let { show, onClose, onAdd }: Props = $props();
  
  const userStore = useUserStore();
  const { id: currentUserId } = useConnection();

  let selectedUsers = $state<Set<Identity>>(new Set());

  function toggleUser(identity: Identity) {
    const existing = Array.from(selectedUsers).find(id => idMatch(id, identity));
    if (existing) {
      selectedUsers.delete(existing);
    } else {
      selectedUsers.add(identity);
    }
    selectedUsers = new Set(selectedUsers);
  }

  function handleAdd() {
    selectedUsers.forEach(identity => onAdd(identity));
    selectedUsers.clear();
    onClose();
  }

  function isSelected(identity: Identity): boolean {
    return Array.from(selectedUsers).some(id => idMatch(id, identity));
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }
</script>

{#if show}
  <div class="modal-backdrop" onclick={handleBackdropClick} onkeydown={(e) => e.key === 'Escape' && onClose()} role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1">
    <div class="modal">
      <h2 id="modal-title">Add Collaborators</h2>
      <div class="user-list">
        {#each userStore.users as user}
          {#if currentUserId && !idMatch(user.id, currentUserId)}
            <label class="user-item">
              <input
                type="checkbox"
                checked={isSelected(user.id)}
                onchange={() => toggleUser(user.id)}
              />
              <span>{user.name || 'Unnamed User'}</span>
            </label>
          {/if}
        {/each}
      </div>
      <div class="modal-actions">
        <button onclick={onClose}>Cancel</button>
        <button onclick={handleAdd} disabled={selectedUsers.size === 0}>
          Add Selected ({selectedUsers.size})
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
  }

  h2 {
    margin-top: 0;
    margin-bottom: 1rem;
  }

  .user-list {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 1rem;
  }

  .user-item {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    cursor: pointer;
  }

  .user-item:hover {
    background-color: #f0f0f0;
  }

  .user-item input {
    margin-right: 0.5rem;
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }

  button {
    padding: 0.5rem 1rem;
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>