import { useState, useEffect, useRef, useCallback } from "react";
import { PromptChat } from "@/components/PromptChat";
import { TwinVisualizer } from "@/components/TwinVisualizer";
import { SimulationDashboard } from "@/components/SimulationDashboard";
import { ExportPanel } from "@/components/ExportPanel";
import { CodeEditorPanel } from "@/components/CodeEditorPanel";
import {
  TwinConfig,
  SimulationState,
  SimulationHistory,
  createDefaultTwin,
  initState,
  simulateStep,
  parsePromptToConfig,
} from "@/lib/simulation";
import { useTwins, useSaveTwin } from "@/hooks/use-twins";
import { Play, Pause, RotateCcw, Save, FolderOpen } from "lucide-react";
import { toast } from "sonner";
const Index = () => {
  const [config, setConfig] = useState<TwinConfig>(createDefaultTwin());
  const [simState, setSimState] = useState<SimulationState>(() => initState(createDefaultTwin()));
  const [history, setHistory] = useState<SimulationHistory>({ timestamps: [], series: {} });
  const [running, setRunning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedTwinId, setSavedTwinId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const { data: savedTwins } = useTwins();
  const saveTwin = useSaveTwin();

  const step = useCallback(() => {
    setSimState(prev => {
      const next = simulateStep(config, prev);
      setHistory(h => {
        const timestamps = [...h.timestamps, next.time];
        const series = { ...h.series };
        for (const comp of config.components) {
          if (comp.type === 'sensor') {
            series[comp.id] = [...(series[comp.id] ?? []), next.readings[comp.id] ?? 0];
          }
        }
        return { timestamps, series };
      });
      return next;
    });
  }, [config]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(step, 500);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, step]);

  const handlePromptSubmit = (prompt: string) => {
    setIsGenerating(true);
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    setTimeout(() => {
      const newConfig = parsePromptToConfig(prompt);
      setConfig(newConfig);
      setSimState(initState(newConfig));
      setHistory({ timestamps: [], series: {} });
      setIsGenerating(false);
      setRunning(true);
    }, 1200);
  };

  const handleSave = () => {
    saveTwin.mutate(
      { name: config.name, config },
      {
        onSuccess: (data) => {
          setSavedTwinId(data.id);
          toast.success("Twin saved to MySQL!");
        },
        onError: (err) => {
          toast.error(`Save failed: ${err.message}. Is the Express server running on localhost:3001?`);
        },
      }
    );
  };

  const handleLoadTwin = (twin: { config: TwinConfig }) => {
    const loadedConfig = twin.config;
    setConfig(loadedConfig);
    setSimState(initState(loadedConfig));
    setHistory({ timestamps: [], series: {} });
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    toast.success("Twin loaded!");
  };

  const handleReset = () => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSimState(initState(config));
    setHistory({ timestamps: [], series: {} });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--gradient-dark)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center glow-primary">
            <span className="text-primary-foreground font-bold text-sm">T</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-lg gradient-text">TwinIT</h1>
            <p className="text-xs text-muted-foreground">AI-Powered Digital Twin Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRunning(!running)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg transition-all font-display font-medium ${
              running
                ? 'bg-glow-warning/20 text-glow-warning border border-glow-warning/30'
                : 'bg-glow-success/20 text-glow-success border border-glow-success/30'
            }`}
          >
            {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {running ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-secondary text-secondary-foreground border border-border/30 hover:bg-secondary/80 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={saveTwin.isPending}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-colors disabled:opacity-50"
            title="Save to MySQL"
          >
            <Save className="w-4 h-4" />
          </button>
          {savedTwins && savedTwins.length > 0 && (
            <div className="relative group">
              <button
                className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-secondary text-secondary-foreground border border-border/30 hover:bg-secondary/80 transition-colors"
                title="Load saved twin"
              >
                <FolderOpen className="w-4 h-4" />
              </button>
              <div className="absolute right-0 top-full mt-1 w-56 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                {savedTwins.map((twin) => (
                  <button
                    key={twin.id}
                    onClick={() => handleLoadTwin(twin as any)}
                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    {twin.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <ExportPanel config={config} />
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 min-h-0 overflow-auto">
        {/* Chat */}
        <div className="lg:col-span-3 min-h-[300px] lg:min-h-0 lg:h-[calc(100vh-5rem)]">
          <PromptChat onSubmit={handlePromptSubmit} isSimulating={isGenerating} />
        </div>

        {/* Visualizer */}
        <div className="lg:col-span-3 min-h-[300px] lg:min-h-0 lg:h-[calc(100vh-5rem)]">
          <TwinVisualizer config={config} state={simState} />
        </div>

        {/* Code Editor */}
        <div className="lg:col-span-3 min-h-[300px] lg:min-h-0 lg:h-[calc(100vh-5rem)]">
          <CodeEditorPanel config={config} />
        </div>

        {/* Dashboard */}
        <div className="lg:col-span-3 min-h-[300px] lg:min-h-0 lg:h-[calc(100vh-5rem)]">
          <SimulationDashboard config={config} state={simState} history={history} />
        </div>
      </main>
    </div>
  );
};

export default Index;
