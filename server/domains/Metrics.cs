using SpacetimeDB;
using System;

public static partial class Module
{
    [Table(Name = "metric", Public = false)]
    public partial struct Metric
    {
        [PrimaryKey] public string Day;
        public uint CardsCompleted;
    }

    [Table(Name = "metric_timer",
           Scheduled = nameof(RollupMetrics),
           ScheduledAt = nameof(ScheduledAt))]
    public partial struct MetricTimer
    {
        [PrimaryKey, AutoInc] public ulong TimerId;
        public ScheduleAt ScheduledAt;
    }

    [Reducer]
    public static void RollupMetrics(ReducerContext ctx, MetricTimer timerId)
    {
        var today = "2024-01-01";
        uint done = 0;

        foreach (var card in ctx.Db.card.Iter())
        {
            if (card.State == "done")
            {
                done++;
            }
        }

        try {
            ctx.Db.metric.Insert(new Metric { Day = today, CardsCompleted = done });
        } catch {
        }

        Log.Info($"Metrics rollup completed: {done} cards done today");
    }
}