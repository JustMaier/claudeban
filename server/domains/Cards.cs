using SpacetimeDB;
using System;
using System.Linq;

public static partial class Module
{
    [Table(Name = "card", Public = true)]
    public partial struct Card
    {
        [PrimaryKey, AutoInc] public ulong CardId;
        public ulong  BoardId;
        public string Title;
        public string State;
        public Identity Assignee;
        public Timestamp CreatedAt;
        public Timestamp? CompletedAt;
    }

    [Reducer]
    public static void AddCard(ReducerContext ctx, ulong boardId, string title)
    {
        var board = ctx.Db.board.BoardId.Find(boardId) ??
            throw new Exception("board not found");
        if (!ctx.Db.collaborator.Iter().Any(c => c.BoardId == boardId && c.Identity == ctx.Sender))
            throw new Exception("not allowed");

        ctx.Db.card.Insert(new Card {
            BoardId = boardId,
            Title   = title,
            State   = "todo",
            Assignee = ctx.Sender,
            CreatedAt = ctx.Timestamp
        });
    }

    [Reducer]
    public static void CompleteCard(ReducerContext ctx, ulong cardId)
    {
        var c = ctx.Db.card.CardId.Find(cardId) ??
            throw new Exception("no card");

        if (c.Assignee != ctx.Sender) throw new Exception("not your card");

        c.State = "done";
        c.CompletedAt = ctx.Timestamp;
        ctx.Db.card.CardId.Update(c);
    }

    [Reducer]
    public static void ReassignCard(ReducerContext ctx, ulong cardId, Identity newAssignee)
    {
        var c = ctx.Db.card.CardId.Find(cardId) ??
            throw new Exception("no card");

        // Check if sender is a collaborator on the board
        if (!ctx.Db.collaborator.Iter().Any(col => col.BoardId == c.BoardId && col.Identity == ctx.Sender))
            throw new Exception("not a collaborator on this board");

        // Check if new assignee is a collaborator on the board
        if (!ctx.Db.collaborator.Iter().Any(col => col.BoardId == c.BoardId && col.Identity == newAssignee))
            throw new Exception("new assignee is not a collaborator on this board");

        c.Assignee = newAssignee;
        ctx.Db.card.CardId.Update(c);
    }
}