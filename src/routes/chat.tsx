import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { BrainCircuit, Loader2, RotateCcw, SendHorizonal } from "lucide-react";
import { ErrorNote, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateAi } from "@/lib/ai.functions";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Workplace Chat — Workplace AI" },
      { name: "description", content: "Chat with an AI workplace assistant for planning, writing and problem-solving." },
      { property: "og:title", content: "Workplace Chat" },
      { property: "og:description", content: "Chat with an AI workplace assistant." },
    ],
  }),
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string };
const STARTERS = [
  "Help me prioritise 6 tasks due this week",
  "Create an agenda for a 30-minute team sync",
  "How do I give constructive feedback to a colleague?",
];

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, loading]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setError("");
    setLoading(true);
    try {
      const res = await generateAi({ data: { kind: "chat", messages: next.slice(-40) } });
      if (res.ok) setMessages([...next, { role: "assistant", content: res.text }]);
      else setError(res.error);
    } catch {
      setError("Couldn't reach the AI. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100dvh-7rem)] flex-col lg:h-[calc(100dvh-5rem)]">
      <div className="flex items-start justify-between gap-2">
        <PageHeader title="Workplace Chat" description="Your contextual assistant for everyday work." />
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => { setMessages([]); setError(""); }}>
            <RotateCcw /> New chat
          </Button>
        )}
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto rounded-xl border bg-card p-4 shadow-card sm:p-6" aria-live="polite">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <BrainCircuit className="h-6 w-6" aria-hidden />
            </div>
            <p className="font-display font-semibold">How can I help today?</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {STARTERS.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-full border bg-background px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-accent sm:text-sm">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">{m.content}</div>
            </div>
          ) : (
            <div key={i} className="flex gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
                <BrainCircuit className="h-4 w-4" aria-hidden />
              </div>
              <div className="prose prose-sm max-w-none flex-1 prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-headings:text-foreground">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            </div>
          ),
        )}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
          </div>
        )}
        {error && <ErrorNote message={error} />}
        <div ref={endRef} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="mt-3 flex items-end gap-2 rounded-xl border bg-card p-2 shadow-card">
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} rows={1} aria-label="Message"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          placeholder="Ask anything about your work… (avoid confidential info)"
          className="max-h-40 min-h-10 resize-none border-0 shadow-none focus-visible:ring-0" />
        <Button type="submit" size="icon" disabled={loading || !input.trim()} aria-label="Send">
          <SendHorizonal />
        </Button>
      </form>
    </div>
  );
}
