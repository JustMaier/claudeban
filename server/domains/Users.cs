using SpacetimeDB;

public static partial class Module
{
    [Table(Name = "user", Public = true)]
    public partial struct User
    {
        [PrimaryKey] public Identity Id;
        public string? Name;
        public bool Online;
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
}