import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Activity,
  ArrowUpRight,
  BrainCircuit,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  Command,
  Copy,
  FileCode2,
  Gauge,
  GitBranch,
  Layers3,
  Lightbulb,
  Loader2,
  LockKeyhole,
  Menu,
  MoreHorizontal,
  Network,
  PanelLeft,
  Plus,
  Radio,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ApiDocs from "@/components/ApiDocs";

const seededBrief =
  "We are building PulsePay, a B2B checkout API for marketplaces. It must handle bursty traffic, never double-charge a customer, and let finance reconcile every payment. We are a small team shipping v1 in 10 weeks.";

const seededBlueprint = {
  title: "PulsePay reliability blueprint",
  summary:
    "A resilient event-driven core with a calm read path: accept payments once, fan out safely, and keep customer-facing queries fast even when providers wobble.",
  confidence: 82,
  architectureStyle: "Event-led modular monolith",
  assumptions: [
    "Payment provider webhooks can arrive more than once.",
    "Checkout reads must stay available during downstream incidents.",
    "The first release can defer multi-region writes.",
  ],
  components: [
    {
      name: "Edge gateway",
      type: "Ingress",
      description: "Auth, rate limits, idempotency keys",
      health: "strong",
    },
    {
      name: "Checkout core",
      type: "Compute",
      description: "Owns the payment state machine",
      health: "strong",
    },
    {
      name: "Event relay",
      type: "Messaging",
      description: "Durable outbox with replayable events",
      health: "watch",
    },
    {
      name: "Ledger store",
      type: "Data",
      description: "Append-only balance and audit history",
      health: "strong",
    },
    {
      name: "Provider adapter",
      type: "Integration",
      description: "Stripe-like provider boundary",
      health: "risk",
    },
    {
      name: "Read model",
      type: "Query",
      description: "Fast customer-facing checkout views",
      health: "watch",
    },
  ],
  risks: [
    {
      title: "Webhook duplication",
      detail: "Persist provider event IDs before applying side effects.",
      severity: "high",
    },
    {
      title: "Relay lag",
      detail: "Expose freshness and replay controls before launch.",
      severity: "medium",
    },
    {
      title: "Provider coupling",
      detail: "Keep provider-specific types behind one adapter.",
      severity: "low",
    },
  ],
  nextMove:
    "Lock the payment state machine and write the idempotency contract before choosing infrastructure.",
};

type Blueprint = typeof seededBlueprint;

function VeyrithMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn("mark-shell", compact ? "h-8 w-8" : "h-9 w-9")}
        aria-hidden="true"
      >
        <svg viewBox="0 0 44 44" className="h-full w-full" fill="none">
          <circle
            cx="22"
            cy="22"
            r="18"
            stroke="currentColor"
            strokeWidth="1.6"
            opacity=".2"
          />
          <path
            d="M13 13.5 22 22l9-8.5M13 30.5 22 22l9 8.5"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="22" cy="22" r="4.1" fill="currentColor" />
          <circle cx="13" cy="13.5" r="2.1" fill="currentColor" />
          <circle cx="31" cy="13.5" r="2.1" fill="currentColor" />
          <circle cx="13" cy="30.5" r="2.1" fill="currentColor" />
          <circle cx="31" cy="30.5" r="2.1" fill="currentColor" />
        </svg>
      </div>
      {!compact && (
        <span className="font-display text-[18px] font-semibold tracking-[-0.04em]">
          veyrith
        </span>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </div>
  );
}

function HealthDot({ health }: { health: string }) {
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 rounded-full",
        health === "strong"
          ? "bg-emerald-500"
          : health === "watch"
            ? "bg-amber-400"
            : "bg-rose-400"
      )}
    />
  );
}

