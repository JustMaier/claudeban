import type { Identity } from '@clockworklabs/spacetimedb-sdk';

export function idMatch(a: Identity, b: Identity) {
  return a.toHexString() === b.toHexString();
}