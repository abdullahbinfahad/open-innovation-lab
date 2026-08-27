import { useAuth } from "@/_core/hooks/useAuth";
import { AIChatBox, type Message as ChatMessage } from "@/components/AIChatBox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  ClipboardList,
  Loader2,
  MessageSquarePlus,
  Plus,
  Sparkles,
  Target,
} from "lucide-react";
import { Link } from "wouter";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const starterPrompts = [
  "Help me turn a rough idea into a realistic weekly plan.",
  "Break down my most important goal into the next three actions.",
  "Review this plan for risks, dependencies, and a better starting point.",
];

function suggestedFollowUps(content: string): string[] {
  const marker = "## Suggested follow-ups";
  const markerIndex = content.indexOf(marker);
  if (markerIndex < 0) return [];
  return content
    .slice(markerIndex + marker.length)
    .split("\n")
    .map(line => line.trim().replace(/^-\s+/, ""))
    .filter(line => line.length > 0 && !line.startsWith("#"))
    .slice(0, 3);
}

function visibleMessageContent(content: string): string {
  return content.split("## Suggested follow-ups")[0]?.trim() || content;
}

export default function Assistant() {
  const { user, loading, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [selectedSessionId, setSelectedSessionId] = useState<
    string | undefined
  >();
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");

  const sessionsQuery = trpc.assistant.sessions.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const messagesQuery = trpc.assistant.messages.useQuery(
    { sessionId: selectedSessionId ?? "" },
    { enabled: isAuthenticated && Boolean(selectedSessionId) }
  );
  const tasksQuery = trpc.assistant.tasks.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const selectedSession = useMemo(
    () => sessionsQuery.data?.find(session => session.id === selectedSessionId),
    [sessionsQuery.data, selectedSessionId]
  );

  const refreshWorkspace = async () => {
    await Promise.all([
      utils.assistant.sessions.invalidate(),
      utils.assistant.tasks.invalidate(),
      selectedSessionId
        ? utils.assistant.messages.invalidate({ sessionId: selectedSessionId })
        : Promise.resolve(),
    ]);
  };

  const sendMessage = trpc.assistant.sendMessage.useMutation({
    onSuccess: async result => {
      setSelectedSessionId(result.sessionId);
      await Promise.all([
        utils.assistant.sessions.invalidate(),
        utils.assistant.messages.invalidate({ sessionId: result.sessionId }),
      ]);
      if (result.status === "error")
        toast.error(
          "The assistant could not complete that response. Please try again."
        );
    },
    onError: error => toast.error(error.message),
  });

  const breakDownSession = trpc.assistant.breakDownSession.useMutation({
    onSuccess: async result => {
      await utils.assistant.tasks.invalidate();
      toast.success(
        `${result.created} task${result.created === 1 ? "" : "s"} added to your workspace.`
      );
    },
    onError: error => toast.error(error.message),
  });

  const createTask = trpc.assistant.createTask.useMutation({
    onSuccess: async () => {
      setTaskTitle("");
      setTaskDescription("");
      setNewTaskOpen(false);
      await utils.assistant.tasks.invalidate();
      toast.success("Task added to your workspace.");
    },
    onError: error => toast.error(error.message),
  });

  const updateTask = trpc.assistant.updateTaskStatus.useMutation({
    onSuccess: () => utils.assistant.tasks.invalidate(),
    onError: error => toast.error(error.message),
  });

  const messages: ChatMessage[] = (messagesQuery.data ?? []).map(message => ({
    id: message.id,
    role: message.role,
    content:
      message.role === "assistant" && message.status === "completed"
        ? visibleMessageContent(message.content)
        : message.content,
    status: message.status,
    model: message.model,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f6ef] flex items-center justify-center text-[#173029]">
        <Loader2 className="size-5 animate-spin mr-3" />
        Loading workspace
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#f4f6ef] text-[#173029] px-5 py-7 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#47685d] transition hover:text-[#173029]"
          >
            <ArrowLeft className="size-4" />
            Open Innovation Lab
          </Link>
          <section className="mt-20 grid overflow-hidden rounded-[2rem] border border-[#d9e2d6] bg-[#173029] shadow-[0_24px_80px_rgba(23,48,41,0.18)] lg:grid-cols-[1.2fr_0.8fr]">
            <div className="p-8 sm:p-12 lg:p-16">
              <Badge className="bg-[#d9ff81] text-[#173029] hover:bg-[#d9ff81]">
                Personal AI Assistant
              </Badge>
              <h1 className="mt-7 max-w-xl font-serif text-5xl leading-[0.98] tracking-[-0.05em] text-[#f4f6ef] sm:text-6xl">
                A calm workspace for turning intent into action.
              </h1>
              <p className="mt-7 max-w-lg text-lg leading-8 text-[#c8d6cc]">
                Sign in to create private, persistent conversations and task
                lists. The assistant clearly shows when a response is being
                prepared or when a model request needs another attempt.
              </p>
              <Button
                onClick={startLogin}
                className="mt-9 h-12 rounded-full bg-[#d9ff81] px-6 text-[#173029] hover:bg-[#efffbf]"
              >
                Sign in to continue <ChevronRight className="ml-1 size-4" />
              </Button>
            </div>
            <div className="relative min-h-72 overflow-hidden border-t border-white/10 bg-[#203d35] p-8 lg:border-l lg:border-t-0">
              <div className="absolute -right-12 -top-16 size-64 rounded-full bg-[#d9ff81]/20 blur-3xl" />
              <div className="relative rounded-2xl border border-white/10 bg-[#173029]/80 p-5 backdrop-blur">
                <Sparkles className="size-5 text-[#d9ff81]" />
                <p className="mt-4 text-sm leading-6 text-[#eff8f0]">
                  “Help me organize a launch plan that I can start this week.”
                </p>
                <div className="mt-6 flex gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#d9ff81]" />
                  <span className="h-2 w-2 rounded-full bg-[#d9ff81]/50" />
                  <span className="h-2 w-2 rounded-full bg-[#d9ff81]/30" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f6ef] text-[#173029]">
      <header className="sticky top-0 z-30 border-b border-[#d9e2d6]/80 bg-[#f4f6ef]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="grid size-8 place-items-center rounded-full bg-[#173029] font-serif text-lg text-[#d9ff81]">
              O
            </span>
            <span className="text-sm font-semibold tracking-tight">
              Open Innovation Lab
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-[#587166] sm:block">
              {user?.name ?? "Private workspace"}
            </span>
            <Button
              variant="outline"
              className="rounded-full border-[#bed0c1] bg-transparent"
              asChild
            >
              <Link href="/">View roadmap</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] gap-5 px-5 py-6 sm:px-8 lg:grid-cols-[250px_minmax(0,1fr)_300px] lg:px-12 lg:py-9">
        <aside className="rounded-3xl border border-[#d9e2d6] bg-[#fbfcf8] p-4 lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)]">
          <div className="flex items-center justify-between px-2 pb-4">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#6a8478]">
              Sessions
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="size-8 rounded-full"
              onClick={() => setSelectedSessionId(undefined)}
              aria-label="Start a new conversation"
            >
              <MessageSquarePlus className="size-4" />
            </Button>
          </div>
          <div className="space-y-1 overflow-y-auto lg:max-h-[calc(100vh-11rem)]">
            {sessionsQuery.isLoading ? (
              <div className="p-3 text-sm text-[#6a8478]">
                Loading sessions…
              </div>
            ) : sessionsQuery.data?.length ? (
              sessionsQuery.data.map(session => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSessionId(session.id)}
                  className={`w-full rounded-2xl px-3 py-3 text-left transition ${selectedSessionId === session.id ? "bg-[#d9ff81] text-[#173029]" : "text-[#486459] hover:bg-[#edf1ea]"}`}
                >
                  <p className="line-clamp-2 text-sm font-semibold leading-5">
                    {session.title}
                  </p>
                  <p className="mt-1 text-xs opacity-65">
                    {new Date(session.lastActivityAt).toLocaleDateString()}
                  </p>
                </button>
              ))
            ) : (
              <div className="rounded-2xl bg-[#edf1ea] p-4 text-sm leading-6 text-[#587166]">
                Your sessions will appear here after your first message.
              </div>
            )}
          </div>
        </aside>

        <section className="min-w-0 rounded-3xl border border-[#d9e2d6] bg-[#fbfcf8] p-4 shadow-[0_14px_50px_rgba(36,64,53,0.05)] sm:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3 px-1">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6a8478]">
                Personal AI Assistant
              </p>
              <h1 className="mt-1 font-serif text-3xl tracking-[-0.04em]">
                {selectedSession?.title ?? "A fresh conversation"}
              </h1>
            </div>
            {selectedSessionId && (
              <Button
                variant="outline"
                className="rounded-full border-[#bed0c1] bg-transparent"
                disabled={breakDownSession.isPending}
                onClick={() =>
                  breakDownSession.mutate({ sessionId: selectedSessionId })
                }
              >
                {breakDownSession.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Target className="mr-2 size-4" />
                )}
                Make tasks
              </Button>
            )}
          </div>
          <AIChatBox
            messages={messages}
            onSendMessage={content =>
              sendMessage.mutate({ sessionId: selectedSessionId, content })
            }
            isLoading={sendMessage.isPending}
            height="calc(100vh - 12rem)"
            className="min-h-[590px] rounded-2xl border-[#d9e2d6] shadow-none"
            emptyStateMessage="Begin with a goal, decision, or rough idea. The assistant will keep the conversation and help shape the next action."
            placeholder="Describe what you want to make progress on…"
            suggestedPrompts={starterPrompts}
            renderMessageFooter={message => {
              const source =
                messagesQuery.data?.find(item => item.id === message.id)
                  ?.content ?? message.content;
              const followUps =
                message.status === "completed"
                  ? suggestedFollowUps(source)
                  : [];
              if (!followUps.length) return null;
              return (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-[#cfdbcf] pt-3">
                  {followUps.map(prompt => (
                    <button
                      key={prompt}
                      onClick={() =>
                        sendMessage.mutate({
                          sessionId: selectedSessionId,
                          content: prompt,
                        })
                      }
                      disabled={sendMessage.isPending}
                      className="rounded-full border border-[#bed0c1] bg-[#fbfcf8] px-3 py-1.5 text-left text-xs font-semibold text-[#36564a] transition hover:bg-[#d9ff81] disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              );
            }}
          />
        </section>

        <aside className="rounded-3xl border border-[#d9e2d6] bg-[#fbfcf8] p-5 lg:sticky lg:top-24 lg:h-fit">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6a8478]">
                Action queue
              </p>
              <h2 className="mt-1 font-serif text-2xl tracking-[-0.04em]">
                Your tasks
              </h2>
            </div>
            <Button
              size="icon"
              className="size-9 rounded-full bg-[#173029] text-[#d9ff81] hover:bg-[#294b40]"
              onClick={() => setNewTaskOpen(open => !open)}
              aria-label="Add task"
            >
              <Plus className="size-4" />
            </Button>
          </div>
          {newTaskOpen && (
            <form
              className="mt-5 space-y-3 rounded-2xl bg-[#edf1ea] p-3"
              onSubmit={event => {
                event.preventDefault();
                if (taskTitle.trim())
                  createTask.mutate({
                    title: taskTitle,
                    description: taskDescription || undefined,
                    sessionId: selectedSessionId,
                  });
              }}
            >
              <Input
                value={taskTitle}
                onChange={event => setTaskTitle(event.target.value)}
                placeholder="Task title"
                className="border-[#c8d6ca] bg-white"
                autoFocus
              />
              <Textarea
                value={taskDescription}
                onChange={event => setTaskDescription(event.target.value)}
                placeholder="Optional detail"
                className="min-h-20 border-[#c8d6ca] bg-white"
              />
              <Button
                type="submit"
                className="h-9 w-full rounded-full bg-[#173029] text-[#d9ff81] hover:bg-[#294b40]"
                disabled={createTask.isPending}
              >
                Add task
              </Button>
            </form>
          )}
          <div className="mt-5 space-y-3">
            {tasksQuery.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-[#6a8478]">
                <Loader2 className="size-4 animate-spin" />
                Loading tasks
              </div>
            ) : tasksQuery.data?.length ? (
              tasksQuery.data.map(task => (
                <article
                  key={task.id}
                  className={`rounded-2xl border p-3 ${task.status === "completed" ? "border-[#d8e4d6] bg-[#edf1ea]" : "border-[#d9e2d6] bg-white"}`}
                >
                  <div className="flex gap-3">
                    <button
                      aria-label={`Mark ${task.title} ${task.status === "completed" ? "incomplete" : "complete"}`}
                      className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border ${task.status === "completed" ? "border-[#173029] bg-[#173029] text-[#d9ff81]" : "border-[#9cb4a2]"}`}
                      onClick={() =>
                        updateTask.mutate({
                          id: task.id,
                          status:
                            task.status === "completed" ? "todo" : "completed",
                        })
                      }
                    >
                      {task.status === "completed" && (
                        <Check className="size-3" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold leading-5 ${task.status === "completed" ? "text-[#6a8478] line-through" : "text-[#244237]"}`}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="mt-1 text-xs leading-5 text-[#6a8478]">
                          {task.description}
                        </p>
                      )}
                      <Badge
                        variant="outline"
                        className="mt-2 border-[#c8d6ca] text-[10px] uppercase tracking-wide text-[#587166]"
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl bg-[#edf1ea] p-4 text-sm leading-6 text-[#587166]">
                <ClipboardList className="mb-3 size-5 text-[#36564a]" />
                Use “Make tasks” after a conversation, or add a task yourself.
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
