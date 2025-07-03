<script lang="ts">
  import { useUserStore } from '$lib/stores/user-store.svelte';

  const userStore = useUserStore();
  let newUserName = $state('');

  async function setUserName() {
    if (!newUserName) return;
    await userStore.setUserName(newUserName);
    newUserName = '';
  }
</script>

<div class="user-profile">
  {#if userStore.currentUser?.name}
    <p>Welcome, {userStore.currentUser.name}!</p>
  {:else}
    <div class="set-name">
      <input bind:value={newUserName} placeholder="Your name" />
      <button onclick={setUserName}>Set Name</button>
    </div>
  {/if}
</div>

<style>
  .user-profile {
    padding: 1rem;
    border-bottom: 1px solid #ddd;
  }

  .set-name {
    display: flex;
    gap: 0.5rem;
  }
</style>