import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Check, Copy, Loader2, Pencil, Eye, Search } from "lucide-react";
import { ErrorNote, PageHeader, Panel } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateAi } from "@/lib/ai.functions";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Workplace AI" },
      { name: "description", content: "Summarise articles or topics and extract key insights in a structured briefing." },
      { property: "og:title", content: "AI Research Assistant" },
      { property: "og:description", content: "Summarise articles or topics and extract key insights." },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const [source, setSource] = useState("");
  const [focus, setFocus] = useState("");
  const [output, setOutput] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function run() {
    if (!source.trim()) return setError("Paste an article or enter a topic first.");
    setLoading(true);
    setError("");
    try {
      const res = await generateAi({ data: { kind: "research", source, focus: focus || undefined } });
      if (res.ok) { setOutput(res.text); setEditing(false); }
      else setError(res.error);
    } catch {
      setError("Couldn't reach the AI. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader title="AI Research Assistant" description="Paste an article or name a topic to get a structured briefing." />
      <Panel className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="source">Article text or topic</Label>
          <Textarea id="source" rows={7} value={source} onChange={(e) => setSource(e.target.value)}
            placeholder="Paste article text here, or type a topic like “The impact of a 4-day work week on productivity”." />
          <p className="text-xs text-muted-foreground">{source.length.toLocaleString()} / 30,000 characters</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="focus">Focus (optional)</Label>
            <Input id="focus" value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="e.g. risks for small teams, cost figures" />
          </div>
          <Button onClick={run} disabled={loading} size="lg">
            {loading ? <Loader2 className="animate-spin" /> : <Search />}
            {loading ? "Analysing…" : "Summarise"}
          </Button>
        </div>
        {error && <ErrorNote message={error} />}
      </Panel>

      {(loading || output) && (
        <Panel className="mt-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Briefing</h2>
            {output && (
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setEditing((v) => !v)}>
                  {editing ? <Eye /> : <Pencil />} {editing ? "Preview" : "Edit"}
                </Button>
                <Button variant="secondary" size="sm" onClick={async () => { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1800); }}>
                  {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            )}
          </div>
          {loading ? (
            <div className="space-y-2.5" aria-busy>
              {[40, 95, 85, 30, 90, 75, 88].map((w, i) => <div key={i} className="h-3 animate-pulse rounded bg-muted" style={{ width: `${w}%` }} />)}
            </div>
          ) : editing ? (
            <Textarea value={output} onChange={(e) => setOutput(e.target.value)} rows={20} className="font-mono text-sm" aria-label="Edit briefing" />
          ) : (
            <div className="prose prose-sm max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground">
              <ReactMarkdown>{output}</ReactMarkdown>
            </div>
          )}
        </Panel>
      )}
    </>
  );
}
