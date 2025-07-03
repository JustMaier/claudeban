<script lang="ts">
  import { useBoardStore } from '$lib/stores/board-store.svelte';
  import { useActivityStore } from '$lib/stores/activity-store.svelte';
  import { useGlobalCardStore } from '$lib/stores/global-card-store.svelte';

  const boardStore = useBoardStore();
  const activityStore = useActivityStore();
  const globalCardStore = useGlobalCardStore();
  
  let newSlug = $state('');
  let newTitle = $state('');

  async function createBoard() {
    if (!newSlug || !newTitle) return;
    await boardStore.createBoard(newSlug, newTitle);
    newSlug = '';
    newTitle = '';
  }
  
  // Get activity for each board
  function getBoardActivity(boardId: bigint) {
    return activityStore.getBoardActivity(boardId);
  }
  
  // Get total unread count
  const totalUnread = $derived(activityStore.getTotalUnreadCount());
</script>

<div class="board-list">
  <h2>
    Boards 
    {#if totalUnread > 0}
      <span class="total-badge">{totalUnread}</span>
    {/if}
  </h2>
  
  <div class="create-board">
    <input bind:value={newSlug} placeholder="Board slug" />
    <input bind:value={newTitle} placeholder="Board title" />
    <button onclick={createBoard}>Create Board</button>
  </div>

  <ul>
    {#each boardStore.boards as board}
      {@const activity = getBoardActivity(board.boardId)}
      <li class:selected={board.boardId === boardStore.activeBoard}>
        <button onclick={() => boardStore.setActiveBoard(board.boardId)}>
          <span class="board-name">{board.title} ({board.slug})</span>
          {#if activity.hasActivity}
            <span class="activity-indicators">
              {#if activity.unreadCardCount > 0}
                <span class="badge unread" title="{activity.unreadCardCount} new cards">
                  {activity.unreadCardCount}
                </span>
              {/if}
              {#if activity.recentlyCompletedCount > 0}
                <span class="badge completed" title="{activity.recentlyCompletedCount} recently completed">
                  ✓ {activity.recentlyCompletedCount}
                </span>
              {/if}
              {#if activity.newCollaboratorCount > 0}
                <span class="badge collaborator" title="New collaborators">
                  + {activity.newCollaboratorCount}
                </span>
              {/if}
            </span>
          {/if}
        </button>
      </li>
    {/each}
  </ul>
</div>

<style>
  .board-list {
    padding: 1rem;
  }

  .create-board {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    margin-bottom: 0.5rem;
  }

  li button {
    width: 100%;
    text-align: left;
    padding: 0.5rem;
    border: 1px solid #ddd;
    background: white;
    cursor: pointer;
  }

  li.selected button {
    background: #e0e0e0;
    font-weight: bold;
  }
  
  button .board-name {
    display: inline-block;
    flex: 1;
  }
  
  .activity-indicators {
    display: inline-flex;
    gap: 0.25rem;
    margin-left: auto;
  }
  
  .badge {
    display: inline-block;
    padding: 0.125rem 0.375rem;
    font-size: 0.75rem;
    border-radius: 10px;
    font-weight: 500;
  }
  
  .badge.unread {
    background: #3b82f6;
    color: white;
  }
  
  .badge.completed {
    background: #10b981;
    color: white;
  }
  
  .badge.collaborator {
    background: #8b5cf6;
    color: white;
  }
  
  .total-badge {
    display: inline-block;
    background: #ef4444;
    color: white;
    padding: 0.125rem 0.5rem;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: normal;
    margin-left: 0.5rem;
  }
  
  li button {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>