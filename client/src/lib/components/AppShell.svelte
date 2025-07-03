<script lang="ts">
  import { useBoardStore } from '$lib/stores/board-store.svelte';
  import UserProfile from './UserProfile.svelte';
  import BoardList from './BoardList.svelte';
  import BoardView from './BoardView.svelte';

  const boardStore = useBoardStore();
</script>

<div class="app-shell">
  <header>
    <UserProfile />
  </header>
  
  <div class="main">
    <aside>
      <BoardList />
    </aside>
    
    <main>
      {#if boardStore.activeBoard}
        <BoardView boardId={boardStore.activeBoard} />
      {:else}
        <div class="no-board">
          <p>Select a board to get started</p>
        </div>
      {/if}
    </main>
  </div>
</div>

<style>
  .app-shell {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  header {
    background: #f8f8f8;
    border-bottom: 1px solid #ddd;
  }

  .main {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  aside {
    width: 300px;
    background: #fafafa;
    border-right: 1px solid #ddd;
    overflow-y: auto;
  }

  main {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .no-board {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
  }
</style>