<script lang="ts">
  import { useBoardStore } from '$lib/stores/board-store.svelte';
  import CollaboratorList from './CollaboratorList.svelte';

  interface Props {
    boardId: bigint;
  }

  let { boardId }: Props = $props();
  
  const boardStore = useBoardStore();
  const board = $derived(boardStore.getBoard(boardId));
</script>

{#if board}
  <div class="board-header">
    <h1>{board.title}</h1>
    <CollaboratorList {boardId} />
  </div>
{/if}

<style>
  .board-header {
    margin-bottom: 2rem;
  }

  h1 {
    margin-bottom: 1rem;
  }
</style>