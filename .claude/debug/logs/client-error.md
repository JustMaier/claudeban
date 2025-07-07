spacetime.ts:16 ℹ️ INFO Connecting to SpacetimeDB WS...
connection-store.svelte.ts:14 [ConnectionStore] Connection established {id: 'c200f456c9e0d5afe03d2a7943be7c6ff5760e87b4fc29f3d006f30e5d80e1ee'}
 [BoardStore] Initializing...
 [BoardViewerStore] Initializing...
 [UserStore] User subscription applied
 [UserStore] Initial users loaded: 10
 [UserStore] User inserted: {id: _Identity, name: undefined, online: false}
 [UserStore] User inserted: {id: _Identity, name: 'Dancer', online: false}
 [UserStore] User inserted: {id: _Identity, name: undefined, online: false}
 [UserStore] User inserted: {id: _Identity, name: 'test', online: true}
 [UserStore] Current user updated: {id: _Identity, name: 'test', online: true}
 [UserStore] User inserted: {id: _Identity, name: undefined, online: false}
 [UserStore] User inserted: {id: _Identity, name: undefined, online: false}
 [UserStore] User inserted: {id: _Identity, name: 'Plop', online: false}
 [UserStore] User inserted: {id: _Identity, name: 'Test', online: false}
 [UserStore] User inserted: {id: _Identity, name: 'Call', online: false}
 [UserStore] User inserted: {id: _Identity, name: 'Pete', online: true}
 [BoardStore] Board subscription applied
board-store.svelte.ts:36 [BoardStore] Board inserted: {boardId: 1n, slug: 'test', title: 'Test', owner: _Identity, createdAt: _a4} Event: {tag: 'SubscribeApplied'}
board-store.svelte.ts:36 [BoardStore] Board inserted: {boardId: 2n, slug: 'test2', title: 'test', owner: _Identity, createdAt: _a4} Event: {tag: 'SubscribeApplied'}
board-store.svelte.ts:36 [BoardStore] Board inserted: {boardId: 4n, slug: 'test4', title: 'test', owner: _Identity, createdAt: _a4} Event: {tag: 'SubscribeApplied'}
board-store.svelte.ts:36 [BoardStore] Board inserted: {boardId: 4098n, slug: 'test123', title: 'sdfsdf', owner: _Identity, createdAt: _a4} Event: {tag: 'SubscribeApplied'}
board-store.svelte.ts:36 [BoardStore] Board inserted: {boardId: 8195n, slug: 'test555', title: 'tessadf', owner: _Identity, createdAt: _a4} Event: {tag: 'SubscribeApplied'}
board-viewer-store.svelte.ts:36 [BoardViewerStore] Board viewer subscription applied
board-viewer-store.svelte.ts:66  [BoardViewerStore] board_viewer table not yet available - presence features disabled
overrideMethod @ hook.js:608
warn @ client.js:3022
(anonymous) @ board-viewer-store.svelte.ts:66
(anonymous) @ index.js:2857
emit @ index.js:2064
processMessage_fn @ index.js:3442
await in processMessage_fn
(anonymous) @ index.js:3505
Promise.then
handleOnMessage_fn2 @ index.js:3504
handleOnMessage_fn @ index.js:2484
global-card-store.svelte.ts:37 [GlobalCardStore] Subscription applied, loading initial data
global-card-store.svelte.ts:71 [GlobalCardStore] Loaded cards for 4 boards
global-card-store.svelte.ts:80 [GlobalCardStore] Card inserted: {cardId: 1n, boardId: 2n, title: 'Test', state: 'done', assignee: _Identity, …}
global-card-store.svelte.ts:80 [GlobalCardStore] Card inserted: {cardId: 2n, boardId: 2n, title: 'Poop', state: 'done', assignee: _Identity, …}
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
global-collaborator-store.svelte.ts:38 [GlobalCollaboratorStore] Subscription applied, loading initial data
global-collaborator-store.svelte.ts:67 [GlobalCollaboratorStore] Loaded collaborators for 5 boards
board-viewer-store.svelte.ts:135  [BoardViewerStore] Board viewer feature not available
overrideMethod @ hook.js:608
warn @ client.js:3022
startViewing @ board-viewer-store.svelte.ts:135
$effect @ board-viewer-store.svelte.ts:233
update_reaction @ runtime.js:280
update_effect @ runtime.js:452
flush_queued_effects @ runtime.js:569
flush_queued_root_effects @ runtime.js:541
hook.js:608  Last ten effects were:  (10) [ƒ, ƒ, ƒ, ƒ, ƒ, ƒ, ƒ, ƒ, ƒ, ƒ]
overrideMethod @ hook.js:608
log_effect_stack @ runtime.js:482
infinite_loop_guard @ runtime.js:507
flush_queued_root_effects @ runtime.js:531
errors.js:176  Uncaught Svelte error: effect_update_depth_exceeded
Maximum update depth exceeded. This can happen when a reactive block or effect repeatedly sets a new value. Svelte limits the number of nested updates to prevent infinite loops
https://svelte.dev/e/effect_update_depth_exceeded
effect_update_depth_exceeded @ errors.js:176
infinite_loop_guard @ runtime.js:491
flush_queued_root_effects @ runtime.js:531
hook.js:608  Last ten effects were:  (10) [ƒ, ƒ, ƒ, ƒ, ƒ, ƒ, ƒ, ƒ, ƒ, ƒ]
overrideMethod @ hook.js:608
log_effect_stack @ runtime.js:482
infinite_loop_guard @ runtime.js:507
flush_queued_root_effects @ runtime.js:531
errors.js:176  Uncaught Svelte error: effect_update_depth_exceeded
Maximum update depth exceeded. This can happen when a reactive block or effect repeatedly sets a new value. Svelte limits the number of nested updates to prevent infinite loops
https://svelte.dev/e/effect_update_depth_exceeded
effect_update_depth_exceeded @ errors.js:176
infinite_loop_guard @ runtime.js:491
flush_queued_root_effects @ runtime.js:531
