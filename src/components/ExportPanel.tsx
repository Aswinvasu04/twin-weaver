import { TwinConfig, generateSimPyCode } from "@/lib/simulation";
import { Download, FileJson, FileCode, Image } from "lucide-react";

interface ExportPanelProps {
  config: TwinConfig;
}

export function ExportPanel({ config }: ExportPanelProps) {
  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `twinit-${config.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSimPy = () => {
    const code = generateSimPyCode(config);
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `twinit-simpy-${config.name.replace(/\s+/g, '-').toLowerCase()}.py`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadVisual = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `twinit-visual-${config.name.replace(/\s+/g, '-').toLowerCase()}.png`;
    a.click();
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button onClick={downloadJSON} className="flex items-center gap-1.5 px-3 py-2 text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors border border-border/30">
        <FileJson className="w-3.5 h-3.5" /> JSON Config
      </button>
      <button onClick={downloadSimPy} className="flex items-center gap-1.5 px-3 py-2 text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors border border-border/30">
        <FileCode className="w-3.5 h-3.5" /> SimPy Code
      </button>
      <button onClick={downloadVisual} className="flex items-center gap-1.5 px-3 py-2 text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors border border-border/30">
        <Image className="w-3.5 h-3.5" /> PNG Visual
      </button>
    </div>
  );
}
