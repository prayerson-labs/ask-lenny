"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Citation = {
  guest: string;
  episode_title: string;
  episode_url?: string;
  episode_id?: string;
};

type Quote = {
  quote: string;
  guest: string;
  episode_title: string;
  episode_url?: string;
  episode_id?: string;
};

type Paragraph = {
  text: string;
  citations: Citation[];
  quotes: Quote[];
};

type AssistantAnswer = {
  kind: "answer";
  paragraphs: Paragraph[];
};

type AssistantNoResults = {
  kind: "no_results";
  message: string;
};

type AssistantMessage = {
  role: "assistant";
  content: AssistantAnswer | AssistantNoResults;
};

type UserMessage = {
  role: "user";
  content: string;
};

type Message = AssistantMessage | UserMessage;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";
const EPISODE_BASE =
  process.env.NEXT_PUBLIC_EPISODE_BASE_URL ??
  "https://www.lennyspodcast.com/episodes/";

function citationLink(citation: Citation) {
  if (citation.episode_url) {
    return citation.episode_url;
  }
  if (citation.episode_id) {
    return `${EPISODE_BASE}${encodeURIComponent(citation.episode_id)}`;
  }
  return "#";
}

function formatCitations(citations: Citation[]) {
  return citations
    .map(
      (citation) =>
        `(${citation.guest}, episode: ${citation.episode_title})`
    )
    .join(" ");
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQuotes, setShowQuotes] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = "0px";
    const nextHeight = Math.min(inputRef.current.scrollHeight, 180);
    inputRef.current.style.height = `${nextHeight}px`;
    inputRef.current.style.overflowY =
      inputRef.current.scrollHeight > 180 ? "auto" : "hidden";
  }, [input]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  const latestAssistant = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const message = messages[i];
      if (message.role === "assistant") {
        return message;
      }
    }
    return null;
  }, [messages]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const newUserMessage: UserMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });

      const data = await response.json();

      if (data.kind === "no_results") {
        const assistantMessage: AssistantMessage = {
          role: "assistant",
          content: { kind: "no_results", message: data.message },
        };
        setMessages((prev) => [...prev, assistantMessage]);
        return;
      }

      const assistantMessage: AssistantMessage = {
        role: "assistant",
        content: { kind: "answer", paragraphs: data.paragraphs ?? [] },
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const assistantMessage: AssistantMessage = {
        role: "assistant",
        content: {
          kind: "no_results",
          message:
            "no relevant lenny’s podcast quotes found for this topic.",
        },
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit(event);
    }
  }

  async function handleCopy() {
    if (!latestAssistant) return;
    if (latestAssistant.content.kind === "no_results") {
      await navigator.clipboard.writeText(latestAssistant.content.message);
      return;
    }

    const text = latestAssistant.content.paragraphs
      .map((paragraph) => {
        const citations = formatCitations(paragraph.citations);
        return `${paragraph.text}\n${citations}`;
      })
      .join("\n\n");

    await navigator.clipboard.writeText(text);
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-zinc-50 text-zinc-900">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">Ask Lenny</h1>
            <p className="text-sm text-zinc-500">
              Research assistant for Lenny’s Podcast
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-zinc-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-300 accent-black"
                checked={showQuotes}
                onChange={(event) => setShowQuotes(event.target.checked)}
              />
              Show quotes
            </label>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 pb-28 pt-6">
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500">
            Ask a question about Lenny’s Podcast and get cited answers.
          </div>
        ) : (
          messages.map((message, index) => {
            if (message.role === "user") {
              return (
                <div key={index} className="flex justify-end">
                  <div className="max-w-xl rounded-2xl bg-zinc-900 px-4 py-3 text-sm text-white">
                    {message.content}
                  </div>
                </div>
              );
            }

            if (message.content.kind === "no_results") {
              return (
                <div key={index} className="flex justify-start">
                  <div className="max-w-2xl rounded-2xl bg-white px-4 py-3 text-sm text-zinc-700 shadow-sm">
                    {message.content.message}
                  </div>
                </div>
              );
            }

            return (
              <div key={index} className="flex justify-start">
                <div className="max-w-2xl rounded-2xl bg-white px-4 py-4 text-sm text-zinc-800 shadow-sm">
                  {message.content.paragraphs.map((paragraph, pIndex) => (
                    <div key={pIndex} className="mb-4 last:mb-0">
                      <p className="leading-6">{paragraph.text}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-500">
                        {paragraph.citations.map((citation, cIndex) => (
                          <a
                            key={`${pIndex}-${cIndex}`}
                            href={citationLink(citation)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-zinc-100 px-2 py-1 transition hover:bg-zinc-200"
                          >
                            ({citation.guest}, episode:{" "}
                            {citation.episode_title})
                          </a>
                        ))}
                      </div>
                      {showQuotes && paragraph.quotes.length > 0 ? (
                        <div className="mt-3 border-l-2 border-zinc-200 pl-3 text-xs text-zinc-600">
                          {paragraph.quotes.map((quote, qIndex) => (
                            <p key={`${pIndex}-${qIndex}`} className="mb-2">
                              “{quote.quote}” — {quote.guest},{" "}
                              {quote.episode_title}
                            </p>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
        {isLoading ? (
          <div className="flex justify-start">
            <div className="relative overflow-hidden rounded-2xl border border-zinc-100 bg-white px-4 py-3 text-sm text-zinc-600 shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-100/70 to-transparent opacity-60 animate-[pulse_3s_ease-in-out_infinite]" />
              <div className="relative flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-zinc-400 animate-[pulse_2.8s_ease-in-out_infinite]" />
                <span className="h-2 w-2 rounded-full bg-zinc-400 animate-[pulse_2.8s_ease-in-out_infinite_0.4s]" />
                <span className="h-2 w-2 rounded-full bg-zinc-400 animate-[pulse_2.8s_ease-in-out_infinite_0.8s]" />
              </div>
            </div>
          </div>
        ) : null}
        <div ref={endRef} />
      </main>

      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 z-20 border-t border-zinc-200 bg-white"
      >
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-6 py-4">
          <div className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Ask about product, growth, leadership..."
              className="premium-scrollbar max-h-[180px] w-full flex-1 resize-none rounded-2xl border border-zinc-300 px-5 pb-4 pt-3 pr-8 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none"
              style={{ scrollbarGutter: "stable both-edges" }}
            />
            <div className="flex flex-col items-center">
              <button
                type="submit"
                disabled={isLoading}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-zinc-900 text-white transition hover:bg-zinc-800 hover:shadow-[0_0_12px_rgba(0,0,0,0.25)] disabled:opacity-60"
                aria-label="Send message"
                title="Send"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 translate-y-[-1px]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m12 5 0 14" />
                  <path d="m6 11 6-6 6 6" />
                </svg>
              </button>
            </div>
          </div>
          <div className="text-center text-xs text-zinc-500">
            <span>A product by Prayerson Christian</span>
            <span className="px-1">•</span>
            <a
              href="https://x.com/iamprayerson"
              target="_blank"
              rel="noopener noreferrer"
              className="relative text-zinc-500 transition hover:text-black after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-black after:transition-all after:duration-300 hover:after:w-full"
            >
              X
            </a>
            <span className="px-1">•</span>
            <a
              href="https://www.linkedin.com/in/prayersonchristian"
              target="_blank"
              rel="noopener noreferrer"
              className="relative text-zinc-500 transition hover:text-black after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-black after:transition-all after:duration-300 hover:after:w-full"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}
