import { SpacetimeDBClient } from '@clockworklabs/spacetimedb-sdk';
import type { Identity } from '@clockworklabs/spacetimedb-sdk';

// Import generated types and reducers
import { 
  User,
  Board, 
  Card,
  Collaborator,
  CreateBoard,
  AddCard,
  CompleteCard
} from '../generated/kanban_plus';

// Create and export the client instance
export const stdbClient = new SpacetimeDBClient('kanban-plus', 'ws://localhost:3000');

// Export tables for easy access
export const tables = {
  user: User,
  board: Board,
  card: Card,
  collaborator: Collaborator
};

// Export reducers for easy access
export const reducers = {
  createBoard: CreateBoard,
  addCard: AddCard,
  completeCard: CompleteCard
};

// Helper to get current user identity
export function getCurrentIdentity(): Identity | null {
  return stdbClient.identity;
}

// Connect to SpacetimeDB
export async function connect() {
  await stdbClient.connect();
}