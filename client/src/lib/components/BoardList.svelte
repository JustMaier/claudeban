<script lang="ts">
  import { useBoardStore } from '$lib/stores/board-store.svelte';

  const boardStore = useBoardStore();
  
  let newSlug = $state('');
  let newTitle = $state('');

  async function createBoard() {
    if (!newSlug || !newTitle) return;
    await boardStore.createBoard(newSlug, newTitle);
    newSlug = '';
    newTitle = '';
  }
</script>

<div class="board-list">
  <h2>Boards</h2>
  
  <div class="create-board">
    <input bind:value={newSlug} placeholder="Board slug" />
    <input bind:value={newTitle} placeholder="Board title" />
    <button onclick={createBoard}>Create Board</button>
  </div>

  <ul>
    {#each boardStore.boards as board}
      <li class:selected={board.boardId === boardStore.activeBoard}>
        <button onclick={() => boardStore.setActiveBoard(board.boardId)}>
          {board.title} ({board.slug})
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
</style>