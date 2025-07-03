using SpacetimeDB;
using System;
using System.Linq;

public static partial class Module
{
    [Table(Name = "board_viewer", Public = true)]
    [SpacetimeDB.Index.BTree(Name = "BoardViewers", Columns = [nameof(BoardId)])]
    [SpacetimeDB.Index.BTree(Name = "UserConnections", Columns = [nameof(Identity), nameof(ConnectionId)])]
    public partial struct BoardViewer
    {
        public ulong BoardId;
        public Identity Identity;
        public string ConnectionId;  // Handle multiple tabs
        public Timestamp LastPing;
        public string? UserAgent;    // Optional: Track device type
    }

    [Reducer]
    public static void StartViewingBoard(ReducerContext ctx, ulong boardId)
    {
        // Validate user is collaborator
        var isCollaborator = ctx.Db.collaborator.BoardIdentity
            .Filter((boardId, ctx.Sender)).Any();
        
        if (!isCollaborator)
            throw new Exception("Not authorized to view this board");
        
        // Remove any existing viewer entry for this connection on other boards
        var existingViewers = ctx.Db.board_viewer.UserConnections
            .Filter((ctx.Sender, ctx.ConnectionId?.ToString() ?? "no-connection"))
            .ToList();
        
        foreach (var viewer in existingViewers)
        {
            ctx.Db.board_viewer.Delete(viewer);
        }
        
        // Add viewer entry
        ctx.Db.board_viewer.Insert(new BoardViewer {
            BoardId = boardId,
            Identity = ctx.Sender,
            ConnectionId = ctx.ConnectionId?.ToString() ?? "no-connection",
            LastPing = ctx.Timestamp,
            UserAgent = null // UserAgent not directly available in current SDK
        });
    }

    [Reducer]
    public static void StopViewingBoard(ReducerContext ctx, ulong boardId)
    {
        // Remove specific connection
        var viewers = ctx.Db.board_viewer.UserConnections
            .Filter((ctx.Sender, ctx.ConnectionId?.ToString() ?? "no-connection"))
            .ToList();
        
        foreach (var viewer in viewers)
        {
            if (viewer.BoardId == boardId)
                ctx.Db.board_viewer.Delete(viewer);
        }
    }

    [Reducer]
    public static void PingBoardView(ReducerContext ctx, ulong boardId)
    {
        // Update LastPing for keepalive
        var viewers = ctx.Db.board_viewer.UserConnections
            .Filter((ctx.Sender, ctx.ConnectionId?.ToString() ?? "no-connection"))
            .Where(v => v.BoardId == boardId)
            .ToList();
        
        if (viewers.Count > 0)
        {
            var viewer = viewers[0];
            // Delete old entry
            ctx.Db.board_viewer.Delete(viewer);
            // Insert updated entry
            viewer.LastPing = ctx.Timestamp;
            ctx.Db.board_viewer.Insert(viewer);
        }
    }

    #pragma warning disable STDB_UNSTABLE
    // Visibility filter for board_viewer table - users can only see viewers for boards they collaborate on
    [ClientVisibilityFilter]
    public static readonly Filter BOARD_VIEWER_VIS =
        new Filter.Sql(@"
            SELECT board_viewer.* FROM board_viewer
            INNER JOIN collaborator ON board_viewer.BoardId = collaborator.BoardId
            WHERE collaborator.Identity = :sender
        ");
    #pragma warning restore STDB_UNSTABLE
}