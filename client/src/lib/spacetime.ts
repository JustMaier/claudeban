import { DbConnection, type ErrorContext } from '$lib/generated';
import { Identity } from '@clockworklabs/spacetimedb-sdk';

export function connectDb(connectedCb: (conn: DbConnection, id: Identity, tok: string) => void): DbConnection {
  return DbConnection.builder() // :contentReference[oaicite:0]{index=0}
    .withUri('ws://localhost:3000')
    .withModuleName('kanban-plus')
    .withToken(localStorage.getItem('auth') ?? '')
    .onConnect((conn: DbConnection, id: Identity, tok: string) => {
      localStorage.setItem('auth', tok);
      connectedCb(conn, id, tok);
    })
    .onConnectError((_ctx: ErrorContext, err: Error) => {
		console.log('error', err);
	})
    .build(); // opens WebSocket
}
