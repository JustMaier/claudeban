<script lang="ts">
  import { useUserStore } from '$lib/stores/user-store.svelte';
  import { useConnection } from '$lib/stores/connection-store.svelte';
  import { idMatch } from '$lib/utils/db-utils';

  interface Props {
    show: boolean;
    onClose: () => void;
    onAdd: (userId: string) => void;
  }

  let { show, onClose, onAdd }: Props = $props();
  
  const userStore = useUserStore();
  const { id: currentUserId } = useConnection();

  let selectedUsers = $state<Set<string>>(new Set());

  function toggleUser(userId: string) {
    if (selectedUsers.has(userId)) {
      selectedUsers.delete(userId);
    } else {
      selectedUsers.add(userId);
    }
    selectedUsers = new Set(selectedUsers);
  }

  function handleAdd() {
    selectedUsers.forEach(userId => onAdd(userId));
    selectedUsers.clear();
    onClose();
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }
</script>

{#if show}
  <div class="modal-backdrop" onclick={handleBackdropClick}>
    <div class="modal">
      <h2>Add Collaborators</h2>
      <div class="user-list">
        {#each userStore.users as user}
          {#if currentUserId && !idMatch(user.id, currentUserId)}
            <label class="user-item">
              <input
                type="checkbox"
                checked={selectedUsers.has(user.id)}
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