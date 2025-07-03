import type { DbConnection } from '$lib/generated';
import type { Identity } from '@clockworklabs/spacetimedb-sdk';

let connection = $state<DbConnection | undefined>();
let identity = $state<Identity | undefined>();
let token = $state<string | undefined>();
let isConnected = $state(false);

export function setConnection(conn: DbConnection, id: Identity, tok: string) {
  connection = conn;
  identity = id;
  token = tok;
  isConnected = true;
  console.log('[ConnectionStore] Connection established', { id: id.toHexString() });
}

export function getConnection() {
  if (!connection || !identity || !token) {
    throw new Error('Connection not initialized. Make sure ConnectionInitializer is rendered.');
  }
  return { conn: connection, id: identity, tok: token };
}

export function useConnection() {
  return {
    get conn() { return connection; },
    get id() { return identity; },
    get token() { return token; },
    get isConnected() { return isConnected; }
  };
}