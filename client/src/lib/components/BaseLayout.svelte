<script lang="ts">
  import { DbConnection,  } from '$lib/generated';
  import { Identity } from '@clockworklabs/spacetimedb-sdk';
  import type { Snippet } from 'svelte';
  import { createDbContext } from '$lib/context/db-context';

  let {conn, id, tok, children}: {conn: DbConnection; id: Identity; tok: string; children: Snippet } = $props()
  createDbContext({conn, id, tok})
</script>

{@render children()}