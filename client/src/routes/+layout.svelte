<script lang="ts">
  import { onMount } from 'svelte';
  import type { LayoutProps } from './$types';
  import { connectDb } from '$lib/spacetime';
  import { DbConnection } from '$lib/generated';
  import { Identity } from '@clockworklabs/spacetimedb-sdk';
  import BaseLayout from '$lib/components/BaseLayout.svelte'


  // TODO - pull in auth cookie
  let { children }: LayoutProps = $props();
  let connection: DbConnection | undefined = $state()
  let identity: Identity | undefined = $state();
  let token: string | undefined = $state()

  connectDb((conn, id, tok) => {
    connection = conn;
    identity = id;
    token = tok;
  })
</script>

{#if !connection || !identity || !token}
  <p>Loading</p>
{:else}
  <BaseLayout conn={connection} id={identity} tok={token}>
    {@render children()}
  </BaseLayout>
{/if}