export default function Home() {
  const [brief, setBrief] = useState(seededBrief);
  const [blueprint, setBlueprint] = useState<Blueprint>(seededBlueprint);
  const [activeNav, setActiveNav] = useState("Overview");
  const [mobileNav, setMobileNav] = useState(false);
  const [showAllComponents, setShowAllComponents] = useState(false);
  const generate = trpc.blueprint.generate.useMutation({
    onSuccess: next => {
      setBlueprint(next);
      toast.success(
        next.generated
          ? "Blueprint refreshed with Veyrith intelligence"
          : "Showing the saved starter blueprint",
        {
          description: next.generated
            ? "Assumptions and failure modes are ready to review."
            : "AI is temporarily unavailable; your workspace is still usable.",
        }
      );
    },
    onError: () =>
      toast.error("Veyrith could not generate a blueprint", {
        description: "Try a little more detail in the brief and run it again.",
      }),
  });

  const visibleComponents = useMemo(
    () =>
      showAllComponents
        ? blueprint.components
        : blueprint.components.slice(0, 4),
    [blueprint.components, showAllComponents]
  );
  const isBusy = generate.isPending;

  const handleGenerate = () => {
    if (brief.trim().length < 20) {
      toast.error("Add a little more context", {
        description:
          "A useful blueprint needs at least 20 characters of product intent.",
      });
      return;
    }
    generate.mutate({ brief: brief.trim() });
  };

  const copyBrief = async () => {
    await navigator.clipboard?.writeText(brief);
    toast.success("Brief copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="app-grid min-h-screen lg:grid-cols-[228px_1fr]">
        <aside
          className={cn(
            "sidebar fixed inset-y-0 left-0 z-30 w-[250px] -translate-x-full border-r border-border/60 bg-background/95 px-4 pb-5 pt-6 backdrop-blur-xl transition-transform lg:static lg:w-auto lg:translate-x-0",
            mobileNav && "translate-x-0"
          )}
        >
          <div className="flex h-full flex-col">
            <div className="mb-10 flex items-center justify-between px-2">
              <VeyrithMark />
              <button
                onClick={() => setMobileNav(false)}
                className="icon-button lg:hidden"
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-2">
              <button
                className="new-blueprint mb-8 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold"
                onClick={() => {
                  setBrief("");
                  toast.info("New brief ready", {
                    description: "Tell Veyrith what you are building.",
                  });
                }}
              >
                <span className="flex items-center gap-2">
                  <Plus size={16} /> New blueprint
                </span>
                <span className="keycap">⌘ N</span>
              </button>
            </div>
            <nav className="space-y-1 px-1" aria-label="Primary navigation">
              {[
                { label: "Overview", icon: PanelLeft },
                { label: "Blueprints", icon: Layers3 },
                { label: "Signals", icon: Activity },
              ].map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => {
                    setActiveNav(label);
                    setMobileNav(false);
                  }}
                  className={cn(
                    "nav-item flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm",
                    activeNav === label && "active"
                  )}
                >
                  <Icon size={16} strokeWidth={1.8} />
                  {label}
                  {label === "Blueprints" && (
                    <span className="ml-auto text-[11px] text-muted-foreground">
                      4
                    </span>
                  )}
                </button>
              ))}
            </nav>
            <div className="mt-10 px-3">
              <SectionLabel>Workspace</SectionLabel>
            </div>
            <div className="space-y-1 px-1">
              <button className="nav-item flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm">
                <GitBranch size={16} strokeWidth={1.8} />
                Decision log
              </button>
              <button className="nav-item flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm">
                <FileCode2 size={16} strokeWidth={1.8} />
                Artifacts
              </button>
              <button
                onClick={() => {
                  setActiveNav("API docs");
                  setMobileNav(false);
                }}
                className={cn(
                  "nav-item flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm",
                  activeNav === "API docs" && "active"
                )}
              >
                <BookOpen size={16} strokeWidth={1.8} />
                API docs
              </button>
            </div>
            <div className="mt-auto space-y-1 px-1">
              <div className="mb-5 border-t border-border/60 pt-5">
                <div className="flex items-center gap-3 rounded-xl bg-secondary/70 px-3 py-3">
                  <div className="avatar">AR</div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">Ari Raman</p>
                    <p className="text-[11px] text-muted-foreground">
                      Personal workspace
                    </p>
                  </div>
                  <ChevronDown
                    className="ml-auto text-muted-foreground"
                    size={15}
                  />
                </div>
              </div>
              <button className="nav-item flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm">
                <Settings2 size={16} strokeWidth={1.8} />
                Settings
              </button>
              <button className="nav-item flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm">
                <CircleHelp size={16} strokeWidth={1.8} />
                Guide & shortcuts
              </button>
            </div>
          </div>
        </aside>

        {mobileNav && (
          <button
            aria-label="Close navigation overlay"
            onClick={() => setMobileNav(false)}
            className="fixed inset-0 z-20 bg-foreground/20 backdrop-blur-sm lg:hidden"
          />
        )}

        <main className="min-w-0">
          <header className="topbar flex h-[72px] items-center justify-between border-b border-border/60 px-5 sm:px-8 lg:px-10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileNav(true)}
                className="icon-button lg:hidden"
                aria-label="Open navigation"
              >
                <Menu size={20} />
              </button>
              <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
                <span>Workspace</span>
                <span>/</span>
                <span className="font-medium text-foreground">{activeNav}</span>
              </div>
              <div className="flex items-center gap-2 md:hidden">
                <VeyrithMark compact />
                <span className="text-sm font-semibold">{activeNav}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="icon-button hidden sm:inline-flex"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
              <button
                className="icon-button hidden sm:inline-flex"
                aria-label="Command menu"
              >
                <Command size={18} />
              </button>
              <button
                className="upgrade-button hidden items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold sm:flex"
                onClick={() =>
                  toast.info("You are on the founding workspace", {
                    description:
                      "Team review and export controls are coming next.",
                  })
                }
              >
                <Sparkles size={14} /> Unlock team review
              </button>
            </div>
          </header>

          {activeNav === "API docs" && <ApiDocs />}
          <div
            className={cn(
              "mx-auto max-w-[1440px] px-5 pb-12 pt-8 sm:px-8 lg:px-10 lg:pt-10",
              activeNav === "API docs" && "hidden"
            )}
          >
            <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <div className="eyebrow mb-3">
                  <span className="live-dot" /> Veyrith intelligence is ready
                </div>
                <h1 className="font-display text-[32px] font-semibold leading-[1.04] tracking-[-0.055em] sm:text-[40px]">
                  Good morning, Ari<span className="text-primary">.</span>
                </h1>
                <p className="mt-3 max-w-[590px] text-[15px] leading-7 text-muted-foreground">
                  Turn the shape of an idea into a system you can trust. Start
                  with intent; leave with decisions.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Last
                synced just now{" "}
                <button
                  className="icon-button ml-1 h-7 w-7"
                  aria-label="More options"
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>

            <section className="hero-panel relative mb-8 overflow-hidden rounded-[22px] border border-[#dcd8ce] bg-[#f6f3ec] p-5 shadow-[0_12px_32px_rgba(30,28,23,0.04)] sm:p-7 lg:p-8">
              <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-[#dceee7] opacity-60 blur-3xl" />
              <div className="absolute -bottom-36 left-[45%] h-60 w-60 rounded-full bg-[#f0dfc5] opacity-55 blur-3xl" />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-[610px]">
                  <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                    <BrainCircuit size={15} /> Build from a brief
                  </div>
                  <h2 className="font-display text-2xl font-semibold tracking-[-0.04em] sm:text-[28px]">
                    What are you building?
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Veyrith will map the architecture, call out hidden risk, and
                    show you what to decide next.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <LockKeyhole size={13} /> Your briefs stay private
                </div>
              </div>
              <div className="relative mt-6">
                <div className="brief-wrap">
                  <Textarea
                    value={brief}
                    onChange={event => setBrief(event.target.value)}
                    placeholder="Describe the product, constraints, and what must not go wrong..."
                    className="min-h-[132px] resize-none border-0 bg-transparent p-0 text-[15px] leading-7 shadow-none outline-none placeholder:text-muted-foreground/60 focus-visible:ring-0"
                    aria-label="Product brief"
                  />
                  <div className="mt-4 flex flex-col justify-between gap-3 border-t border-[#d9d5cc] pt-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setBrief(seededBrief)}
                        className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                      >
                        Use an example
                      </button>
                      <span className="text-border">·</span>
                      <button
                        onClick={copyBrief}
                        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Copy size={12} /> Copy
                      </button>
                    </div>
                    <Button
                      onClick={handleGenerate}
                      disabled={isBusy}
                      className="generate-button rounded-lg px-4 text-sm font-semibold"
                    >
                      <span>
                        {isBusy ? "Thinking through it" : "Generate blueprint"}
                      </span>
                      {isBusy ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <ArrowUpRight size={16} />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            <div className="mb-4 flex items-center justify-between">
              <div>
                <SectionLabel>
                  <span className="section-number">01</span> Current blueprint
                </SectionLabel>
              </div>
              <button
                onClick={() =>
                  toast.info("Blueprint history is coming next", {
                    description:
                      "Veyrith will soon let you compare architecture versions side by side.",
                  })
                }
                className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                View history <ArrowUpRight size={13} className="ml-1 inline" />
              </button>
            </div>

            <section className="mb-8 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,.55fr)]">
              <div className="blueprint-card rounded-2xl border border-border/70 bg-card p-5 sm:p-7">
                <div className="flex flex-col justify-between gap-5 sm:flex-row">
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <Badge className="status-badge">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{" "}
                        Ready for review
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        v0.4 · 4 min ago
                      </span>
                    </div>
                    <h3 className="font-display text-[23px] font-semibold tracking-[-0.045em]">
                      {blueprint.title}
                    </h3>
                    <p className="mt-2 max-w-[600px] text-sm leading-6 text-muted-foreground">
                      {blueprint.summary}
                    </p>
                  </div>
                  <div className="confidence-box shrink-0">
                    <div className="flex items-center justify-between gap-6">
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                        Confidence
                      </span>
                      <span className="font-display text-xl font-semibold">
                        {blueprint.confidence}%
                      </span>
                    </div>
                    <Progress
                      value={blueprint.confidence}
                      className="mt-2 h-1.5 w-[150px]"
                    />
                    <span className="mt-2 block text-right text-[10px] text-muted-foreground">
                      based on brief clarity
                    </span>
                  </div>
                </div>
                <div className="mt-7 flex flex-wrap gap-2">
                  <span className="meta-chip">
                    <Network size={13} /> {blueprint.architectureStyle}
                  </span>
                  <span className="meta-chip">
                    <ShieldCheck size={13} /> 3 safeguards
                  </span>
                  <span className="meta-chip">
                    <Gauge size={13} /> Burst-ready
                  </span>
                </div>
                <div className="mt-8 border-t border-border/70 pt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <SectionLabel>
                      <span className="section-number">02</span> System shape
                    </SectionLabel>
                    <button
                      className="text-xs font-semibold text-primary"
                      onClick={() =>
                        toast.info("Interactive map mode is coming next")
                      }
                    >
                      Explore map{" "}
                      <ArrowUpRight size={13} className="ml-1 inline" />
                    </button>
                  </div>
                  <div className="architecture-map">
                    <div className="map-line line-a" />
                    <div className="map-line line-b" />
                    <div className="map-line line-c" />
                    <div className="map-node node-edge">
                      <Radio size={15} />
                      <span>Edge</span>
                    </div>
                    <div className="map-node node-core">
                      <Zap size={17} />
                      <span>
                        Checkout
                        <br />
                        core
                      </span>
                    </div>
                    <div className="map-node node-event">
                      <GitBranch size={15} />
                      <span>
                        Event
                        <br />
                        relay
                      </span>
                    </div>
                    <div className="map-node node-data">
                      <Layers3 size={15} />
                      <span>
                        Ledger
                        <br />
                        store
                      </span>
                    </div>
                    <div className="map-node node-read">
                      <Activity size={15} />
                      <span>
                        Read
                        <br />
                        model
                      </span>
                    </div>
                    <div className="map-label label-one">request path</div>
                    <div className="map-label label-two">durable boundary</div>
                  </div>
                </div>
              </div>

              <aside className="decision-card rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
                <div className="mb-7 flex items-center justify-between">
                  <SectionLabel>
                    <span className="section-number">03</span> Decision pulse
                  </SectionLabel>
                  <button
                    className="icon-button h-7 w-7"
                    aria-label="More decision options"
                  >
                    <MoreHorizontal size={15} />
                  </button>
                </div>
                <div className="pulse-score">
                  <div className="relative z-10">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      Architecture health
                    </span>
                    <span className="mt-1 block font-display text-4xl font-semibold tracking-[-0.06em]">
                      Good
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      with 2 things to watch
                    </span>
                  </div>
                  <div className="pulse-ring">
                    <div className="pulse-ring-inner">82</div>
                  </div>
                </div>
                <div className="mt-8 space-y-4">
                  <div className="metric-row">
                    <span>
                      <Check size={14} className="text-emerald-500" /> Clear
                      intent
                    </span>
                    <strong>94%</strong>
                  </div>
                  <div className="metric-row">
                    <span>
                      <TriangleAlert size={14} className="text-amber-500" />{" "}
                      Risk coverage
                    </span>
                    <strong>76%</strong>
                  </div>
                  <div className="metric-row">
                    <span>
                      <Lightbulb size={14} className="text-primary" /> Next
                      decision
                    </span>
                    <strong>1</strong>
                  </div>
                </div>
                <div className="mt-7 rounded-xl bg-secondary/70 p-3.5">
                  <div className="flex items-start gap-2.5">
                    <Lightbulb
                      size={15}
                      className="mt-0.5 shrink-0 text-primary"
                    />
                    <p className="text-xs leading-5 text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        Veyrith suggests:
                      </span>{" "}
                      {blueprint.nextMove}
                    </p>
                  </div>
                </div>
              </aside>
            </section>

            <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.7fr)]">
              <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <SectionLabel>
                      <span className="section-number">04</span> Components
                    </SectionLabel>
                    <h3 className="font-display text-lg font-semibold tracking-[-0.035em]">
                      What the system is made of
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowAllComponents(!showAllComponents)}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    {showAllComponents ? "Show less" : "Show all"}
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {visibleComponents.map(component => (
                    <div key={component.name} className="component-row">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="component-icon">
                          <Network size={15} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {component.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {component.description}
                          </p>
                        </div>
                      </div>
                      <HealthDot health={component.health} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <SectionLabel>
                      <span className="section-number">05</span> Watch list
                    </SectionLabel>
                    <h3 className="font-display text-lg font-semibold tracking-[-0.035em]">
                      Where it could bend
                    </h3>
                  </div>
                  <button
                    className="icon-button h-7 w-7"
                    aria-label="View all risks"
                  >
                    <ArrowUpRight size={15} />
                  </button>
                </div>
                <div className="space-y-4">
                  {blueprint.risks.map(risk => (
                    <div key={risk.title} className="risk-row">
                      <div
                        className={cn(
                          "risk-icon",
                          risk.severity === "high"
                            ? "high"
                            : risk.severity === "medium"
                              ? "medium"
                              : "low"
                        )}
                      >
                        <TriangleAlert size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{risk.title}</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {risk.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <footer className="mt-10 flex flex-col justify-between gap-3 border-t border-border/60 pt-5 text-[11px] text-muted-foreground sm:flex-row">
              <span>Veyrith thinks with you, not instead of you.</span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Built
                for deliberate systems
              </span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
