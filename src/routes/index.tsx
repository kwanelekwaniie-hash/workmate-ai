import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Mail, MessageSquare } from "lucide-react";
import { PageHeader, Panel } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Workplace Productivity Assistant" },
      { name: "description", content: "Write emails, summarise research and chat with an AI workplace assistant." },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      { property: "og:description", content: "Write emails, summarise research and chat with an AI workplace assistant." },
    ],
  }),
  component: Index,
});

const TOOLS = [
  { to: "/email", icon: Mail, title: "Smart Email Generator", text: "Draft polished emails in a formal or friendly tone, then edit and copy." },
  { to: "/research", icon: BookOpen, title: "AI Research Assistant", text: "Paste an article or name a topic to get a structured summary and key insights." },
  { to: "/chat", icon: MessageSquare, title: "Workplace Chat", text: "Ask for help with planning, meetings, priorities and communication." },
] as const;

function Index() {
  return (
    <>
      <PageHeader title="Good to see you" description="Pick a tool to get started. Everything is powered by Lovable AI." />
      <div className="grid gap-4 md:grid-cols-3">
        {TOOLS.map(({ to, icon: Icon, title, text }) => (
          <Link key={to} to={to} className="group">
            <Panel className="flex h-full flex-col transition-transform group-hover:-translate-y-0.5">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h2 className="font-semibold text-foreground">{title}</h2>
              <p className="mt-1.5 flex-1 text-sm text-muted-foreground">{text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground">
                Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Panel>
          </Link>
        ))}
      </div>
      <Panel className="mt-6 bg-secondary">
        <h2 className="font-semibold text-foreground">Responsible AI reminder</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          AI outputs can be inaccurate or outdated. Always review and verify facts before sharing, and avoid entering confidential, client or personal information.
        </p>
      </Panel>
    </>
  );
}
