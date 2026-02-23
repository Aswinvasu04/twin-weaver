import { useRef, useEffect, useCallback } from "react";
import { TwinConfig, SimulationState } from "@/lib/simulation";
import { Cpu } from "lucide-react";

interface TwinVisualizerProps {
  config: TwinConfig;
  state: SimulationState;
}

const NODE_COLORS: Record<string, string> = {
  sensor: '#00e5ff',
  actuator: '#b388ff',
  controller: '#69f0ae',
};

const NODE_GLOW: Record<string, string> = {
  sensor: 'rgba(0, 229, 255, 0.4)',
  actuator: 'rgba(179, 136, 255, 0.5)',
  controller: 'rgba(105, 240, 174, 0.4)',
};

export function TwinVisualizer({ config, state }: TwinVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>();

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;

    // Background
    ctx.fillStyle = 'hsl(260, 30%, 6%)';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    const components = config.components;
    if (components.length === 0) return;

    // Position nodes in a circle
    const cx = W / 2;
    const cy = H / 2;
    const radius = Math.min(W, H) * 0.32;
    const positions: Record<string, { x: number; y: number }> = {};

    components.forEach((comp, i) => {
      const angle = (i / components.length) * Math.PI * 2 - Math.PI / 2;
      const float = Math.sin(Date.now() / 1000 + i * 1.5) * 4;
      positions[comp.id] = {
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius + float,
      };
    });

    // Draw connections
    for (const edge of config.topology) {
      const from = positions[edge.from];
      const to = positions[edge.to];
      if (!from || !to) continue;

      const isActive = state.active[edge.from] || state.active[edge.to];
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = isActive ? 'rgba(0, 229, 255, 0.6)' : 'rgba(139, 92, 246, 0.15)';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.stroke();

      // Animated particle on active connections
      if (isActive) {
        const t = (Date.now() % 2000) / 2000;
        const px = from.x + (to.x - from.x) * t;
        const py = from.y + (to.y - from.y) * t;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#00e5ff';
        ctx.fill();
      }
    }

    // Draw nodes
    for (const comp of components) {
      const pos = positions[comp.id];
      if (!pos) continue;

      const color = NODE_COLORS[comp.type] || '#fff';
      const glow = NODE_GLOW[comp.type] || 'rgba(255,255,255,0.3)';
      const isActive = state.active[comp.id] || (state.readings[comp.id] ?? 0) > 0;
      const nodeRadius = 22;
      const pulseRadius = nodeRadius + Math.sin(Date.now() / 500) * (isActive ? 8 : 3);

      // Outer glow
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, pulseRadius, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Node body
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? color : 'hsl(260, 20%, 16%)';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Icon text
      const icon = comp.type === 'sensor' ? '📡' : comp.type === 'actuator' ? '⚙️' : '🧠';
      ctx.font = '16px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icon, pos.x, pos.y);

      // Label
      ctx.font = '11px "Space Grotesk", sans-serif';
      ctx.fillStyle = 'hsl(220, 20%, 80%)';
      ctx.textAlign = 'center';
      ctx.fillText(comp.name, pos.x, pos.y + nodeRadius + 16);

      // Value
      const val = state.readings[comp.id];
      if (val !== undefined && comp.type === 'sensor') {
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = color;
        ctx.fillText(`${val.toFixed(1)}`, pos.x, pos.y + nodeRadius + 28);
      }
    }

    // Title
    ctx.font = 'bold 13px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'hsl(220, 20%, 60%)';
    ctx.textAlign = 'left';
    ctx.fillText(`t = ${state.time}`, 16, 24);

    animFrameRef.current = requestAnimationFrame(draw);
  }, [config, state]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(draw);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [draw]);

  return (
    <div className="glass-panel flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 border-b border-border/50">
        <Cpu className="w-5 h-5 text-glow-primary" />
        <h2 className="font-display font-semibold text-foreground">Twin Visualizer</h2>
        <span className="ml-auto text-xs text-muted-foreground font-mono">
          {config.components.length} nodes · {config.topology.length} links
        </span>
      </div>
      <div className="flex-1 min-h-0 p-2">
        <canvas ref={canvasRef} className="w-full h-full rounded-lg" />
      </div>
    </div>
  );
}
