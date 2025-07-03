<script lang="ts">
  import type { Card, Identity } from '$lib/generated';
  import { useUserStore } from '$lib/stores/user-store.svelte';
  import { useConnection } from '$lib/stores/connection-store.svelte';
  import { useCollaboratorStore } from '$lib/stores/collaborator-store.svelte';
  import { idMatch } from '$lib/utils/db-utils';

  interface Props {
    card: Card;
    cardStore: { 
      completeCard: (cardId: bigint) => Promise<void>;
      updateCardStatus: (cardId: bigint, newStatus: string) => Promise<void>;
      reassignCard: (cardId: bigint, newAssignee: Identity) => Promise<void>;
    };
    boardId: bigint;
  }

  let { card, cardStore, boardId }: Props = $props();
  let isCompleting = $state(false);
  let error = $state<string | null>(null);
  let showReassignDropdown = $state(false);
  let isReassigning = $state(false);
  let isUpdatingStatus = $state(false);
  
  const userStore = useUserStore();
  const collaboratorStore = useCollaboratorStore(boardId);
  const { id: currentUserId } = useConnection();
  
  const assignee = $derived(userStore.users.find(u => idMatch(u.id, card.assignee)));
  const isMyCard = $derived(currentUserId && idMatch(card.assignee, currentUserId));
  
  // Get list of collaborator users who can be assigned
  const availableAssignees = $derived(
    collaboratorStore.collaborators
      .map(collab => userStore.users.find(u => idMatch(u.id, collab.identity)))
      .filter(user => user && !idMatch(user.id, card.assignee))
  );

  async function handleComplete() {
    if (card.state !== 'done' && !isCompleting) {
      isCompleting = true;
      error = null;
      try {
        await cardStore.completeCard(card.cardId);
      } catch (err) {
        error = err instanceof Error ? err.message : 'Failed to complete card';
        console.error('Failed to complete card:', err);
      } finally {
        isCompleting = false;
      }
    }
  }
  
  async function handleReassign(newAssignee: Identity) {
    if (isReassigning) return;
    
    isReassigning = true;
    error = null;
    showReassignDropdown = false;
    
    try {
      await cardStore.reassignCard(card.cardId, newAssignee);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to reassign card';
      console.error('Failed to reassign card:', err);
    } finally {
      isReassigning = false;
    }
  }
  
  async function handleStatusChange(newStatus: string) {
    if (newStatus === card.state || isUpdatingStatus) return;
    
    isUpdatingStatus = true;
    error = null;
    
    try {
      await cardStore.updateCardStatus(card.cardId, newStatus);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to update status';
      console.error('Failed to update card status:', err);
    } finally {
      isUpdatingStatus = false;
    }
  }
  
  const statusOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' }
  ];
</script>

<div class="card" class:not-mine={!isMyCard}>
  <p class="title">{card.title}</p>
  <div class="assignee-section">
    <p class="assignee">Assigned to: {assignee?.name || 'Unknown'}</p>
    {#if card.state !== 'done'}
      <button class="reassign-btn" onclick={() => showReassignDropdown = !showReassignDropdown} disabled={isReassigning}>
        {isReassigning ? 'Reassigning...' : 'Reassign'}
      </button>
    {/if}
  </div>
  
  {#if showReassignDropdown}
    <div class="dropdown">
      <p class="dropdown-title">Reassign to:</p>
      {#if availableAssignees.length > 0}
        {#each availableAssignees as user}
          {#if user}
            <button class="dropdown-item" onclick={() => handleReassign(user.id)}>
              {user.name || user.id.toHexString().substring(0, 8)}
            </button>
          {/if}
        {/each}
      {:else}
        <p class="no-options">No other collaborators available</p>
      {/if}
    </div>
  {/if}
  
  <div class="status-section">
    <label for="status-{card.cardId}">Status:</label>
    <select 
      id="status-{card.cardId}"
      value={card.state} 
      onchange={(e) => handleStatusChange(e.currentTarget.value)}
      disabled={isUpdatingStatus}
    >
      {#each statusOptions as option}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>
    {#if isUpdatingStatus}
      <span class="updating">Updating...</span>
    {/if}
  </div>
  {#if error}
    <p class="error">{error}</p>
  {/if}
</div>

<style>
  .card {
    background: white;
    padding: 1rem;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .card.not-mine {
    opacity: 0.8;
  }
  
  p {
    margin: 0 0 0.5rem 0;
  }
  
  .title {
    font-weight: 500;
  }
  
  .assignee {
    font-size: 0.875rem;
    color: #666;
  }
  
  .info {
    font-size: 0.875rem;
    color: #666;
    font-style: italic;
  }

  button {
    font-size: 0.875rem;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
  }
  
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .error {
    color: red;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }
  
  .assignee-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .reassign-btn {
    font-size: 0.75rem;
    padding: 0.125rem 0.5rem;
    background: #f0f0f0;
    border: 1px solid #ddd;
  }
  
  .reassign-btn:hover:not(:disabled) {
    background: #e0e0e0;
  }
  
  .dropdown {
    background: #f8f8f8;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 0.5rem;
    margin: 0.5rem 0;
  }
  
  .dropdown-title {
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
  }
  
  .dropdown-item {
    display: block;
    width: 100%;
    text-align: left;
    padding: 0.25rem 0.5rem;
    margin: 0.125rem 0;
    background: white;
    border: 1px solid #ddd;
    border-radius: 2px;
    font-size: 0.875rem;
  }
  
  .dropdown-item:hover {
    background: #f0f0f0;
  }
  
  .no-options {
    font-size: 0.875rem;
    color: #666;
    text-align: center;
    padding: 0.5rem;
    font-style: italic;
  }
  
  .status-section {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  
  .status-section label {
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .status-section select {
    flex: 1;
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    cursor: pointer;
  }
  
  .status-section select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .updating {
    font-size: 0.75rem;
    color: #666;
    font-style: italic;
  }
</style>