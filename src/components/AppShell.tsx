import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { BrainCircuit, LayoutDashboard, Mail, Menu, MessageSquare, BookOpen, X, ShieldAlert } from "lucide-react";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Email Generator", icon: Mail },
  { to: "/research", label: "Research Assistant", icon: BookOpen },
  { to: "/chat", label: "Workplace Chat", icon: MessageSquare },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Main">
      {NAV.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          activeOptions={{ exact: true }}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-accent-foreground"
        >
          <Icon className="h-4 w-4" aria-hidden />
          {label}
        </Link>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        <BrainCircuit className="h-5 w-5" aria-hidden />
      </div>
      <div className="leading-tight">
        <p className="font-display text-sm font-semibold text-sidebar-primary">Workplace AI</p>
        <p className="text-xs text-sidebar-foreground/70">Productivity Assistant</p>
      </div>
    </div>
  );
}

function Disclaimer() {
  return (
    <div className="rounded-lg border border-sidebar-border p-3 text-xs leading-relaxed text-sidebar-foreground/80">
      <p className="mb-1 flex items-center gap-1.5 font-semibold text-sidebar-primary">
        <ShieldAlert className="h-3.5 w-3.5" aria-hidden /> Responsible AI
      </p>
      AI can make mistakes. Verify facts before use and never share confidential or personal data.
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col gap-8 bg-sidebar p-5 lg:flex">
        <Brand />
        <NavLinks />
        <div className="mt-auto"><Disclaimer /></div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between bg-sidebar px-4 py-3 lg:hidden">
        <Brand />
        <button
          onClick={() => setOpen(true)}
          className="rounded-md p-2 text-sidebar-primary hover:bg-sidebar-accent"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col gap-8 bg-sidebar p-5">
            <div className="flex items-center justify-between">
              <Brand />
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="rounded-md p-2 text-sidebar-primary hover:bg-sidebar-accent">
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
            <div className="mt-auto"><Disclaimer /></div>
          </div>
        </div>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-10">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">{title}</h1>
      <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">{description}</p>
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border bg-card p-5 shadow-card sm:p-6 ${className}`}>{children}</section>;
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      {message}
    </div>
  );
}
