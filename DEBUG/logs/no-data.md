spacetime.ts:16 ℹ️ INFO Connecting to SpacetimeDB WS...
connection-store.svelte.ts:14 [ConnectionStore] Connection established {id: 'c200f456c9e0d5afe03d2a7943be7c6ff5760e87b4fc29f3d006f30e5d80e1ee'}
board-store.svelte.ts:14 [BoardStore] Initializing...
 [UserStore] User subscription applied
 [UserStore] Initial users loaded: 10
 [UserStore] User inserted: {id: _Identity, name: undefined, online: false}
user-store.svelte.ts:33 [UserStore] User inserted: {id: _Identity, name: 'Dancer', online: false}
user-store.svelte.ts:33 [UserStore] User inserted: {id: _Identity, name: undefined, online: false}
user-store.svelte.ts:33 [UserStore] User inserted: {id: _Identity, name: 'test', online: true}
user-store.svelte.ts:37 [UserStore] Current user updated: {id: _Identity, name: 'test', online: true}
user-store.svelte.ts:33 [UserStore] User inserted: {id: _Identity, name: undefined, online: false}
user-store.svelte.ts:33 [UserStore] User inserted: {id: _Identity, name: undefined, online: false}
user-store.svelte.ts:33 [UserStore] User inserted: {id: _Identity, name: 'Plop', online: false}
user-store.svelte.ts:33 [UserStore] User inserted: {id: _Identity, name: 'Test', online: false}
user-store.svelte.ts:33 [UserStore] User inserted: {id: _Identity, name: 'Call', online: false}
user-store.svelte.ts:33 [UserStore] User inserted: {id: _Identity, name: 'Pete', online: true}
board-store.svelte.ts:27 [BoardStore] Board subscription applied
board-store.svelte.ts:36 [BoardStore] Board inserted: {boardId: 1n, slug: 'test', title: 'Test', owner: _Identity, createdAt: _a4} Event: {tag: 'SubscribeApplied'}
board-store.svelte.ts:36 [BoardStore] Board inserted: {boardId: 2n, slug: 'test2', title: 'test', owner: _Identity, createdAt: _a4} Event: {tag: 'SubscribeApplied'}
board-store.svelte.ts:36 [BoardStore] Board inserted: {boardId: 4n, slug: 'test4', title: 'test', owner: _Identity, createdAt: _a4} Event: {tag: 'SubscribeApplied'}
board-store.svelte.ts:36 [BoardStore] Board inserted: {boardId: 4098n, slug: 'test123', title: 'sdfsdf', owner: _Identity, createdAt: _a4} Event: {tag: 'SubscribeApplied'}
board-store.svelte.ts:36 [BoardStore] Board inserted: {boardId: 8195n, slug: 'test555', title: 'tessadf', owner: _Identity, createdAt: _a4} Event: {tag: 'SubscribeApplied'}
errors.js:315  Uncaught Svelte error: state_unsafe_mutation
Updating state inside `$derived(...)`, `$inspect(...)` or a template expression is forbidden. If the value should not be reactive, declare it without `$state`
https://svelte.dev/e/state_unsafe_mutation

	in <unknown>
	in BoardList.svelte
	in AppShell.svelte
	in +page.svelte
	in ConnectionInitializer.svelte
	in +layout.svelte
	in root.svelte

    at state_unsafe_mutation (http://localhost:5173/node_modules/.vite/deps/chunk-TUMHM6HT.js?v=86bbb010:294:19)
    at Module.set (http://localhost:5173/node_modules/.vite/deps/chunk-TUMHM6HT.js?v=86bbb010:1103:5)
    at set activityCache (http://localhost:5173/src/lib/stores/activity-store.svelte.ts:25:5)
    at ActivityStore.getBoardActivity (http://localhost:5173/src/lib/stores/activity-store.svelte.ts:156:22)
    at getBoardActivity (http://localhost:5173/src/lib/components/BoardList.svelte:56:24)
    at http://localhost:5173/src/lib/components/BoardList.svelte:100:36
    at update_reaction (http://localhost:5173/node_modules/.vite/deps/chunk-TUMHM6HT.js?v=86bbb010:1690:23)
    at execute_derived (http://localhost:5173/node_modules/.vite/deps/chunk-TUMHM6HT.js?v=86bbb010:1024:15)
    at update_derived (http://localhost:5173/node_modules/.vite/deps/chunk-TUMHM6HT.js?v=86bbb010:1041:15)
    at Module.get (http://localhost:5173/node_modules/.vite/deps/chunk-TUMHM6HT.js?v=86bbb010:2028:7)
state_unsafe_mutation @ errors.js:315
set @ sources.js:145
set activityCache @ activity-store.svelte.ts:20
getBoardActivity @ activity-store.svelte.ts:158
getBoardActivity @ BoardList.svelte:22
(anonymous) @ BoardList.svelte:45
update_reaction @ runtime.js:280
execute_derived @ deriveds.js:152
update_derived @ deriveds.js:175
get @ runtime.js:771
(anonymous) @ BoardList.svelte:45
(anonymous) @ each.js:552
update_reaction @ runtime.js:280
update_effect @ runtime.js:452
create_effect @ effects.js:118
branch @ effects.js:368
create_item @ each.js:552
reconcile @ each.js:328
(anonymous) @ each.js:223
update_reaction @ runtime.js:280
update_effect @ runtime.js:452
process_effects @ runtime.js:644
flush_queued_root_effects @ runtime.js:540
global-card-store.svelte.ts:37 [GlobalCardStore] Subscription applied, loading initial data
global-card-store.svelte.ts:71 [GlobalCardStore] Loaded cards for 4 boards
global-card-store.svelte.ts:80 [GlobalCardStore] Card inserted: {cardId: 1n, boardId: 2n, title: 'Test', state: 'todo', assignee: _Identity, …}
global-card-store.svelte.ts:80 [GlobalCardStore] Card inserted: {cardId: 2n, boardId: 2n, title: 'Poop', state: 'todo', assignee: _Identity, …}
global-card-store.svelte.ts:80 [GlobalCardStore] Card inserted: {cardId: 3n, boardId: 4n, title: 'Poop', state: 'done', assignee: _Identity, …}
global-card-store.svelte.ts:80 [GlobalCardStore] Card inserted: {cardId: 4n, boardId: 4n, title: 'Test', state: 'todo', assignee: _Identity, …}
global-card-store.svelte.ts:80 [GlobalCardStore] Card inserted: {cardId: 5n, boardId: 4n, title: 'Gone', state: 'todo', assignee: _Identity, …}
global-card-store.svelte.ts:80 [GlobalCardStore] Card inserted: {cardId: 6n, boardId: 2n, title: '123', state: 'todo', assignee: _Identity, …}
global-card-store.svelte.ts:80 [GlobalCardStore] Card inserted: {cardId: 4098n, boardId: 4098n, title: '11', state: 'todo', assignee: _Identity, …}
global-card-store.svelte.ts:80 [GlobalCardStore] Card inserted: {cardId: 4099n, boardId: 4098n, title: '2', state: 'todo', assignee: _Identity, …}
global-card-store.svelte.ts:80 [GlobalCardStore] Card inserted: {cardId: 4100n, boardId: 4098n, title: '3', state: 'todo', assignee: _Identity, …}
global-card-store.svelte.ts:80 [GlobalCardStore] Card inserted: {cardId: 4101n, boardId: 4098n, title: '4', state: 'todo', assignee: _Identity, …}
global-card-store.svelte.ts:80 [GlobalCardStore] Card inserted: {cardId: 8195n, boardId: 2n, title: 'eet', state: 'todo', assignee: _Identity, …}
global-card-store.svelte.ts:80 [GlobalCardStore] Card inserted: {cardId: 8196n, boardId: 1n, title: 'Poo', state: 'done', assignee: _Identity, …}
global-card-store.svelte.ts:80 [GlobalCardStore] Card inserted: {cardId: 8197n, boardId: 1n, title: 'Dicey', state: 'done', assignee: _Identity, …}
global-card-store.svelte.ts:104 [GlobalCardStore] User added to board 1
global-card-store.svelte.ts:104 [GlobalCardStore] User added to board 2
global-card-store.svelte.ts:104 [GlobalCardStore] User added to board 4
global-card-store.svelte.ts:104 [GlobalCardStore] User added to board 4098
global-card-store.svelte.ts:104 [GlobalCardStore] User added to board 8195
errors.js:315  Uncaught Svelte error: state_unsafe_mutation
Updating state inside `$derived(...)`, `$inspect(...)` or a template expression is forbidden. If the value should not be reactive, declare it without `$state`
https://svelte.dev/e/state_unsafe_mutation

	in <unknown>
	in AppShell.svelte
	in +page.svelte
	in ConnectionInitializer.svelte
	in +layout.svelte
	in root.svelte

    at state_unsafe_mutation (http://localhost:5173/node_modules/.vite/deps/chunk-TUMHM6HT.js?v=86bbb010:294:19)
    at Module.set (http://localhost:5173/node_modules/.vite/deps/chunk-TUMHM6HT.js?v=86bbb010:1103:5)
    at set activityCache (http://localhost:5173/src/lib/stores/activity-store.svelte.ts:25:5)
    at ActivityStore.getBoardActivity (http://localhost:5173/src/lib/stores/activity-store.svelte.ts:156:22)
    at http://localhost:5173/src/lib/stores/activity-store.svelte.ts:175:27
    at Array.reduce (<anonymous>)
    at ActivityStore.getTotalUnreadCount (http://localhost:5173/src/lib/stores/activity-store.svelte.ts:173:19)
    at http://localhost:5173/src/lib/components/BoardList.svelte:60:58
    at update_reaction (http://localhost:5173/node_modules/.vite/deps/chunk-TUMHM6HT.js?v=86bbb010:1690:23)
    at execute_derived (http://localhost:5173/node_modules/.vite/deps/chunk-TUMHM6HT.js?v=86bbb010:1024:15)
state_unsafe_mutation @ errors.js:315
set @ sources.js:145
set activityCache @ activity-store.svelte.ts:20
getBoardActivity @ activity-store.svelte.ts:158
(anonymous) @ activity-store.svelte.ts:179
getTotalUnreadCount @ activity-store.svelte.ts:178
(anonymous) @ BoardList.svelte:26
update_reaction @ runtime.js:280
execute_derived @ deriveds.js:152
update_derived @ deriveds.js:175
check_dirtiness @ runtime.js:206
process_effects @ runtime.js:643
flush_queued_root_effects @ runtime.js:540
global-collaborator-store.svelte.ts:38 [GlobalCollaboratorStore] Subscription applied, loading initial data
global-collaborator-store.svelte.ts:67 [GlobalCollaboratorStore] Loaded collaborators for 5 boards
[NEW] Explain Console errors by using Copilot in Edge: click

         to explain an error.
        Learn more
        Don't show again
