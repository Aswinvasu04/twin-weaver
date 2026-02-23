import { useState, useRef, useEffect } from "react";
import { Send, Zap, Sparkles } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface PromptChatProps {
  onSubmit: (prompt: string) => void;
  isSimulating: boolean;
}

const EXAMPLES = [
  "Smart irrigation system with soil moisture sensors, pump, and weather alerts",
  "Temperature monitoring with fan actuator and humidity sensor",
  "Light-based plant growth system with motor and soil moisture",
];

export function PromptChat({ onSubmit, isSimulating }: PromptChatProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Welcome to TwinIT! Describe your IoT system and I'll generate a digital twin simulation. Try something like:\n\n• Smart irrigation with soil sensors and pump\n• Weather monitoring station\n• Automated greenhouse" }
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = () => {
    if (!input.trim() || isSimulating) return;
    const prompt = input.trim();
    setMessages(prev => [
      ...prev,
      { role: 'user', content: prompt },
      { role: 'assistant', content: `⚡ Generating digital twin for: "${prompt}"...\n\nParsing components, wiring topology, and starting simulation...` }
    ]);
    setInput("");
    onSubmit(prompt);
  };

  return (
    <div className="glass-panel flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 border-b border-border/50">
        <Sparkles className="w-5 h-5 text-glow-accent" />
        <h2 className="font-display font-semibold text-foreground">Twin Prompt</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => setInput(ex)}
              className="text-xs px-3 py-1.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors border border-border/30"
            >
              {ex.slice(0, 40)}…
            </button>
          ))}
        </div>
      )}

      <div className="p-4 border-t border-border/50">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Describe your IoT system..."
            className="flex-1 bg-muted/50 border border-border/50 rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-display"
            disabled={isSimulating}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isSimulating}
            className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-40 transition-all glow-primary flex items-center gap-2"
          >
            {isSimulating ? <Zap className="w-4 h-4 animate-pulse" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
