<script lang="ts">
  import { useGlobalCardStore } from '$lib/stores/global-card-store.svelte';
  import { useActivityStore } from '$lib/stores/activity-store.svelte';
  import CardColumn from './CardColumn.svelte';

  interface Props {
    boardId: bigint;
  }

  let { boardId }: Props = $props();
  
  const globalCardStore = useGlobalCardStore();
  const activityStore = useActivityStore();
  
  let newCardTitle = $state('');

  // Mark board as viewed when component mounts
  $effect(() => {
    activityStore.markBoardViewed(boardId);
  });

  async function addCard() {
    if (!newCardTitle) return;
    await globalCardStore.addCard(boardId, newCardTitle);
    newCardTitle = '';
  }

  // Get cards for this board from the global store
  const cards = $derived(globalCardStore.getCardsForBoard(boardId));
  
  const todoCards = $derived(cards.filter(c => c.state === 'todo'));
  const inProgressCards = $derived(cards.filter(c => c.state === 'in_progress'));
  const doneCards = $derived(cards.filter(c => c.state === 'done'));
  
  // Create a cardStore-like object for compatibility with CardColumn
  const cardStore = {
    completeCard: (cardId: bigint) => globalCardStore.completeCard(cardId),
    updateCardStatus: (cardId: bigint, newStatus: string) => globalCardStore.updateCardStatus(cardId, newStatus),
    reassignCard: (cardId: bigint, newAssignee: any) => globalCardStore.reassignCard(cardId, newAssignee)
  };
</script>

<div class="kanban-board">
  {#if !globalCardStore.initialized}
    <div class="loading">
      <p>Loading board data...</p>
    </div>
  {:else if globalCardStore.lastError}
    <div class="error">
      <p>Error loading board: {globalCardStore.lastError}</p>
    </div>
  {:else}
    <div class="add-card">
      <input bind:value={newCardTitle} placeholder="New card title" />
      <button onclick={addCard}>Add Card</button>
    </div>

    <div class="columns">
      <CardColumn title="To Do" cards={todoCards} status="todo" {cardStore} {boardId} />
      <CardColumn title="In Progress" cards={inProgressCards} status="in_progress" {cardStore} {boardId} />
      <CardColumn title="Done" cards={doneCards} status="done" {cardStore} {boardId} />
    </div>
  {/if}
</div>

<style>
  .kanban-board {
    flex: 1;
  }

  .add-card {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .columns {
    display: flex;
    gap: 1rem;
    height: 100%;
  }
  
  .loading, .error {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: #666;
  }
  
  .error {
    color: #ef4444;
  }
</style>