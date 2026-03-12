import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Code2, Copy, Check, Play } from "lucide-react";
import { TwinConfig, generateSimPyCode } from "@/lib/simulation";

interface CodeEditorPanelProps {
  config: TwinConfig;
  onCodeChange?: (code: string) => void;
}

export function CodeEditorPanel({ config, onCodeChange }: CodeEditorPanelProps) {
  const [code, setCode] = useState(() => generateSimPyCode(config));
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState<"python" | "json">("python");

  useEffect(() => {
    const generated = language === "python" 
      ? generateSimPyCode(config) 
      : JSON.stringify(config, null, 2);
    setCode(generated);
  }, [config, language]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel flex flex-col h-full">
      <div className="flex items-center gap-2 p-3 border-b border-border/50">
        <Code2 className="w-5 h-5 text-glow-accent" style={{ color: 'hsl(var(--glow-accent))' }} />
        <h2 className="font-display font-semibold text-foreground text-sm">Code Editor</h2>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Language toggle */}
          <div className="flex rounded-md border border-border/50 overflow-hidden text-xs">
            <button
              onClick={() => setLanguage("python")}
              className={`px-2.5 py-1 font-mono transition-colors ${
                language === "python"
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              .py
            </button>
            <button
              onClick={() => setLanguage("json")}
              className={`px-2.5 py-1 font-mono transition-colors ${
                language === "json"
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              .json
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(val) => {
            setCode(val ?? "");
            onCodeChange?.(val ?? "");
          }}
          theme="vs-dark"
          options={{
            fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace",
            minimap: { enabled: false },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: "gutter",
            scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            contextmenu: false,
          }}
        />
      </div>
    </div>
  );
}
