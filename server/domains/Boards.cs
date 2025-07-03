using SpacetimeDB;
using System;

public static partial class Module
{
    [Table(Name = "board", Public = true)]
    public partial struct Board
    {
        [PrimaryKey, AutoInc] public ulong BoardId;
        [Unique]              public string Slug;
        public string Title;
        public Identity Owner;
        public Timestamp CreatedAt;
    }

    [Table(Name = "collaborator", Public = true)]
    public partial struct Collaborator
    {
        public ulong BoardId;
        public Identity Identity;
    }

    #pragma warning disable STDB_UNSTABLE
    [ClientVisibilityFilter]
    public static readonly Filter BOARD_VIS =
        new Filter.Sql(@"
            SELECT board.* FROM board
            INNER JOIN collaborator ON board.BoardId = collaborator.BoardId
            WHERE collaborator.Identity = :sender
        ");
    #pragma warning restore STDB_UNSTABLE

    [Reducer]
    public static void CreateBoard(ReducerContext ctx, string slug, string title)
    {
        slug = slug.Trim().ToLowerInvariant();
        if (ctx.Db.board.Slug.Find(slug) is not null)
            throw new Exception("slug already used");

        var board = ctx.Db.board.Insert(new Board {
            Slug = slug,
            Title = title,
            Owner = ctx.Sender,
            CreatedAt = ctx.Timestamp
        });

        ctx.Db.collaborator.Insert(new Collaborator {
            BoardId = board.BoardId,
            Identity = ctx.Sender
        });
    }

    [Reducer]
    public static void AddCollaborator(ReducerContext ctx, ulong boardId, Identity identity)
    {
        if (ctx.Db.board.BoardId.Find(boardId) is null)
            throw new Exception("board not found");

        if (ctx.Db.collaborator.BoardId.Identity.Find((boardId, identity)) is not null)
            throw new Exception("collaborator already exists");

        ctx.Db.collaborator.Insert(new Collaborator {
            BoardId = boardId,
            Identity = identity
        });
    }
}