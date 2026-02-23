import { SimulationHistory, SimulationState, TwinConfig } from "@/lib/simulation";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, AlertTriangle, CheckCircle } from "lucide-react";

interface SimulationDashboardProps {
  config: TwinConfig;
  state: SimulationState;
  history: SimulationHistory;
}

const CHART_COLORS = ['#00e5ff', '#b388ff', '#69f0ae', '#ffab40', '#ff5252'];

export function SimulationDashboard({ config, state, history }: SimulationDashboardProps) {
  const sensors = config.components.filter(c => c.type === 'sensor');

  const chartData = history.timestamps.map((t, i) => {
    const point: Record<string, number> = { time: t };
    for (const key of Object.keys(history.series)) {
      point[key] = history.series[key][i] ?? 0;
    }
    return point;
  });

  const recentEvents = state.events.slice(-8).reverse();

  return (
    <div className="glass-panel flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 border-b border-border/50">
        <Activity className="w-5 h-5 text-glow-success" />
        <h2 className="font-display font-semibold text-foreground">Live Dashboard</h2>
        <span className="ml-auto text-xs font-mono text-muted-foreground">Step {state.time}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {/* Metrics cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {sensors.map((s, i) => {
            const val = state.readings[s.id] ?? 0;
            const threshold = Number(s.params.moisture_threshold ?? 50);
            const isLow = val < threshold;
            return (
              <div key={s.id} className="bg-muted/30 rounded-lg p-3 border border-border/30">
                <div className="text-xs text-muted-foreground mb-1">{s.name}</div>
                <div className="font-mono text-xl font-semibold" style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}>
                  {val.toFixed(1)}
                </div>
                {s.params.moisture_threshold !== undefined && (
                  <div className={`text-xs mt-1 flex items-center gap-1 ${isLow ? 'text-glow-warning' : 'text-glow-success'}`}>
                    {isLow ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                    {isLow ? 'Below threshold' : 'Normal'}
                  </div>
                )}
              </div>
            );
          })}
          {config.components.filter(c => c.type === 'actuator').map(a => (
            <div key={a.id} className="bg-muted/30 rounded-lg p-3 border border-border/30">
              <div className="text-xs text-muted-foreground mb-1">{a.name}</div>
              <div className={`font-mono text-xl font-semibold ${state.active[a.id] ? 'text-glow-accent' : 'text-muted-foreground'}`}>
                {state.active[a.id] ? 'ON' : 'OFF'}
              </div>
              <div className="text-xs mt-1 text-muted-foreground font-mono">{a.logic ?? ''}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        {chartData.length > 1 && (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.slice(-60)}>
                <defs>
                  {sensors.map((s, i) => (
                    <linearGradient key={s.id} id={`grad-${s.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(260, 20%, 18%)" />
                <XAxis dataKey="time" tick={{ fill: 'hsl(260, 10%, 55%)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'hsl(260, 10%, 55%)', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: 'hsl(260, 25%, 10%)', border: '1px solid hsl(260, 20%, 18%)', borderRadius: 8, fontSize: 12 }} />
                {sensors.map((s, i) => (
                  <Area
                    key={s.id}
                    type="monotone"
                    dataKey={s.id}
                    stroke={CHART_COLORS[i % CHART_COLORS.length]}
                    fill={`url(#grad-${s.id})`}
                    strokeWidth={2}
                    name={s.name}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Event log */}
        {recentEvents.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Event Log</h3>
            <div className="space-y-1.5">
              {recentEvents.map((ev, i) => (
                <div key={i} className="flex items-start gap-2 text-xs bg-muted/20 rounded-md px-3 py-2">
                  <span className="font-mono text-muted-foreground shrink-0">t={ev.time}</span>
                  <span className={`${ev.type === 'action' ? 'text-glow-accent' : ev.type === 'warning' ? 'text-glow-warning' : 'text-foreground'}`}>
                    <strong>{ev.component}:</strong> {ev.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
