<script lang="ts">
  import type { Snippet } from 'svelte';
  import { connectDb } from '$lib/spacetime';
  import { setConnection, useConnection } from '$lib/stores/connection-store.svelte';
  import { initializeUserStore } from '$lib/stores/user-store.svelte';
  import { initializeBoardStore } from '$lib/stores/board-store.svelte';
  import { initializeBoardViewerStore } from '$lib/stores/board-viewer-store.svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
  const connectionState = useConnection();

  // Initialize connection only once
  let initialized = false;
  
  $effect(() => {
    if (!initialized && !connectionState.isConnected) {
      initialized = true;
      connectDb((conn, id, tok) => {
        setConnection(conn, id, tok);
        
        // Initialize global stores after connection is established
        initializeUserStore();
        initializeBoardStore();
        initializeBoardViewerStore();
      });
    }
  });
</script>

{#if !connectionState.isConnected}
  <div class="loading">
    <p>Connecting to SpacetimeDB...</p>
  </div>
{:else}
  {@render children()}
{/if}

<style>
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
</style>