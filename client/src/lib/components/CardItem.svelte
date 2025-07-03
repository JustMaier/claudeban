<script lang="ts">
  import type { Card } from '$lib/generated';
  import { useUserStore } from '$lib/stores/user-store.svelte';
  import { useConnection } from '$lib/stores/connection-store.svelte';
  import { idMatch } from '$lib/utils/db-utils';

  interface Props {
    card: Card;
    cardStore: { completeCard: (cardId: bigint) => Promise<void> };
  }

  let { card, cardStore }: Props = $props();
  let isCompleting = $state(false);
  let error = $state<string | null>(null);
  
  const userStore = useUserStore();
  const { id: currentUserId } = useConnection();
  
  const assignee = $derived(userStore.users.find(u => idMatch(u.id, card.assignee)));
  const isMyCard = $derived(currentUserId && idMatch(card.assignee, currentUserId));

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
</script>

<div class="card" class:not-mine={!isMyCard}>
  <p class="title">{card.title}</p>
  <p class="assignee">Assigned to: {assignee?.name || 'Unknown'}</p>
  {#if card.state !== 'done' && isMyCard}
    <button onclick={handleComplete} disabled={isCompleting}>
      {isCompleting ? 'Completing...' : 'Complete'}
    </button>
  {:else if card.state !== 'done' && !isMyCard}
    <p class="info">Only {assignee?.name || 'the assignee'} can complete this card</p>
  {/if}
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
</style>