import { Link } from "@tanstack/react-router";
import { ArrowUp, ChevronRight, RotateCw } from "lucide-react";
import { useState } from "react";

import { RevisionBadge } from "@/components/kit/Badges";
import { getFile } from "@/lib/api";
import type { AIAnswer } from "@/lib/types";

import { StateBlock } from "./kit";

/** Grounded Q&A: question field, suggested prompts, Answer, tappable Sources. */
export function MobileAsk({
  suggestions,
  ask,
  placeholder,
}: {
  suggestions: string[];
  ask: (q: string) => Promise<AIAnswer>;
  placeholder: string;
}) {
  const [q, setQ] = useState("");
  const [state, setState] = useState<
    { s: "idle" } | { s: "loading"; q: string } | { s: "done"; a: AIAnswer } | { s: "error"; q: string }
  >({ s: "idle" });

  const run = async (question: string) => {
    if (!question.trim()) return;
    setQ(question);
    setState({ s: "loading", q: question });
    try {
      setState({ s: "done", a: await ask(question) });
    } catch {
      setState({ s: "error", q: question });
    }
  };

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void run(q);
        }}
        className="border-b border-border bg-card px-4 pb-3"
      >
        <div className="relative">
          <textarea
            value={q}
            onChange={(e) => setQ(e.target.value)}
            rows={2}
            placeholder={placeholder}
            className="field min-h-[72px] w-full resize-none py-2.5 pr-14 text-[15px]"
          />
          <button
            type="submit"
            aria-label="Ask"
            disabled={!q.trim() || state.s === "loading"}
            className="btn btn-primary absolute right-2 bottom-2 size-10 p-0"
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
      </form>

      {state.s === "idle" && (
        <section className="pt-4">
          <h2 className="text-overline px-4 pb-2">Suggested questions</h2>
          <div className="border-y border-border bg-card">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => void run(s)}
                className="flex min-h-[50px] w-full items-center gap-3 border-b border-border px-4 text-left text-[14.5px] last:border-b-0 active:bg-surface"
              >
                <span className="flex-1">{s}</span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
            ))}
          </div>
          <p className="px-4 pt-3 text-[12px] text-muted-foreground">
            Answers are drawn only from indexed project documents and always list their sources.
          </p>
        </section>
      )}

      {state.s === "loading" && (
        <StateBlock kind="loading" title="Reading project documents" body={state.q} />
      )}

      {state.s === "error" && (
        <StateBlock
          kind="error"
          title="The answer could not be generated"
          body="The document index did not respond. Try again."
          action={
            <button type="button" className="btn btn-secondary h-11" onClick={() => void run(state.q)}>
              <RotateCw className="size-4" /> Try again
            </button>
          }
        />
      )}

      {state.s === "done" && (
        <>
          <section className="pt-4">
            <h2 className="text-overline px-4 pb-2">Answer</h2>
            <div className="border-y border-border bg-card px-4 py-3.5">
              <p className="text-[13px] font-medium text-muted-foreground">{state.a.question}</p>
              <p className="mt-2 text-[15px] leading-[1.55]">{state.a.answer}</p>
              {state.a.keyPoints && state.a.keyPoints.length > 0 && (
                <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
                  {state.a.keyPoints.map((k) => (
                    <li key={k} className="flex gap-2 text-[13.5px]">
                      <span aria-hidden className="mt-2 size-1 shrink-0 bg-foreground" />
                      {k}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
          <section className="pt-4">
            <h2 className="text-overline px-4 pb-2">Sources · {state.a.sources.length}</h2>
            <ol className="border-y border-border bg-card">
              {state.a.sources.map((s, i) => {
                const f = getFile(s.fileId);
                return (
                  <li key={`${s.fileId}-${s.page}`} className="border-b border-border last:border-b-0">
                    <Link
                      to="/m/file/$fileId"
                      params={{ fileId: s.fileId }}
                      search={{ page: s.page }}
                      className="flex min-h-[60px] items-center gap-3 px-4 py-2.5 active:bg-surface"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-[4px] border border-border font-mono text-[12px]">
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-code font-medium">{s.fileName}</span>
                        <span className="mt-1 flex items-center gap-2 text-[12.5px] text-muted-foreground">
                          Page {s.page}
                          {f && <RevisionBadge revision={f.revision} current={f.status !== "Superseded"} />}
                          {f && <span className="truncate">{f.metadata.discipline}</span>}
                        </span>
                      </span>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
          <div className="px-4 pt-4">
            <button
              type="button"
              className="btn btn-secondary h-11 w-full"
              onClick={() => {
                setQ("");
                setState({ s: "idle" });
              }}
            >
              Ask another question
            </button>
          </div>
        </>
      )}
    </div>
  );
}
