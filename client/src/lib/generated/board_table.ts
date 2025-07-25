// THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
// WILL NOT BE SAVED. MODIFY TABLES IN YOUR MODULE SOURCE CODE INSTEAD.

// This was generated using spacetimedb cli version 1.2.0 (commit fb41e50eb73573b70eea532aeb6158eaac06fae0).

/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
import {
  AlgebraicType,
  AlgebraicValue,
  BinaryReader,
  BinaryWriter,
  ConnectionId,
  DbConnectionBuilder,
  DbConnectionImpl,
  Identity,
  ProductType,
  ProductTypeElement,
  SubscriptionBuilderImpl,
  SumType,
  SumTypeVariant,
  TableCache,
  TimeDuration,
  Timestamp,
  deepEqual,
  type CallReducerFlags,
  type DbContext,
  type ErrorContextInterface,
  type Event,
  type EventContextInterface,
  type ReducerEventContextInterface,
  type SubscriptionEventContextInterface,
} from "@clockworklabs/spacetimedb-sdk";
import { Board } from "./board_type";
import { type EventContext, type Reducer, RemoteReducers, RemoteTables } from ".";

/**
 * Table handle for the table `board`.
 *
 * Obtain a handle from the [`board`] property on [`RemoteTables`],
 * like `ctx.db.board`.
 *
 * Users are encouraged not to explicitly reference this type,
 * but to directly chain method calls,
 * like `ctx.db.board.on_insert(...)`.
 */
export class BoardTableHandle {
  tableCache: TableCache<Board>;

  constructor(tableCache: TableCache<Board>) {
    this.tableCache = tableCache;
  }

  count(): number {
    return this.tableCache.count();
  }

  iter(): Iterable<Board> {
    return this.tableCache.iter();
  }
  /**
   * Access to the `boardId` unique index on the table `board`,
   * which allows point queries on the field of the same name
   * via the [`BoardBoardIdUnique.find`] method.
   *
   * Users are encouraged not to explicitly reference this type,
   * but to directly chain method calls,
   * like `ctx.db.board.boardId().find(...)`.
   *
   * Get a handle on the `boardId` unique index on the table `board`.
   */
  boardId = {
    // Find the subscribed row whose `boardId` column value is equal to `col_val`,
    // if such a row is present in the client cache.
    find: (col_val: bigint): Board | undefined => {
      for (let row of this.tableCache.iter()) {
        if (deepEqual(row.boardId, col_val)) {
          return row;
        }
      }
    },
  };
  /**
   * Access to the `slug` unique index on the table `board`,
   * which allows point queries on the field of the same name
   * via the [`BoardSlugUnique.find`] method.
   *
   * Users are encouraged not to explicitly reference this type,
   * but to directly chain method calls,
   * like `ctx.db.board.slug().find(...)`.
   *
   * Get a handle on the `slug` unique index on the table `board`.
   */
  slug = {
    // Find the subscribed row whose `slug` column value is equal to `col_val`,
    // if such a row is present in the client cache.
    find: (col_val: string): Board | undefined => {
      for (let row of this.tableCache.iter()) {
        if (deepEqual(row.slug, col_val)) {
          return row;
        }
      }
    },
  };

  onInsert = (cb: (ctx: EventContext, row: Board) => void) => {
    return this.tableCache.onInsert(cb);
  }

  removeOnInsert = (cb: (ctx: EventContext, row: Board) => void) => {
    return this.tableCache.removeOnInsert(cb);
  }

  onDelete = (cb: (ctx: EventContext, row: Board) => void) => {
    return this.tableCache.onDelete(cb);
  }

  removeOnDelete = (cb: (ctx: EventContext, row: Board) => void) => {
    return this.tableCache.removeOnDelete(cb);
  }

  // Updates are only defined for tables with primary keys.
  onUpdate = (cb: (ctx: EventContext, oldRow: Board, newRow: Board) => void) => {
    return this.tableCache.onUpdate(cb);
  }

  removeOnUpdate = (cb: (ctx: EventContext, onRow: Board, newRow: Board) => void) => {
    return this.tableCache.removeOnUpdate(cb);
  }}
