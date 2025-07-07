# End-to-End Type Safety in SpacetimeDB

This guide covers how SpacetimeDB maintains type safety from C# server code to TypeScript client code, ensuring compile-time type checking across your entire distributed system.

## Table of Contents

1. [Overview](#overview)
2. [Type Generation Workflow](#type-generation-workflow)
3. [C# to TypeScript Type Mappings](#c-to-typescript-type-mappings)
4. [Generated Code Structure](#generated-code-structure)
5. [Type Safety Patterns](#type-safety-patterns)
6. [Common Issues and Solutions](#common-issues-and-solutions)
7. [CI/CD Integration](#cicd-integration)
8. [Versioning and Breaking Changes](#versioning-and-breaking-changes)

## Overview

SpacetimeDB's type generation system automatically creates TypeScript interfaces from your C# table definitions and reducer signatures. This ensures that:

- Table schemas are consistent between server and client
- Reducer arguments are type-checked at compile time
- API changes are immediately reflected in generated types
- Runtime type errors are minimized

## Type Generation Workflow

### 1. Define Tables in C#

```csharp
// server/domains/Users.cs
[Table(Name = "user", Public = true)]
public partial struct User
{
    [PrimaryKey] public Identity Id;
    public string? Name;
    public bool Online;
}

[Table(Name = "card", Public = true)]
public partial struct Card
{
    [PrimaryKey, AutoInc] public ulong CardId;
    public ulong BoardId;
    public string Title;
    public string State;
    public Identity Assignee;
    public Timestamp CreatedAt;
    public Timestamp? CompletedAt;
}
```

### 2. Define Reducers in C#

```csharp
// server/domains/Cards.cs
[Reducer]
public static void AddCard(ReducerContext ctx, ulong boardId, string title)
{
    // Implementation...
}

[Reducer]
public static void UpdateCardStatus(ReducerContext ctx, ulong cardId, string newStatus)
{
    // Implementation...
}
```

### 3. Generate TypeScript Types

```bash
# From the client directory
spacetime generate --lang typescript --project-path ../server --out-dir src/lib/generated
```

### 4. Use Generated Types in Client

```typescript
// client/src/lib/stores/card-store.svelte.ts
import type { Card } from '$lib/generated';
import { AddCardReducer, UpdateCardStatusReducer } from '$lib/generated';

// Type-safe card operations
function addCard(boardId: bigint, title: string) {
  AddCardReducer.call(boardId, title);
}

function updateCardStatus(cardId: bigint, newStatus: string) {
  UpdateCardStatusReducer.call(cardId, newStatus);
}
```

## C# to TypeScript Type Mappings

SpacetimeDB maps C# types to TypeScript equivalents:

| C# Type | TypeScript Type | Notes |
|---------|-----------------|-------|
| `string` | `string` | UTF-8 encoded |
| `string?` | `string \| undefined` | Nullable types become optional |
| `bool` | `boolean` | |
| `byte` | `number` | |
| `sbyte` | `number` | |
| `short` | `number` | |
| `ushort` | `number` | |
| `int` | `number` | |
| `uint` | `number` | |
| `long` | `bigint` | JavaScript BigInt for 64-bit integers |
| `ulong` | `bigint` | |
| `float` | `number` | |
| `double` | `number` | |
| `Identity` | `Identity` | SpacetimeDB SDK type |
| `Timestamp` | `Timestamp` | SpacetimeDB SDK type |
| `Timestamp?` | `Timestamp \| undefined` | |
| `byte[]` | `Uint8Array` | Binary data |
| `List<T>` | `T[]` | Arrays |

### Special Types

#### Identity
```typescript
// SpacetimeDB Identity type
import { Identity } from '@clockworklabs/spacetimedb-sdk';

// Compare identities
function compareIdentities(a: Identity, b: Identity): boolean {
  return a.toHexString() === b.toHexString();
}
```

#### Timestamp
```typescript
import { Timestamp } from '@clockworklabs/spacetimedb-sdk';

// Timestamp is microseconds since Unix epoch
const now = Timestamp.now();
const date = new Date(Number(now.microseconds / 1000n));
```

## Generated Code Structure

### Table Types (`*_type.ts`)

Each table generates a TypeScript interface and namespace:

```typescript
// generated/user_type.ts
export type User = {
  id: Identity,
  name: string | undefined,
  online: boolean,
};

export namespace User {
  export function getTypeScriptAlgebraicType(): AlgebraicType { /* ... */ }
  export function serialize(writer: BinaryWriter, value: User): void { /* ... */ }
  export function deserialize(reader: BinaryReader): User { /* ... */ }
}
```

### Table Accessors (`*_table.ts`)

Table classes provide database access methods:

```typescript
// generated/user_table.ts
export class UserTableHandle {
  // Find by primary key
  findById(id: Identity): User | undefined;
  
  // Iterate all rows
  iter(): User[];
  
  // Event handlers
  onInsert(handler: (ctx: EventContext, user: User) => void): void;
  onUpdate(handler: (ctx: EventContext, old: User, new: User) => void): void;
  onDelete(handler: (ctx: EventContext, user: User) => void): void;
}
```

### Reducer Functions (`*_reducer.ts`)

Each reducer generates a callable class:

```typescript
// generated/add_card_reducer.ts
export type AddCard = {
  boardId: bigint,
  title: string,
};

export class AddCardReducer {
  static call(boardId: bigint, title: string): void {
    // Calls the server reducer
  }
  
  static onEvent(handler: (ctx: ReducerContext, args: AddCard) => void): void {
    // Listen for reducer events
  }
}
```

## Type Safety Patterns

### 1. Use Generated Types Everywhere

```typescript
//  Good: Using generated types
import type { Card, Board, User } from '$lib/generated';

function processCard(card: Card): void {
  // TypeScript knows all Card properties
  console.log(card.cardId, card.title, card.state);
}

// L Bad: Creating custom types
interface MyCard {
  id: number; // Wrong type! Should be bigint
  title: string;
}
```

### 2. Leverage Type Narrowing

```typescript
// Type-safe state handling
type CardState = 'todo' | 'in_progress' | 'done';

function isValidState(state: string): state is CardState {
  return ['todo', 'in_progress', 'done'].includes(state);
}

function updateCard(cardId: bigint, newState: string) {
  if (!isValidState(newState)) {
    throw new Error(`Invalid state: ${newState}`);
  }
  
  // TypeScript now knows newState is CardState
  UpdateCardStatusReducer.call(cardId, newState);
}
```

### 3. Handle Optional Fields

```typescript
// User.name is optional (string | undefined)
function displayUserName(user: User): string {
  return user.name ?? 'Anonymous';
}

// Card.completedAt is optional (Timestamp | undefined)
function getCompletionDate(card: Card): Date | null {
  if (!card.completedAt) return null;
  return new Date(Number(card.completedAt.microseconds / 1000n));
}
```

### 4. Type-Safe Store Pattern

```typescript
// stores/typed-store.svelte.ts
import type { Board, Card, User } from '$lib/generated';

class TypedStore<T extends { [K in IdField]: bigint }, IdField extends string> {
  private items = $state<Map<bigint, T>>(new Map());
  
  constructor(private idField: IdField) {}
  
  get(id: bigint): T | undefined {
    return this.items.get(id);
  }
  
  set(item: T): void {
    this.items.set(item[this.idField], item);
  }
  
  all(): T[] {
    return Array.from(this.items.values());
  }
}

// Usage
const boardStore = new TypedStore<Board, 'boardId'>('boardId');
const cardStore = new TypedStore<Card, 'cardId'>('cardId');
```

## Common Issues and Solutions

### 1. BigInt Serialization

**Problem:** JSON.stringify doesn't handle BigInt
```typescript
// L Throws: TypeError: Do not know how to serialize a BigInt
JSON.stringify({ cardId: 123n });
```

**Solution:** Use custom serialization
```typescript
//  Convert BigInt to string for JSON
function serializeCard(card: Card) {
  return JSON.stringify({
    ...card,
    cardId: card.cardId.toString(),
    boardId: card.boardId.toString()
  });
}
```

### 2. Identity Comparison

**Problem:** Identity objects can't be compared with ===
```typescript
// L Always false, even for same identity
if (user1.id === user2.id) { /* ... */ }
```

**Solution:** Use string comparison
```typescript
//  Compare hex strings
function isSameUser(a: User, b: User): boolean {
  return a.id.toHexString() === b.id.toHexString();
}
```

### 3. Timestamp Handling

**Problem:** Timestamps are microseconds, not milliseconds
```typescript
// L Wrong: treats microseconds as milliseconds
const date = new Date(card.createdAt.microseconds);
```

**Solution:** Convert to milliseconds
```typescript
//  Convert microseconds to milliseconds
function timestampToDate(ts: Timestamp): Date {
  return new Date(Number(ts.microseconds / 1000n));
}
```

### 4. Optional Field Updates

**Problem:** TypeScript strict null checks
```typescript
// L Type error if strict null checks enabled
function updateUserName(user: User, name: string | null) {
  user.name = name; // Error: Type 'null' is not assignable to type 'string | undefined'
}
```

**Solution:** Convert null to undefined
```typescript
//  Handle null/undefined conversion
function updateUserName(user: User, name: string | null) {
  user.name = name ?? undefined;
}
```

## CI/CD Integration

### Automated Type Generation

Add to your build pipeline:

```yaml
# .github/workflows/build.yml
name: Build
on: [push, pull_request]

jobs:
  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install SpacetimeDB CLI
        run: |
          curl -fsSL https://install.spacetimedb.com | bash
          echo "$HOME/.spacetimedb/bin" >> $GITHUB_PATH
      
      - name: Setup .NET
        uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '8.0.x'
      
      - name: Build Server Module
        run: |
          cd server
          dotnet build
      
      - name: Generate TypeScript Types
        run: |
          cd client
          spacetime generate --lang typescript --project-path ../server --out-dir src/lib/generated
      
      - name: Check for Type Changes
        run: |
          git diff --exit-code client/src/lib/generated || \
          (echo "Generated types have changed. Please run 'spacetime generate' locally and commit the changes." && exit 1)
      
      - name: TypeScript Type Check
        run: |
          cd client
          npm ci
          npm run check
```

### Pre-commit Hook

Ensure types are always in sync:

```bash
# .git/hooks/pre-commit
#!/bin/bash

# Generate types
cd client
spacetime generate --lang typescript --project-path ../server --out-dir src/lib/generated

# Add generated files to commit
git add src/lib/generated

# Run type check
npm run check || exit 1
```

## Versioning and Breaking Changes

### 1. Detecting Breaking Changes

Monitor for changes that break client compatibility:

```typescript
// version-check.ts
import { AlgebraicType } from '@clockworklabs/spacetimedb-sdk';
import { User, Board, Card } from './generated';

const EXPECTED_SCHEMAS = {
  User: 'hash-of-user-schema',
  Board: 'hash-of-board-schema',
  Card: 'hash-of-card-schema',
};

function checkSchemaCompatibility() {
  const schemas = {
    User: hashType(User.getTypeScriptAlgebraicType()),
    Board: hashType(Board.getTypeScriptAlgebraicType()),
    Card: hashType(Card.getTypeScriptAlgebraicType()),
  };
  
  for (const [name, expectedHash] of Object.entries(EXPECTED_SCHEMAS)) {
    if (schemas[name] !== expectedHash) {
      console.warn(`Schema change detected in ${name}`);
    }
  }
}
```

### 2. Handling Schema Evolution

#### Adding Optional Fields (Non-breaking)
```csharp
//  Safe: Adding optional field
public partial struct Card {
    // ... existing fields ...
    public string? Description;  // New optional field
}
```

#### Adding Required Fields (Breaking)
```csharp
//   Breaking: Adding required field
public partial struct Card {
    // ... existing fields ...
    public int Priority;  // Breaking! Existing clients won't send this
}
```

**Migration Strategy:**
1. Add as optional first
2. Update all clients
3. Make required in next version

#### Changing Field Types (Breaking)
```csharp
//   Breaking: Changing type
public partial struct Card {
    // Before: public string State;
    public CardState State;  // Breaking! Type changed
}
```

**Migration Strategy:**
1. Add new field with different name
2. Support both fields temporarily
3. Migrate clients to new field
4. Remove old field

### 3. Version Management

Track module versions in your client:

```typescript
// client/src/lib/config.ts
export const MODULE_VERSION = '1.2.0';

// Check version compatibility
async function checkModuleVersion() {
  const info = await connection.getModuleInfo();
  if (info.version !== MODULE_VERSION) {
    console.warn(`Module version mismatch: expected ${MODULE_VERSION}, got ${info.version}`);
  }
}
```

## Best Practices

1. **Always regenerate types after server changes**
   ```bash
   # Add to your development workflow
   npm run generate-types
   ```

2. **Use strict TypeScript settings**
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "strict": true,
       "strictNullChecks": true,
       "noImplicitAny": true
     }
   }
   ```

3. **Create type guards for runtime validation**
   ```typescript
   function isCard(obj: unknown): obj is Card {
     return obj !== null &&
            typeof obj === 'object' &&
            'cardId' in obj &&
            'title' in obj;
   }
   ```

4. **Document type constraints**
   ```typescript
   /**
    * Card state must be one of: 'todo', 'in_progress', 'done'
    * @throws Error if invalid state provided
    */
   function updateCardStatus(cardId: bigint, state: string) {
     // Validate at runtime since generated types use string
     if (!['todo', 'in_progress', 'done'].includes(state)) {
       throw new Error(`Invalid state: ${state}`);
     }
     UpdateCardStatusReducer.call(cardId, state);
   }
   ```

## Conclusion

SpacetimeDB's type generation provides strong type safety across your distributed system. By following these patterns and practices, you can:

- Catch type errors at compile time
- Maintain consistency between server and client
- Safely evolve your schema over time
- Build robust, type-safe applications

Remember to always regenerate types after server changes and use the generated types throughout your application for maximum type safety.