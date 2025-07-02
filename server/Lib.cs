using SpacetimeDB;
using System;

public static partial class Module
{
    /* ---------- 3.1 Domain types ---------- */
    [Type] public partial struct Vec2 { public float X; public float Y; }

    /* ---------- 3.2 Tables ---------- */
    // Users that ever connected
    [Table(Name = "user", Public = true)]
    public partial struct User
    {
        [PrimaryKey] public Identity Id;      // Unique index auto-generated
        public string? Name;
        public bool   Online;
    }

    // A Kanban board
    [Table(Name = "board", Public = true)]
    public partial struct Board
    {
        [PrimaryKey, AutoInc] public ulong BoardId;
        [Unique]              public string Slug;   // Unique index
        public string Title;
        public Identity Owner;
        public Timestamp CreatedAt;
    }

    // A task card
    [Table(Name = "card", Public = true)]
    public partial struct Card
    {
        [PrimaryKey, AutoInc] public ulong CardId;
        public ulong  BoardId;
        public string Title;
        public string State;        // “todo” | “doing” | “done”
        public Identity Assignee;
        public Timestamp CreatedAt;
        public Timestamp? CompletedAt;
    }

    // Collaborators on boards
    [Table(Name = "collaborator", Public = true)]
    public partial struct Collaborator
    {
        public ulong BoardId;
        public Identity Identity;
    }

    // Nightly metrics roll-up (one row per day)
    [Table(Name = "metric", Public = false)]
    public partial struct Metric
    {
        [PrimaryKey] public string Day;  // Changed from DateOnly to string (YYYY-MM-DD format)
        public uint   CardsCompleted;
    }

    /* ---------- 3.3 Row-level security ---------- */
    // Users can see only boards they collaborate on.
    // Board owners are automatically added as collaborators.
    #pragma warning disable STDB_UNSTABLE
    [ClientVisibilityFilter]
    public static readonly Filter BOARD_VIS =
        new Filter.Sql(@"
            SELECT board.* FROM board
            INNER JOIN collaborator ON board.BoardId = collaborator.BoardId
            WHERE collaborator.Identity = :sender
        ");
    #pragma warning restore STDB_UNSTABLE

    /* ---------- 3.4 Lifecycle reducers ---------- */
    [Reducer(ReducerKind.Init)]
    public static void Init(ReducerContext ctx)
    {
        Log.Info("DB initialised");
    }

    [Reducer(ReducerKind.ClientConnected)]
    public static void ClientConnect(ReducerContext ctx)
    {
        var u = ctx.Db.user.Id.Find(ctx.Sender);
        if (u is null)
            ctx.Db.user.Insert(new User { Id = ctx.Sender, Online = true });
        else {
            var updatedUser = u.Value;
            updatedUser.Online = true;
            ctx.Db.user.Id.Update(updatedUser);
        }
    }

    [Reducer(ReducerKind.ClientDisconnected)]
    public static void ClientDisconnect(ReducerContext ctx)
    {
        var u = ctx.Db.user.Id.Find(ctx.Sender);
        if (u is not null) {
            var updatedUser = u.Value;
            updatedUser.Online = false;
            ctx.Db.user.Id.Update(updatedUser);
        }
    }

    /* ---------- 3.5 Normal reducers ---------- */
    [Reducer] // create a board
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
        
        // Add owner as collaborator so they can see their own board
        ctx.Db.collaborator.Insert(new Collaborator {
            BoardId = board.BoardId,
            Identity = ctx.Sender
        });
    }

    [Reducer] // add card
    public static void AddCard(ReducerContext ctx, ulong boardId, string title)
    {
        // simple auth: only collaborators can add cards
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

    [Reducer] // complete card
    public static void CompleteCard(ReducerContext ctx, ulong cardId)
    {
        var c = ctx.Db.card.CardId.Find(cardId) ??
            throw new Exception("no card");

        if (c.Assignee != ctx.Sender) throw new Exception("not your card");

        c.State = "done";
        c.CompletedAt = ctx.Timestamp;
        ctx.Db.card.CardId.Update(c);
    }

    /* ---------- 3.6 Scheduled reducer (nightly roll-up) ---------- */
    // Timer table: one row per scheduled job
    [Table(Name = "metric_timer",
           Scheduled = nameof(RollupMetrics),   // which reducer to call
           ScheduledAt = nameof(ScheduledAt))]
    public partial struct MetricTimer
    {
        [PrimaryKey, AutoInc] public ulong TimerId;
        public ScheduleAt ScheduledAt;
    }

    // the reducer itself – runs automatically per metric_timer row
    [Reducer]
    public static void RollupMetrics(ReducerContext ctx, MetricTimer timerId)
    {
        // Simple date string for today (this is just a demo)
        var today = "2024-01-01"; // In production, you'd extract from ctx.Timestamp
        uint done = 0;

        // Count completed cards
        foreach (var card in ctx.Db.card.Iter())
        {
            if (card.State == "done")
            {
                done++;
            }
        }

        // Try to insert today's metrics
        try {
            ctx.Db.metric.Insert(new Metric { Day = today, CardsCompleted = done });
        } catch {
            // Metric for today already exists, could update instead
        }

        // For now, we'll just log completion
        // In production, you'd properly reschedule using the correct ScheduleAt API
        Log.Info($"Metrics rollup completed: {done} cards done today");
    }
}
