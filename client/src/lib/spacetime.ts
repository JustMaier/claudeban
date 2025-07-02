import { DbConnection, type ErrorContext } from '../generated';
import { Identity } from '@clockworklabs/spacetimedb-sdk';

export function connectDb(): DbConnection {
  return DbConnection.builder() // :contentReference[oaicite:0]{index=0}
    .withUri('ws://localhost:3000')
    .withModuleName('kanban-plus')
    .withToken(localStorage.getItem('auth') ?? '')
    .onConnect((conn: DbConnection, id: Identity, tok: string) => {
      localStorage.setItem('auth', tok);

      conn
        .subscriptionBuilder() // :contentReference[oaicite:1]{index=1}
        .onApplied(() => {
          console.log('connected');
        })
        .subscribe(['SELECT * FROM board', 'SELECT * FROM card']);
    })
    .onConnectError((_ctx: ErrorContext, err: Error) => {
		console.log('error', err);
	})
    .build(); // opens WebSocket
}
