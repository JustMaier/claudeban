<script lang="ts">
    import { browser } from '$app/environment';
    import { connectDb } from '$lib/spacetime';
    import type { Board, Card } from '$generated';

    /* ---------- reactive state ---------- */
    let ready        = $state(false);
    let boards       = $state<Board[]>([]);
    let cards        = $state<Card>([]);
    let activeBoard  = $state<BigInt | null>(null);
    let newSlug      = $state('');
    let newTitle     = $state('');
    let newCardTitle = $state('');

    let conn: import('$generated').DbConnection;

    /* ---------- once on client mount ---------- */
    $effect(async () => {
      if (!browser) return;                   // guards SSR

      conn  = await connectDb();
      ready = true;

      // live updates
      conn.db.board.onInsert((_ctx, row) =>
        boards = [...boards, row]);
      conn.db.board.onUpdate((_ctx, _old, row) =>
        boards = boards.map(b => b.boardId === row.boardId ? row : b));

      conn.db.card.onInsert((_ctx, row) =>
        cards = [...cards, row]);
      conn.db.card.onUpdate((_ctx, _old, row) =>
        cards = cards.map(c => c.cardId === row.cardId ? row : c));
    });

    /* ---------- reducer helpers ---------- */
    async function createBoard() {
      if (!newSlug || !newTitle) return;
      await conn.reducers.createBoard(newSlug, newTitle);
      newSlug = newTitle = '';
    }

    async function addCard() {
      if (!activeBoard || !newCardTitle) return;
      await conn.reducers.addCard(activeBoard, newCardTitle);
      newCardTitle = '';
    }
  </script>

  {#if !ready}
    <p style="padding:1rem">Connecting…</p>
  {:else}
    <h1>Kanban-Plus</h1>

    <!-- create board -->
    <input bind:value={newSlug}  placeholder="slug" />
    <input bind:value={newTitle} placeholder="title" />
    <button on:click={createBoard}>new board</button>

    <!-- board list -->
    <ul>
      {#each boards as b}
        <li class:selected={b.boardId === activeBoard}
            on:click={() => activeBoard = b.boardId}>
          {b.title} ({b.slug})
        </li>
      {/each}
    </ul>

    {#if activeBoard}
      <h2>Cards</h2>
      <input bind:value={newCardTitle} placeholder="new card title" />
      <button on:click={addCard}>add</button>

      <ul>
        {#each cards.filter(c => c.boardId === activeBoard) as c}
          <li>{c.title} — {c.state}</li>
        {/each}
      </ul>
    {/if}
  {/if}

  <style>
    .selected { font-weight: bold; }
  </style>
