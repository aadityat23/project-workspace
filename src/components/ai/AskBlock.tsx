import { ArrowRight, FileText } from "lucide-react";
import { useState } from "react";

import { suggestedProjectQuestions } from "@/lib/api";
import type { AIAnswer } from "@/lib/types";

export function SourceCitationList({ sources }: { sources: AIAnswer["sources"] }) {
  if (sources.length === 0) return null;
  return (
    <div className="mt-4 border-t border-border pt-3">
      <p className="text-overline mb-2">Sources</p>
      <ul className="space-y-1.5">
        {sources.map((source) => (
          <li key={`${source.fileId}-${source.page}`} className="flex items-center gap-2">
            <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="text-meta truncate text-foreground">{source.fileName}</span>
            <span className="text-meta text-muted-foreground">— Page {source.page}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AskBlock({
  title = "Ask this project",
  placeholder = "Ask about this project…",
  onAsk,
  suggestions = suggestedProjectQuestions,
  compact = false,
}: {
  title?: string;
  placeholder?: string;
  onAsk: (question: string) => Promise<AIAnswer>;
  suggestions?: string[];
  compact?: boolean;
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<AIAnswer | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (value: string) => {
    if (!value.trim() || pending) return;
    setPending(true);
    setQuestion(value);
    try {
      setAnswer(await onAsk(value));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={compact ? "" : "panel"}>
      {compact ? null : (
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-section">{title}</h2>
          <span className="text-meta text-muted-foreground">Answers cite source documents</span>
        </header>
      )}

      <div className={compact ? "" : "px-4 py-4"}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void submit(question);
          }}
          className="flex gap-2"
        >
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            className="field"
          />
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Searching…" : "Ask"}
            <ArrowRight className="size-4" />
          </button>
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => void submit(suggestion)}
              className="text-meta rounded-[4px] border border-border-strong bg-surface px-2 py-1 text-muted-foreground transition-colors duration-150 hover:border-ring hover:text-foreground"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {answer ? (
          <article className="mt-4 rounded-[6px] border border-border bg-surface px-4 py-3">
            <p className="text-overline">Answer</p>
            <p className="text-body mt-1.5 text-foreground">{answer.answer}</p>
            {answer.keyPoints?.length ? (
              <ul className="mt-3 space-y-1">
                {answer.keyPoints.map((point) => (
                  <li key={point} className="text-meta flex gap-2 text-muted-foreground">
                    <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />
                    {point}
                  </li>
                ))}
              </ul>
            ) : null}
            <SourceCitationList sources={answer.sources} />
          </article>
        ) : null}
      </div>
    </div>
  );
}
