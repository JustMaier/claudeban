import { getContext, setContext } from 'svelte';
import { Identity } from '@clockworklabs/spacetimedb-sdk';
import type { DbConnection } from '$lib/generated';


type Context =  {
  conn: DbConnection,
  id: Identity,
  tok: string;
}

const key = 'db-context'
export function createDbContext(args: Context) {
  setContext(key, args);
}

export function useDbContext(): Context {
  return getContext(key);
}