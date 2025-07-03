import type { User } from '$lib/generated';
import { getConnection } from './connection-store.svelte';
import { idMatch } from '$lib/utils/db-utils';

let users = $state<User[]>([]);
let currentUser = $state<User | undefined>();
let initialized = false;

export function initializeUserStore() {
  if (initialized) return;
  initialized = true;

  const { conn, id } = getConnection();

  // Set up listeners first
  conn.db.user.onInsert((_ctx, user) => {
    console.log('[UserStore] User inserted:', user);
    users = [...users, user];
    if (idMatch(user.id, id)) {
      console.log('[UserStore] Current user updated:', user);
      currentUser = user;
    }
  });

  conn.db.user.onUpdate((_ctx, _old, user) => {
    console.log('[UserStore] User updated:', user);
    users = users.map((u) => (idMatch(u.id, user.id) ? user : u));
    if (idMatch(user.id, id)) {
      console.log('[UserStore] Current user updated:', user);
      currentUser = user;
    }
  });

  // Then subscribe
  conn.subscriptionBuilder()
    .subscribe(['SELECT * FROM user'])
    .onApplied(() => {
      console.log('[UserStore] User subscription applied');
      // Get current user from cache
      const cachedUser = conn.db.user.id.find(id);
      if (cachedUser) {
        currentUser = cachedUser;
      }
      // Get all users
      users = Array.from(conn.db.user.iter());
    });
}

export function useUserStore() {
  return {
    get users() { return users; },
    get currentUser() { return currentUser; },
    async setUserName(name: string) {
      const { conn } = getConnection();
      await conn.reducers.setUserName(name);
    }
  };
}