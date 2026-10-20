import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy, Loader2, RefreshCw, Wand2 } from "lucide-react";
import { ErrorNote, PageHeader, Panel } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateAi } from "@/lib/ai.functions";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Workplace AI" },
      { name: "description", content: "Generate professional emails in formal or friendly tones, then edit and copy." },
      { property: "og:title", content: "Smart Email Generator" },
      { property: "og:description", content: "Generate professional emails in formal or friendly tones." },
    ],
  }),
  component: EmailPage,
});

const TONES = ["Formal", "Friendly"] as const;

function EmailPage() {
  const [prompt, setPrompt] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Formal");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!prompt.trim()) return setError("Describe what the email should say.");
    setLoading(true);
    setError("");
    try {
      const res = await generateAi({ data: { kind: "email", prompt, tone, recipient: recipient || undefined } });
      if (res.ok) setOutput(res.text);
      else setError(res.error);
    } catch {
      setError("Couldn't reach the AI. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <>
      <PageHeader title="Smart Email Generator" description="Describe your email, choose a tone, and refine the draft." />
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">What should the email say?</Label>
            <Textarea id="prompt" rows={6} value={prompt} onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Ask my manager to move Thursday's project review to Friday because the client data arrives late." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient (optional)</Label>
            <Input id="recipient" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="e.g. Sarah, Head of Operations" />
          </div>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Tone</legend>
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
              {TONES.map((t) => (
                <button key={t} type="button" aria-pressed={tone === t} onClick={() => setTone(t)}
                  className={`rounded-md py-2 text-sm font-medium transition-colors ${tone === t ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground"}`}>
                  {t}
                </button>
              ))}
            </div>
          </fieldset>
          {error && <ErrorNote message={error} />}
          <Button onClick={generate} disabled={loading} className="w-full" size="lg">
            {loading ? <Loader2 className="animate-spin" /> : <Wand2 />}
            {loading ? "Writing your email…" : "Generate email"}
          </Button>
        </Panel>
        <Panel className="flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <Label htmlFor="output">Your draft (editable)</Label>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={generate} disabled={loading || !output}>
                <RefreshCw /> Retry
              </Button>
              <Button variant="secondary" size="sm" onClick={copy} disabled={!output}>
                {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
          {loading && !output ? (
            <div className="flex-1 space-y-2.5 rounded-lg bg-muted p-4" aria-busy>
              {[90, 70, 95, 60, 80].map((w) => <div key={w} className="h-3 animate-pulse rounded bg-accent" style={{ width: `${w}%` }} />)}
            </div>
          ) : (
            <Textarea id="output" value={output} onChange={(e) => setOutput(e.target.value)} rows={16}
              className="flex-1 font-sans leading-relaxed" placeholder="Your generated email will appear here." />
          )}
        </Panel>
      </div>
    </>
  );
}
