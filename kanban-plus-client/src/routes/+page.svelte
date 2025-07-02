<script>
  import { onMount } from 'svelte';
  import { stdbClient, tables, reducers, connect } from '$lib/stdb';
  
  let boards = $state([]);
  let cards = $state([]);
  let users = $state([]);
  let currentUser = $state(null);
  let selectedBoard = $state(null);
  
  // Form inputs
  let newBoardSlug = $state('');
  let newBoardTitle = $state('');
  let newCardTitle = $state('');
  
  // Subscribe to table updates
  onMount(async () => {
    // Connect to SpacetimeDB
    await connect();
    
    // Get current user identity
    currentUser = stdbClient.identity;
    
    // Subscribe to boards
    stdbClient.on("initialStateSync", () => {
      boards = [...tables.board.iter()];
      cards = [...tables.card.iter()];
      users = [...tables.user.iter()];
    });
    
    tables.board.on("insert", (board) => {
      boards = [...boards, board];
    });
    
    tables.card.on("insert", (card) => {
      cards = [...cards, card];
    });
    
    tables.card.on("update", (oldCard, newCard) => {
      cards = cards.map(c => c.CardId === oldCard.CardId ? newCard : c);
    });
    
    tables.user.on("insert", (user) => {
      users = [...users, user];
    });
    
    tables.user.on("update", (oldUser, newUser) => {
      users = users.map(u => u.Id === oldUser.Id ? newUser : u);
    });
  });
  
  // Create a new board
  async function createBoard() {
    if (!newBoardSlug || !newBoardTitle) return;
    
    try {
      await reducers.createBoard(newBoardSlug, newBoardTitle);
      newBoardSlug = '';
      newBoardTitle = '';
    } catch (err) {
      console.error('Failed to create board:', err);
      alert('Failed to create board: ' + err.message);
    }
  }
  
  // Add a card to the selected board
  async function addCard() {
    if (!selectedBoard || !newCardTitle) return;
    
    try {
      await reducers.addCard(selectedBoard.BoardId, newCardTitle);
      newCardTitle = '';
    } catch (err) {
      console.error('Failed to add card:', err);
      alert('Failed to add card: ' + err.message);
    }
  }
  
  // Complete a card
  async function completeCard(cardId) {
    try {
      await reducers.completeCard(cardId);
    } catch (err) {
      console.error('Failed to complete card:', err);
      alert('Failed to complete card: ' + err.message);
    }
  }
  
  // Get cards for selected board
  $: boardCards = selectedBoard 
    ? cards.filter(c => c.BoardId === selectedBoard.BoardId)
    : [];
  
  // Group cards by state
  $: todoCards = boardCards.filter(c => c.State === 'todo');
  $: doingCards = boardCards.filter(c => c.State === 'doing');
  $: doneCards = boardCards.filter(c => c.State === 'done');
</script>

<div class="container">
  <h1>Kanban Plus</h1>
  
  {#if currentUser}
    <p class="user-info">Connected as: {currentUser}</p>
  {/if}
  
  <div class="boards-section">
    <h2>Boards</h2>
    
    <div class="create-board">
      <input 
        type="text" 
        placeholder="Board slug (e.g., my-project)"
        bind:value={newBoardSlug}
      />
      <input 
        type="text" 
        placeholder="Board title"
        bind:value={newBoardTitle}
      />
      <button onclick={createBoard}>Create Board</button>
    </div>
    
    <div class="boards-list">
      {#each boards as board}
        <div 
          class="board-item"
          class:selected={selectedBoard?.BoardId === board.BoardId}
          onclick={() => selectedBoard = board}
        >
          <h3>{board.Title}</h3>
          <p>/{board.Slug}</p>
        </div>
      {/each}
    </div>
  </div>
  
  {#if selectedBoard}
    <div class="board-view">
      <h2>{selectedBoard.Title}</h2>
      
      <div class="add-card">
        <input 
          type="text" 
          placeholder="New card title"
          bind:value={newCardTitle}
        />
        <button onclick={addCard}>Add Card</button>
      </div>
      
      <div class="columns">
        <div class="column">
          <h3>To Do</h3>
          {#each todoCards as card}
            <div class="card">
              <p>{card.Title}</p>
              <small>Assigned to: {card.Assignee}</small>
            </div>
          {/each}
        </div>
        
        <div class="column">
          <h3>Doing</h3>
          {#each doingCards as card}
            <div class="card">
              <p>{card.Title}</p>
              <small>Assigned to: {card.Assignee}</small>
            </div>
          {/each}
        </div>
        
        <div class="column">
          <h3>Done</h3>
          {#each doneCards as card}
            <div class="card">
              <p>{card.Title}</p>
              <small>Completed: {card.CompletedAt}</small>
              {#if card.State !== 'done'}
                <button onclick={() => completeCard(card.CardId)}>
                  Mark Complete
                </button>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}
  
  <div class="online-users">
    <h3>Online Users ({users.filter(u => u.Online).length})</h3>
    {#each users.filter(u => u.Online) as user}
      <span class="user-badge">{user.Name || user.Id}</span>
    {/each}
  </div>
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .user-info {
    font-size: 0.9rem;
    color: #666;
  }
  
  .boards-section {
    margin-bottom: 2rem;
  }
  
  .create-board {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .create-board input {
    flex: 1;
    padding: 0.5rem;
  }
  
  .boards-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .board-item {
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .board-item:hover {
    background: #f5f5f5;
  }
  
  .board-item.selected {
    background: #e3f2fd;
    border-color: #2196f3;
  }
  
  .board-item h3 {
    margin: 0 0 0.5rem 0;
  }
  
  .board-item p {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
  }
  
  .board-view {
    margin-bottom: 2rem;
  }
  
  .add-card {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .add-card input {
    flex: 1;
    padding: 0.5rem;
  }
  
  .columns {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }
  
  .column {
    background: #f5f5f5;
    padding: 1rem;
    border-radius: 4px;
  }
  
  .column h3 {
    margin: 0 0 1rem 0;
  }
  
  .card {
    background: white;
    padding: 1rem;
    margin-bottom: 0.5rem;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  
  .card p {
    margin: 0 0 0.5rem 0;
  }
  
  .card small {
    color: #666;
  }
  
  .card button {
    margin-top: 0.5rem;
    font-size: 0.8rem;
  }
  
  .online-users {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #ddd;
  }
  
  .user-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    margin: 0.25rem;
    background: #4caf50;
    color: white;
    border-radius: 4px;
    font-size: 0.8rem;
  }
  
  button {
    padding: 0.5rem 1rem;
    background: #2196f3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background: #1976d2;
  }
  
  input {
    border: 1px solid #ddd;
    border-radius: 4px;
  }
</style>