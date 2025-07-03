<script lang="ts">
  import type { Board, Card, User, Collaborator } from '$lib/generated';
  import { useDbContext } from '$lib/context/db-context';
  import AddCollaboratorModal from '$lib/components/AddCollaboratorModal.svelte';
  import { idMatch } from '$lib/utils/db-utils';

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
  let collaborators = $state<Collaborator[]>([]);
  let showAddCollaboratorModal = $state(false);

  // let conn: import('$generated').DbConnection;

  /* ---------- once on client mount ---------- */
  const identity = id;

  // live updates
  conn.db.board.onInsert((_ctx, row) => (boards = [...boards, row]));
  conn.db.board.onUpdate((_ctx, _old, row) => (boards = boards.map((b) => (b.boardId === row.boardId ? row : b))));

  conn.db.card.onInsert((_ctx, row) => (cards = [...cards, row]));
  conn.db.card.onUpdate((_ctx, _old, row) => (cards = cards.map((c) => (c.cardId === row.cardId ? row : c))));

  conn.db.user.onInsert((_ctx, row) => {
    users = [...users, row];
    console.log('insert', { row: row.id, identity });
    if (idMatch(row.id, identity)) {
      console.log('setting current user', row);
      currentUser = row;
    }
  });
  conn.db.user.onUpdate((_ctx, _old, row) => {
    users = users.map((u) => (idMatch(u.id, row.id) ? row : u));
    console.log('update', { row: row.id, identity });
    if (idMatch(row.id, identity)) {
      console.log('setting current user', row);
      currentUser = row;
    }
  });

  conn.db.collaborator.onInsert((_ctx, row) => (collaborators = [...collaborators, row]));
  conn.db.collaborator.onDelete((_ctx, row) => {
    collaborators = collaborators.filter((c) => !(c.boardId === row.boardId && idMatch(c.identity, row.identity)));
  });

  conn
    .subscriptionBuilder() // :contentReference[oaicite:1]{index=1}
    .onApplied(() => {
      console.log('connected');
    })
    .subscribe(['SELECT * FROM board', 'SELECT * FROM card', 'SELECT * FROM collaborator', 'SELECT * FROM user']);

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

  async function addCollaborator(userId: string) {
    if (!activeBoard) return;
    await conn.reducers.addCollaborator(activeBoard, userId);
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
  <h2>Board Details</h2>

  <div style="margin-bottom: 1rem;">
    <h3>Collaborators</h3>
    <button onclick={() => (showAddCollaboratorModal = true)}>Add Collaborator</button>
    <ul>
      {#each collaborators.filter((c) => c.boardId === activeBoard) as collab}
        {@const user = users.find((u) => idMatch(u.id, collab.identity))}
        <li>{user?.name || 'Unnamed User'}</li>
      {/each}
    </ul>
  </div>

  <h3>Cards</h3>
  <input bind:value={newCardTitle} placeholder="new card title" />
  <button onclick={addCard}>add</button>

  <ul>
    {#each cards.filter((c) => c.boardId === activeBoard) as c}
      <li>{c.title} — {c.state}</li>
    {/each}
  </ul>
{/if}

<AddCollaboratorModal
  show={showAddCollaboratorModal}
  {users}
  currentUserId={identity}
  onClose={() => (showAddCollaboratorModal = false)}
  onAdd={addCollaborator}
/>

<style>
  .selected {
    font-weight: bold;
  }
</style>
