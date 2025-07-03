<script lang="ts">
  import { useBoardStore } from '$lib/stores/board-store.svelte';
  import { useActivityStore } from '$lib/stores/activity-store.svelte';
  import { useGlobalCardStore } from '$lib/stores/global-card-store.svelte';
  import { useGlobalBoardViewerStore } from '$lib/stores/board-viewer-store.svelte';
  import { useUserStore } from '$lib/stores/user-store.svelte';

  const boardStore = useBoardStore();
  const activityStore = useActivityStore();
  const globalCardStore = useGlobalCardStore();
  const viewerStore = useGlobalBoardViewerStore();
  const userStore = useUserStore();
  
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
  
  // Get total card count
  const totalCards = $derived(activityStore.getTotalCardCount());
</script>

<div class="board-list">
  <h2>
    Boards 
    {#if totalCards > 0}
      <span class="total-badge">{totalCards} cards</span>
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
      {@const viewers = viewerStore.getViewerUsers(board.boardId)}
      <li class:selected={board.boardId === boardStore.activeBoard}>
        <button onclick={() => boardStore.setActiveBoard(board.boardId)}>
          <span class="board-name">{board.title} ({board.slug})</span>
          
          <span class="board-indicators">
            {#if activity.hasActivity}
              <span class="status-badges">
                {#if activity.todoCount > 0}
                  <span class="badge todo" title="{activity.todoCount} to do">
                    {activity.todoCount}
                  </span>
                {/if}
                {#if activity.inProgressCount > 0}
                  <span class="badge in-progress" title="{activity.inProgressCount} in progress">
                    {activity.inProgressCount}
                  </span>
                {/if}
                {#if activity.doneCount > 0}
                  <span class="badge done" title="{activity.doneCount} done">
                    {activity.doneCount}
                  </span>
                {/if}
              </span>
            {/if}
            
            {#if viewers.length > 0}
              <span class="viewers" title="{viewers.length} viewing">
                {#if viewers.length <= 3}
                  {#each viewers as viewerId}
                    {@const user = userStore.getUserByIdentity(viewerId)}
                    <span class="viewer-initial">
                      {user?.name?.[0] || '?'}
                    </span>
                  {/each}
                {:else}
                  <span class="viewer-count">👁️ {viewers.length}</span>
                {/if}
              </span>
            {/if}
          </span>
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
  
  .board-indicators {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: auto;
  }
  
  .status-badges {
    display: inline-flex;
    gap: 0.25rem;
  }
  
  .badge {
    display: inline-block;
    padding: 0.125rem 0.375rem;
    font-size: 0.75rem;
    border-radius: 10px;
    font-weight: 500;
    transition: all 0.3s ease;
    animation: badgeAppear 0.3s ease-out;
  }
  
  @keyframes badgeAppear {
    from {
      transform: scale(0.8);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  .badge.todo {
    background: #3b82f6;
    color: white;
  }
  
  .badge.in-progress {
    background: #eab308;
    color: white;
  }
  
  .badge.done {
    background: #10b981;
    color: white;
  }
  
  /* Subtle hover effect on badges */
  .badge:hover {
    transform: scale(1.1);
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
  
  /* Viewer presence styles */
  .viewers {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    animation: pulse 2s ease-in-out infinite;
  }
  
  .viewer-initial {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #6366f1;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
  }
  
  .viewer-count {
    font-size: 0.875rem;
    color: #6366f1;
  }
  
  /* Pulse animation for live viewers */
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
</style>