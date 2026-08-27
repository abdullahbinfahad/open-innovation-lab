import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  CircleDashed,
  Code2,
  Cpu,
  Eye,
  Globe2,
  Layers3,
  Loader2,
  Orbit,
  Sparkles,
} from "lucide-react";
import { Link } from "wouter";
import { useMemo, useState } from "react";

type ProjectStatus = "planned" | "in_progress" | "validated" | "released";
type Project = {
  id: string;
  title: string;
  category: string;
  difficulty: number;
  platforms: string[];
  releaseOrder: number;
  status: ProjectStatus;
  summary: string;
  prerequisites: string;
  validationCriteria: string;
};

const statusStyle: Record<ProjectStatus, string> = {
  planned: "bg-[#edf1ea] text-[#526f62]",
  in_progress: "bg-[#d9ff81] text-[#173029]",
  validated: "bg-[#d8f4e3] text-[#175c3d]",
  released: "bg-[#173029] text-[#eff8f0]",
};

const categories = [
  "All",
  "AI & Agents",
  "Computer Vision & Robotics",
  "IoT & Automation",
  "Software, Web & Data",
];

function categoryIcon(category: string) {
  if (category === "AI & Agents") return <Bot className="size-5" />;
  if (category === "Computer Vision & Robotics")
    return <Eye className="size-5" />;
  if (category === "IoT & Automation") return <Cpu className="size-5" />;
  return <Code2 className="size-5" />;
}

