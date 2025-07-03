<script lang="ts">
  import type { Card, Identity } from '$lib/generated';
  import CardItem from './CardItem.svelte';

  interface Props {
    title: string;
    cards: Card[];
    status: 'todo' | 'in_progress' | 'done';
    cardStore: { 
      completeCard: (cardId: bigint) => Promise<void>;
      reassignCard: (cardId: bigint, newAssignee: Identity) => Promise<void>;
    };
    boardId: bigint;
  }

  let { title, cards, status, cardStore, boardId }: Props = $props();
</script>

<div class="column">
  <h3>{title}</h3>
  <div class="cards">
    {#each cards as card}
      <CardItem {card} {cardStore} {boardId} />
    {/each}
  </div>
</div>

<style>
  .column {
    flex: 1;
    background: #f5f5f5;
    border-radius: 8px;
    padding: 1rem;
  }

  h3 {
    margin-top: 0;
    margin-bottom: 1rem;
  }

  .cards {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>