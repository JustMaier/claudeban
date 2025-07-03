<script lang="ts">
  import BoardHeader from './BoardHeader.svelte';
  import KanbanBoard from './KanbanBoard.svelte';

  interface Props {
    boardId: bigint;
  }

  let { boardId }: Props = $props();
</script>

<div class="board-view">
  <BoardHeader {boardId} />
  <KanbanBoard {boardId} />
</div>

<style>
  .board-view {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem;
  }
</style>