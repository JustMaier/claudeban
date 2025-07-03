<script lang="ts">
  import { useBoardStore } from '$lib/stores/board-store.svelte';
  import { useBoardPresence } from '$lib/stores/board-viewer-store.svelte';
  import { useUserStore } from '$lib/stores/user-store.svelte';
  import CollaboratorList from './CollaboratorList.svelte';

  interface Props {
    boardId: bigint;
  }

  let { boardId }: Props = $props();
  
  const boardStore = useBoardStore();
  const board = $derived(boardStore.getBoard(boardId));
  const { viewers, viewerCount } = useBoardPresence(boardId);
  const userStore = useUserStore();
</script>

{#if board}
  <div class="board-header">
    <div class="header-top">
      <h1>{board.title}</h1>
      
      {#if viewerCount > 0}
        <div class="active-viewers">
          <span class="viewer-label">Currently viewing:</span>
          {#each viewers.slice(0, 5) as viewerId}
            {@const user = userStore.getUserByIdentity(viewerId)}
            <div class="viewer-avatar" title="{user?.name || 'Anonymous'}">
              {user?.name?.[0] || '?'}
            </div>
          {/each}
          {#if viewers.length > 5}
            <span class="more-viewers">+{viewers.length - 5} more</span>
          {/if}
        </div>
      {/if}
    </div>
    
    <CollaboratorList {boardId} />
  </div>
{/if}

<style>
  .board-header {
    margin-bottom: 2rem;
  }

  .header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  h1 {
    margin: 0;
  }
  
  .active-viewers {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #f3f4f6;
    border-radius: 2rem;
    animation: fadeIn 0.3s ease-out;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .viewer-label {
    font-size: 0.875rem;
    color: #6b7280;
    margin-right: 0.25rem;
  }
  
  .viewer-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #6366f1;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 600;
    border: 2px solid white;
    margin-left: -8px;
    transition: transform 0.2s ease;
  }
  
  .viewer-avatar:first-of-type {
    margin-left: 0;
  }
  
  .viewer-avatar:hover {
    transform: scale(1.1);
    z-index: 10;
  }
  
  .more-viewers {
    font-size: 0.875rem;
    color: #6b7280;
    margin-left: 0.25rem;
  }
</style>