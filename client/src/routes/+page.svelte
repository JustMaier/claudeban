<script lang="ts">
  import type { Board, Card, User } from '$lib/generated';
  import { useDbContext } from '$lib/context/db-context';

  const { conn, id, tok } = useDbContext();

  /* ---------- reactive state ---------- */
  let ready = $state(false);
  let boards = $state<Board[]>([]);
  let cards = $state<Card>([]);
  let users = $state<User[]>([]);
  let currentUser = $state<User | undefined>();
  let activeBoard = $state<BigInt | null>(null);
  let newSlug = $state('');
  let newTitle = $state('');
  let newCardTitle = $state('');
  let newUserName = $state('');

  // let conn: import('$generated').DbConnection;

  /* ---------- once on client mount ---------- */
  const identity = id;
  currentUser = conn.db.user.id.find(identity);
  console.log({ currentUser, identity });

  // live updates
  conn.db.board.onInsert((_ctx, row) => (boards = [...boards, row]));
  conn.db.board.onUpdate((_ctx, _old, row) => (boards = boards.map((b) => (b.boardId === row.boardId ? row : b))));

  conn.db.card.onInsert((_ctx, row) => (cards = [...cards, row]));
  conn.db.card.onUpdate((_ctx, _old, row) => (cards = cards.map((c) => (c.cardId === row.cardId ? row : c))));

  conn.db.user.onInsert((_ctx, row) => {
    users = [...users, row];
    if (row.id === identity) currentUser = row;
  });
  conn.db.user.onUpdate((_ctx, _old, row) => {
    users = users.map((u) => (u.id === row.id ? row : u));
    console.log({ users, row, identity });
    if (row.id === identity) currentUser = row;
  });

  conn
        .subscriptionBuilder() // :contentReference[oaicite:1]{index=1}
        .onApplied(() => {
          console.log('connected');
        })
        .subscribe(['SELECT * FROM board', 'SELECT * FROM card']);

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

  async function setUserName() {
    if (!newUserName) return;
    conn.reducers.setUserName(newUserName);
    newUserName = '';
  }
</script>

<h1>Kanban-Plus</h1>

<!-- user info -->
<div style="margin-bottom: 1rem;">
  {#if currentUser?.name}
    <p>Welcome, {currentUser.name}!</p>
  {:else}
    <p>Set your name:</p>
    <input bind:value={newUserName} placeholder="Your name" />
    <button onclick={setUserName}>Set Name</button>
  {/if}
</div>

<!-- create board -->
<input bind:value={newSlug} placeholder="slug" />
<input bind:value={newTitle} placeholder="title" />
<button onclick={createBoard}>new board</button>

<!-- board list -->
<ul>
  {#each boards as b}
    <li class:selected={b.boardId === activeBoard} onclick={() => (activeBoard = b.boardId)}>
      {b.title} ({b.slug})
    </li>
  {/each}
</ul>

{#if activeBoard}
  <h2>Cards</h2>
  <input bind:value={newCardTitle} placeholder="new card title" />
  <button onclick={addCard}>add</button>

  <ul>
    {#each cards.filter((c) => c.boardId === activeBoard) as c}
      <li>{c.title} — {c.state}</li>
    {/each}
  </ul>
{/if}

<style>
  .selected {
    font-weight: bold;
  }
</style>
