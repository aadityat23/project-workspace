import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileText } from "lucide-react";
import { useState } from "react";

import { askProject, getFile, getProjectBriefingCounts, getProjects } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { projectImage } from "@/lib/project-media";
import type { AIAnswer } from "@/lib/types";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant — Milind Awasarmol & Associates" },
      {
        name: "description",
        content:
          "Ask questions about a project's documents and drawings and get answers with cited source files.",
      },
      { property: "og:title", content: "AI Assistant — Milind Awasarmol & Associates" },
      {
        property: "og:description",
        content: "Ask questions about project documents and get answers with cited sources.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Assistant,
});

const questions = [
  "What is the latest structural revision?",
  "Which drawings are current?",
  "What documents mention the foundation?",
  "Summarize the structural documentation.",
];

function Assistant() {
  const projects = getProjects();
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const project = projects.find((p) => p.id === projectId)!;
  const counts = getProjectBriefingCounts(projectId);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<AIAnswer | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = async (q: string) => {
    if (!q.trim() || pending) return;
    setQuestion(q);
    setPending(true);
    setError(null);
    try {
      setAnswer(await askProject(projectId, q));
    } catch {
      setError("The assistant could not read this project's files. Try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] px-8 pt-7 pb-14">
      <div className="border-b border-border pb-5">
        <p className="text-overline">Ask about a project</p>
        <h1 className="mt-1.5 text-[26px] font-semibold tracking-[-0.015em]">
          Assistant
          <span className="ml-3 font-normal text-muted-foreground">
            Answers drawn only from the selected project's files
          </span>
        </h1>
      </div>

      <div className="mt-6 grid gap-8 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside>
          <h2 className="text-overline border-b border-border pb-2">Project scope</h2>
          <ul className="divide-y divide-border">
            {projects.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => {
                    setProjectId(p.id);
                    setAnswer(null);
                  }}
                  className={`flex w-full items-center gap-3 py-2.5 pl-2 text-left ${
                    p.id === projectId ? "border-l-2 border-accent bg-surface" : "border-l-2 border-transparent hover:bg-surface"
                  }`}
                >
                  <img src={projectImage(p.id)} alt="" loading="lazy" width={1280} height={800} className="h-9 w-14 rounded-[3px] object-cover" />
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold uppercase tracking-[0.02em]">{p.name}</span>
                    <span className="text-code block text-[11px] text-muted-foreground">{p.code} · {p.fileCount} files</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="min-w-0">
          <div className="flex items-center gap-4 rounded-[6px] border border-border bg-card p-3">
            <img src={projectImage(project.id)} alt="" width={1280} height={800} className="h-14 w-[88px] rounded-[4px] object-cover" />
            <div className="min-w-0 flex-1">
              <p className="text-overline">Ask about</p>
              <p className="truncate text-[16px] font-semibold tracking-[0.03em] uppercase">{project.name}</p>
            </div>
            <dl className="flex divide-x divide-border">
              {([["Documents", counts.documents], ["Drawings", counts.drawings], ["Photos", counts.photos]] as const).map(([k, v]) => (
                <div key={k} className="px-4">
                  <dt className="text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">{k}</dt>
                  <dd className="font-mono text-[15px] tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <form
            className="mt-5 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void ask(question);
            }}
          >
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What do you want to know?"
              aria-label="What do you want to know?"
              className="field h-11 text-[14.5px]"
            />
            <button type="submit" className="btn btn-primary h-11 px-5" disabled={pending}>
              {pending ? "Reading files…" : "Ask"}
              <ArrowRight className="size-4" />
            </button>
          </form>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {questions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => void ask(q)}
                className="flex items-center justify-between gap-3 rounded-[4px] border border-border bg-card px-3 py-2 text-left text-[13px] hover:border-border-strong hover:bg-surface"
              >
                {q}
                <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>

          {error ? (
            <p role="alert" className="mt-8 text-[13px] text-danger">{error}</p>
          ) : pending ? (
            <p className="mt-8 text-[13px] text-muted-foreground">Reading {project.name} files…</p>
          ) : answer ? (
            <div className="mt-8 grid gap-8 2xl:grid-cols-[minmax(0,1fr)_380px]">
              <article>
                <h2 className="text-overline border-b border-foreground/80 pb-2">Answer</h2>
                <p className="mt-3 text-[13px] text-muted-foreground">{answer.question}</p>
                <p className="mt-2 text-[15px] leading-relaxed">{answer.answer}</p>
                {answer.keyPoints?.length ? (
                  <ul className="mt-4 space-y-1.5 border-l-2 border-border pl-4">
                    {answer.keyPoints.map((k) => (
                      <li key={k} className="text-[13.5px]">{k}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
              <aside>
                <h2 className="text-overline flex justify-between border-b border-foreground/80 pb-2">
                  Sources <span className="font-mono">{answer.sources.length}</span>
                </h2>
                <ol className="divide-y divide-border">
                  {answer.sources.map((s, i) => {
                    const f = getFile(s.fileId);
                    return (
                      <li key={`${s.fileId}-${s.page}`}>
                        <Link
                          to="/projects/$projectId/documents"
                          params={{ projectId }}
                          search={{ file: s.fileId }}
                          className="group grid grid-cols-[22px_minmax(0,1fr)] gap-2 py-2.5 hover:bg-surface"
                        >
                          <span className="font-mono text-[11px] text-muted-foreground">[{i + 1}]</span>
                          <span className="min-w-0">
                            <span className="flex items-center gap-1.5 truncate text-[13px] font-semibold group-hover:text-primary">
                              <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                              {s.fileName}
                            </span>
                            <span className="text-code block text-[11.5px] text-muted-foreground">
                              p. {s.page}
                              {f ? ` · ${f.revision} · ${f.metadata.discipline} · ${formatDate(f.modifiedAt)}` : ""}
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </aside>
            </div>
          ) : (
            <p className="mt-8 border-t border-border pt-4 text-[12.5px] text-muted-foreground">
              Answers cite the document and page they come from. Only files in {project.name} are read.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
