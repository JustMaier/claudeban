<script lang="ts">
  import type { Card } from '$lib/generated';

  interface Props {
    card: Card;
    cardStore: { completeCard: (cardId: bigint) => Promise<void> };
  }

  let { card, cardStore }: Props = $props();

  async function handleComplete() {
    if (card.state !== 'done') {
      await cardStore.completeCard(card.cardId);
    }
  }
</script>

<div class="card">
  <p>{card.title}</p>
  {#if card.state !== 'done'}
    <button onclick={handleComplete}>Complete</button>
  {/if}
</div>

<style>
  .card {
    background: white;
    padding: 1rem;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  p {
    margin: 0 0 0.5rem 0;
  }

  button {
    font-size: 0.875rem;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
  }
</style>