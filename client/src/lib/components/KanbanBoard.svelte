<script lang="ts">
  import { useCardStore } from '$lib/stores/card-store.svelte';
  import CardColumn from './CardColumn.svelte';

  interface Props {
    boardId: bigint;
  }

  let { boardId }: Props = $props();
  
  const cardStore = useCardStore(boardId);
  
  let newCardTitle = $state('');

  async function addCard() {
    if (!newCardTitle) return;
    await cardStore.addCard(newCardTitle);
    newCardTitle = '';
  }

  const todoCards = $derived(cardStore.cards.filter(c => c.state === 'todo'));
  const inProgressCards = $derived(cardStore.cards.filter(c => c.state === 'in_progress'));
  const doneCards = $derived(cardStore.cards.filter(c => c.state === 'done'));
</script>

<div class="kanban-board">
  <div class="add-card">
    <input bind:value={newCardTitle} placeholder="New card title" />
    <button onclick={addCard}>Add Card</button>
  </div>

  <div class="columns">
    <CardColumn title="To Do" cards={todoCards} status="todo" {cardStore} />
    <CardColumn title="In Progress" cards={inProgressCards} status="in_progress" {cardStore} />
    <CardColumn title="Done" cards={doneCards} status="done" {cardStore} />
  </div>
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
</style>