export default function Home() {
  const projectsQuery = trpc.projects.list.useQuery();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const projects = projectsQuery.data as Project[] | undefined;
  const visibleProjects = useMemo(
    () =>
      (projects ?? []).filter(
        project =>
          selectedCategory === "All" || project.category === selectedCategory
      ),
    [projects, selectedCategory]
  );
  const inProgress =
    projects?.filter(project => project.status === "in_progress").length ?? 0;

  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f6ef] text-[#173029] selection:bg-[#d9ff81] selection:text-[#173029]">
      <header className="relative z-20 mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <a href="#top" className="inline-flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-[#173029] font-serif text-xl text-[#d9ff81]">
            O
          </span>
          <span className="text-sm font-bold tracking-tight">
            Open Innovation Lab
          </span>
        </a>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-[#47685d] md:flex">
          <a href="#roadmap" className="transition hover:text-[#173029]">
            Roadmap
          </a>
          <a href="#principles" className="transition hover:text-[#173029]">
            Principles
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-[#173029]"
          >
            Open source
          </a>
        </nav>
        <Button
          asChild
          className="h-10 rounded-full bg-[#173029] px-5 text-[#eff8f0] shadow-none hover:bg-[#294b40]"
        >
          <Link href="/assistant">
            Open assistant <ArrowUpRight className="ml-1 size-4" />
          </Link>
        </Button>
      </header>

      <section
        id="top"
        className="relative mx-auto max-w-[1440px] px-5 pb-16 pt-12 sm:px-8 sm:pt-18 lg:px-12 lg:pb-24"
      >
        <div className="absolute left-[20%] top-0 -z-0 size-[32rem] rounded-full bg-[#d9ff81]/45 blur-[90px]" />
        <div className="relative grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#cad9c8] bg-[#fbfcf8]/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#47685d]">
              <span className="size-1.5 rounded-full bg-[#68a27e]" />
              An open build, from hard to easy
            </p>
            <h1 className="mt-7 max-w-4xl font-serif text-5xl leading-[0.92] tracking-[-0.06em] sm:text-7xl lg:text-8xl">
              Thirty ambitious ideas.
              <br />
              <em className="font-normal text-[#426958]">
                One transparent
              </em>{" "}
              lab.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-[#526f62]">
              A public monorepo for AI agents, computer vision, IoT, and
              software systems. We build in the open, document the difficult
              parts, and never present a plan as a finished product.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button
                asChild
                className="h-12 rounded-full bg-[#173029] px-6 text-[#eff8f0] hover:bg-[#294b40]"
              >
                <Link href="/assistant">
                  <Sparkles className="mr-2 size-4 text-[#d9ff81]" />
                  Try the Personal AI Assistant
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="h-12 rounded-full border-[#bed0c1] bg-[#fbfcf8] px-6 text-[#173029] hover:bg-[#edf1ea]"
              >
                <a href="#roadmap">
                  Explore all 30 <ArrowDownRight className="ml-2 size-4" />
                </a>
              </Button>
            </div>
          </div>
          <div className="relative rounded-[2rem] border border-[#d5dfd2] bg-[#fbfcf8] p-5 shadow-[0_26px_70px_rgba(35,63,52,0.12)] sm:p-7">
            <div className="absolute -right-10 -top-12 size-36 rounded-full border-[18px] border-[#d9ff81]/60" />
            <div className="relative flex items-center justify-between border-b border-[#dfe7dc] pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#6a8478]">
                  Currently building
                </p>
                <h2 className="mt-1 font-serif text-3xl tracking-[-0.04em]">
                  Personal AI Assistant
                </h2>
              </div>
              <div className="grid size-11 place-items-center rounded-full bg-[#d9ff81]">
                <Bot className="size-5" />
              </div>
            </div>
            <p className="relative mt-6 max-w-md text-sm leading-6 text-[#587166]">
              A full-stack private workspace for real conversations, task
              intake, saved sessions, task breakdowns, and deliberate follow-up
              prompts.
            </p>
            <div className="relative mt-7 grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-[#edf1ea] p-3">
                <p className="text-2xl font-semibold">30</p>
                <p className="mt-1 text-xs text-[#587166]">projects mapped</p>
              </div>
              <div className="rounded-2xl bg-[#edf1ea] p-3">
                <p className="text-2xl font-semibold">{inProgress}</p>
                <p className="mt-1 text-xs text-[#587166]">in progress</p>
              </div>
              <div className="rounded-2xl bg-[#edf1ea] p-3">
                <p className="text-2xl font-semibold">0</p>
                <p className="mt-1 text-xs text-[#587166]">false claims</p>
              </div>
            </div>
            <Link
              href="/assistant"
              className="relative mt-7 flex items-center justify-between rounded-2xl bg-[#173029] px-4 py-3 text-sm font-semibold text-[#eff8f0] transition hover:bg-[#294b40]"
            >
              <span>Enter the workspace</span>
              <ArrowUpRight className="size-4 text-[#d9ff81]" />
            </Link>
          </div>
        </div>
      </section>

      <section
        id="principles"
        className="border-y border-[#dbe5d7] bg-[#e9eee4] py-7"
      >
        <div className="mx-auto grid max-w-[1440px] gap-5 px-5 sm:grid-cols-3 sm:px-8 lg:px-12">
          <div className="flex items-center gap-4">
            <Orbit className="size-5 text-[#355c4b]" />
            <p className="text-sm leading-5 text-[#486459]">
              <strong className="block text-[#173029]">Hard first</strong>
              Release order follows technical complexity.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <CheckCircle2 className="size-5 text-[#355c4b]" />
            <p className="text-sm leading-5 text-[#486459]">
              <strong className="block text-[#173029]">
                Evidence before status
              </strong>
              Validation is earned, not decorative.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Globe2 className="size-5 text-[#355c4b]" />
            <p className="text-sm leading-5 text-[#486459]">
              <strong className="block text-[#173029]">Open by default</strong>
              Source, setup, and standards are public.
            </p>
          </div>
        </div>
      </section>

      <section
        id="roadmap"
        className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28"
      >
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#6a8478]">
              The roadmap
            </p>
            <h2 className="mt-3 max-w-2xl font-serif text-5xl leading-[0.95] tracking-[-0.05em] sm:text-6xl">
              A status that tells the truth.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#587166]">
            Every entry publishes its scope, prerequisites, and conditions for
            verification. Filter by discipline, then open a card to review the
            release contract.
          </p>
        </div>
        <div className="mt-10 flex gap-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${selectedCategory === category ? "bg-[#173029] text-[#eff8f0]" : "border border-[#c9d8c7] bg-[#fbfcf8] text-[#587166] hover:bg-[#edf1ea]"}`}
            >
              {category}
            </button>
          ))}
        </div>
        {projectsQuery.isLoading ? (
          <div className="flex min-h-72 items-center justify-center gap-3 text-[#587166]">
            <Loader2 className="size-5 animate-spin" />
            Loading the public roadmap…
          </div>
        ) : projectsQuery.error ? (
          <div className="mt-10 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-800">
            The roadmap could not be loaded. Please refresh and try again.
          </div>
        ) : (
          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleProjects.map(project => (
              <article
                key={project.id}
                className={`group rounded-3xl border p-5 transition duration-200 ${expandedId === project.id ? "border-[#173029] bg-[#173029] text-[#eff8f0] shadow-[0_18px_50px_rgba(23,48,41,0.18)]" : "border-[#d9e2d6] bg-[#fbfcf8] hover:-translate-y-1 hover:border-[#9cb6a0]"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={`grid size-10 place-items-center rounded-2xl ${expandedId === project.id ? "bg-[#d9ff81] text-[#173029]" : "bg-[#edf1ea] text-[#36564a]"}`}
                  >
                    {categoryIcon(project.category)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${expandedId === project.id ? "bg-white/10 text-[#eff8f0]" : statusStyle[project.status]}`}
                    >
                      {project.status.replace("_", " ")}
                    </span>
                    <span
                      className={`text-xs font-bold ${expandedId === project.id ? "text-[#d9ff81]" : "text-[#6a8478]"}`}
                    >
                      #{project.releaseOrder}
                    </span>
                  </div>
                </div>
                <p
                  className={`mt-5 text-xs font-bold uppercase tracking-[0.14em] ${expandedId === project.id ? "text-[#b7d4bf]" : "text-[#6a8478]"}`}
                >
                  {project.category}
                </p>
                <h3 className="mt-2 font-serif text-3xl leading-8 tracking-[-0.04em]">
                  {project.title}
                </h3>
                <p
                  className={`mt-3 text-sm leading-6 ${expandedId === project.id ? "text-[#d2e1d5]" : "text-[#587166]"}`}
                >
                  {project.summary}
                </p>
                <div
                  className={`mt-5 flex items-center justify-between border-t pt-4 ${expandedId === project.id ? "border-white/10" : "border-[#e1e8df]"}`}
                >
                  <span
                    className={`text-xs ${expandedId === project.id ? "text-[#b7d4bf]" : "text-[#6a8478]"}`}
                  >
                    Difficulty{" "}
                    <strong className="ml-1">
                      {Array.from(
                        { length: project.difficulty },
                        () => "◆"
                      ).join("")}
                    </strong>
                  </span>
                  <button
                    onClick={() =>
                      setExpandedId(
                        expandedId === project.id ? null : project.id
                      )
                    }
                    className={`inline-flex items-center gap-1 text-xs font-bold ${expandedId === project.id ? "text-[#d9ff81]" : "text-[#36564a]"}`}
                  >
                    {expandedId === project.id ? "Close brief" : "View brief"}
                    <ArrowUpRight
                      className={`size-3 transition ${expandedId === project.id ? "rotate-90" : ""}`}
                    />
                  </button>
                </div>
                {expandedId === project.id && (
                  <div className="mt-5 space-y-4 border-t border-white/10 pt-5 text-sm leading-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#b7d4bf]">
                        Prerequisites
                      </p>
                      <p className="mt-1 text-[#eff8f0]">
                        {project.prerequisites}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#b7d4bf]">
                        Validation
                      </p>
                      <p className="mt-1 text-[#eff8f0]">
                        {project.validationCriteria}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {project.platforms.map(platform => (
                        <span
                          key={platform}
                          className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-[#d2e1d5]"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mx-5 mb-5 overflow-hidden rounded-[2rem] bg-[#173029] sm:mx-8 lg:mx-12">
        <div className="mx-auto grid max-w-[1344px] gap-8 px-7 py-12 sm:px-12 lg:grid-cols-[1fr_auto] lg:items-center lg:py-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#b7d4bf]">
              First release in progress
            </p>
            <h2 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.95] tracking-[-0.05em] text-[#f4f6ef]">
              Start with the assistant.
              <br />
              Watch the roadmap earn its next status.
            </h2>
          </div>
          <Button
            asChild
            className="h-12 rounded-full bg-[#d9ff81] px-6 text-[#173029] hover:bg-[#efffbf]"
          >
            <Link href="/assistant">
              Open workspace <Sparkles className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </section>
      <footer className="mx-auto flex max-w-[1440px] flex-col gap-4 px-5 py-8 text-sm text-[#587166] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <span>Open Innovation Lab · Built in public</span>
        <div className="flex gap-5">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#173029]"
          >
            GitHub
          </a>
          <a
            href="https://opensource.org/license/mit"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#173029]"
          >
            MIT License
          </a>
        </div>
      </footer>
    </main>
  );
}
