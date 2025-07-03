import type { User } from '$lib/generated';
import { getConnection } from './connection-store.svelte';
import { idMatch } from '$lib/utils/db-utils';

let userMap = $state<Map<string, User>>(new Map());
let currentUser = $state<User | undefined>();
let initialized = false;

export function initializeUserStore() {
  if (initialized) return;
  initialized = true;

  const { conn, id } = getConnection();

  // Subscribe first without listeners to get initial data
  conn.subscriptionBuilder()
    .onApplied(() => {
      console.log('[UserStore] User subscription applied');
      // Get current user from cache
      const cachedUser = conn.db.user.id.find(id);
      if (cachedUser) {
        currentUser = cachedUser;
      }
      // Get all users and store in map
      userMap.clear();
      for (const user of conn.db.user.iter()) {
        userMap.set(user.id.toHexString(), user);
      }
      console.log('[UserStore] Initial users loaded:', userMap.size);

      // Set up listeners after initial data is loaded
      conn.db.user.onInsert((_ctx, user) => {
        console.log('[UserStore] User inserted:', user);
        userMap.set(user.id.toHexString(), user);
        userMap = new Map(userMap); // Trigger reactivity
        if (idMatch(user.id, id)) {
          console.log('[UserStore] Current user updated:', user);
          currentUser = user;
        }
      });

      conn.db.user.onUpdate((_ctx, _old, user) => {
        console.log('[UserStore] User updated:', user);
        userMap.set(user.id.toHexString(), user);
        userMap = new Map(userMap); // Trigger reactivity
        if (idMatch(user.id, id)) {
          console.log('[UserStore] Current user updated:', user);
          currentUser = user;
        }
      });

      conn.db.user.onDelete((_ctx, user) => {
        console.log('[UserStore] User deleted:', user);
        userMap.delete(user.id.toHexString());
        userMap = new Map(userMap); // Trigger reactivity
        if (idMatch(user.id, id)) {
          currentUser = undefined;
        }
      });
    })
    .subscribe(['SELECT * FROM user']);
}

export function useUserStore() {
  return {
    get users() { return Array.from(userMap.values()); },
    get userMap() { return userMap; },
    get currentUser() { return currentUser; },
    async setUserName(name: string) {
      const { conn } = getConnection();
      await conn.reducers.setUserName(name);
    }
  };
}