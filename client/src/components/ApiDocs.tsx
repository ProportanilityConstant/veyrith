import { useState } from "react";
import {
  Activity,
  BookOpen,
  Code2,
  Copy,
  CopyCheck,
  Gauge,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ApiLanguage = "Go" | "Python" | "C#" | "PHP";

const apiSnippets: Record<ApiLanguage, string> = {
  Go: `client := veyrith.Client{Endpoint: "https://your-veyrith-host", APIKey: os.Getenv("VEYRITH_API_KEY")}
result, err := client.GenerateBlueprint(context.Background(), "Build a resilient checkout API")
if err != nil { log.Fatal(err) }
fmt.Println(result.Data.Title)`,
  Python: `client = VeyrithClient(
    endpoint="https://your-veyrith-host",
    api_key=os.environ["VEYRITH_API_KEY"],
)
blueprint = client.generate_blueprint("Build a resilient checkout API")
print(blueprint["data"]["title"])`,
  "C#": `var client = new VeyrithClient(
    httpClient, "https://your-veyrith-host", apiKey);
var result = await client.GenerateBlueprintAsync(
    "Build a resilient checkout API");
Console.WriteLine(result.Data.Title);`,
  PHP: `$client = new VeyrithClient(
    $_ENV['VEYRITH_ENDPOINT'],
    $_ENV['VEYRITH_API_KEY']
);
$blueprint = $client->generateBlueprint(
    'Build a resilient checkout API'
);
echo $blueprint['data']['title'];`,
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </div>
  );
}

export default function ApiDocs() {
  const [language, setLanguage] = useState<ApiLanguage>("Go");
  const [copied, setCopied] = useState(false);
  const copySnippet = async () => {
    await navigator.clipboard?.writeText(apiSnippets[language]);
    setCopied(true);
    toast.success(`${language} snippet copied`);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="mx-auto max-w-[1200px] px-5 pb-12 pt-8 sm:px-8 lg:px-10 lg:pt-10">
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <div className="eyebrow mb-3">
            <span className="live-dot" /> Developer surface
          </div>
          <h1 className="font-display text-[32px] font-semibold leading-[1.04] tracking-[-0.055em] sm:text-[40px]">
            API docs<span className="text-primary">.</span>
          </h1>
          <p className="mt-3 max-w-[650px] text-[15px] leading-7 text-muted-foreground">
            Connect your own services to Veyrith with a versioned, authenticated
            API. Keep keys server-side and let your team ship in the language it
            already trusts.
          </p>
        </div>
        <Badge className="status-badge w-fit">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> v1 stable
        </Badge>
      </div>

      <section className="mb-5 grid gap-4 md:grid-cols-3">
        {[
          {
            label: "Generate",
            value: "POST /api/v1/blueprints",
            icon: Sparkles,
          },
          { label: "Usage", value: "GET /api/v1/usage", icon: Activity },
          { label: "Auth", value: "Bearer token", icon: LockKeyhole },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-border/70 bg-card p-5"
          >
            <div className="mb-4 flex items-center gap-2 text-primary">
              <Icon size={16} />
              <span className="text-[10px] font-bold uppercase tracking-[0.16em]">
                {label}
              </span>
            </div>
            <p className="font-mono text-sm font-semibold">{value}</p>
          </div>
        ))}
      </section>

      <section className="mb-5 rounded-2xl border border-border/70 bg-card p-5 sm:p-7">
        <div className="mb-5 flex items-center gap-3">
          <div className="component-icon">
            <Code2 size={16} />
          </div>
          <div>
            <SectionLabel>Quick start</SectionLabel>
            <h2 className="font-display text-xl font-semibold tracking-[-0.04em]">
              One request, one reviewable blueprint
            </h2>
          </div>
        </div>
        <div className="rounded-xl bg-[#202521] p-4 text-[#dceee7] shadow-inner sm:p-5">
          <div className="mb-3 flex items-center justify-between text-[11px] text-[#91a69d]">
            <span>curl</span>
            <span>POST /api/v1/blueprints</span>
          </div>
          <pre className="overflow-x-auto font-mono text-xs leading-6">
            <code>{`curl -X POST https://your-veyrith-host/api/v1/blueprints \\
  -H "Authorization: Bearer $VEYRITH_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"brief":"Build a resilient checkout API"}'`}</code>
          </pre>
        </div>
        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          The server returns a structured blueprint envelope. If the model
          provider is unavailable,{" "}
          <code className="rounded bg-secondary px-1.5 py-0.5">
            data.generated
          </code>{" "}
          is false and the safe starter blueprint remains available.
        </p>
      </section>

      <section className="mb-5 rounded-2xl border border-border/70 bg-card p-5 sm:p-7">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <SectionLabel>Official clients</SectionLabel>
            <h2 className="font-display text-xl font-semibold tracking-[-0.04em]">
              Use the SDK your team already knows
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            Same v1 contract · server-side keys only
          </span>
        </div>
        <div
          className="mb-4 flex flex-wrap gap-2"
          role="tablist"
          aria-label="SDK languages"
        >
          {(Object.keys(apiSnippets) as ApiLanguage[]).map(item => (
            <button
              key={item}
              role="tab"
              aria-selected={language === item}
              onClick={() => {
                setLanguage(item);
                setCopied(false);
              }}
              className={cn(
                "rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                language === item
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="relative rounded-xl bg-[#202521] p-4 text-[#dceee7] sm:p-5">
          <div className="mb-3 flex items-center justify-between text-[11px] text-[#91a69d]">
            <span>{language.toLowerCase()}</span>
            <button
              onClick={copySnippet}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[#dceee7] transition-colors hover:bg-white/10"
            >
              {copied ? <CopyCheck size={13} /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="min-h-[168px] overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-6">
            <code>{apiSnippets[language]}</code>
          </pre>
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-secondary/70 p-3.5 text-xs leading-5 text-muted-foreground">
          <ShieldCheck size={15} className="mt-0.5 shrink-0 text-primary" />
          <span>
            <strong className="text-foreground">Rotation-ready.</strong> Set{" "}
            <code className="rounded bg-background px-1">VEYRITH_API_KEYS</code>{" "}
            as a comma-separated list to rotate keys without downtime.
          </span>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-7">
          <div className="mb-4 flex items-center gap-2">
            <BookOpen size={16} className="text-primary" />
            <SectionLabel>Response shape</SectionLabel>
          </div>
          <pre className="overflow-x-auto rounded-xl bg-secondary/70 p-4 font-mono text-xs leading-6 text-foreground">
            <code>{`{
  "data": { "title": "...", "generated": true },
  "meta": { "apiVersion": "v1", "advisory": true }
}`}</code>
          </pre>
        </div>
        <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-7">
          <div className="mb-4 flex items-center gap-2">
            <Gauge size={16} className="text-primary" />
            <SectionLabel>Operational contract</SectionLabel>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">401</strong> missing or
              invalid Bearer token.
            </p>
            <p>
              <strong className="text-foreground">400</strong> brief outside the
              20–5000 character range.
            </p>
            <p>
              <strong className="text-foreground">429</strong> per-key minute
              limit exceeded; respect{" "}
              <code className="rounded bg-secondary px-1">Retry-After</code>.
            </p>
            <p>
              <strong className="text-foreground">GET /api/v1/usage</strong>{" "}
              returns the authenticated 24-hour summary.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
