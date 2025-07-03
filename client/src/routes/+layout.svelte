<script lang="ts">
  import type { LayoutProps } from './$types';
  import ConnectionInitializer from '$lib/components/ConnectionInitializer.svelte';

  let { children }: LayoutProps = $props();
</script>

<ConnectionInitializer>
  {@render children()}
</ConnectionInitializer>
