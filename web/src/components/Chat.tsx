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
  const [isMultiline, setIsMultiline] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!inputRef.current) return;
    const baseHeight = 48;
    const maxHeight = 180;

    if (input.length === 0) {
      inputRef.current.style.height = `${baseHeight}px`;
      inputRef.current.style.overflowY = "hidden";
      setIsMultiline(false);
      return;
    }

    inputRef.current.style.height = "auto";
    const nextHeight = Math.min(inputRef.current.scrollHeight, maxHeight);
    const clampedHeight = Math.max(baseHeight, nextHeight);
    inputRef.current.style.height = `${clampedHeight}px`;
    inputRef.current.style.overflowY =
      inputRef.current.scrollHeight > maxHeight ? "auto" : "hidden";
    setIsMultiline(inputRef.current.scrollHeight > baseHeight);
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
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex w-full max-w-[860px] items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-lg font-semibold sm:text-xl">Ask Lenny</h1>
            <p className="text-xs text-zinc-500 sm:text-sm">
              Ask the collective mind of Lenny’s Podcast
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-zinc-600 sm:text-sm">
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

      <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col gap-6 px-4 pb-32 pt-6 sm:px-6 md:max-w-[760px] lg:max-w-[800px]">
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-5 text-sm text-zinc-500 sm:p-6">
            Ask a question about Lenny’s Podcast and get cited answers.
          </div>
        ) : (
          messages.map((message, index) => {
            if (message.role === "user") {
              return (
                <div key={index} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl bg-zinc-900 px-4 py-3 text-sm text-white sm:max-w-[75%] sm:text-base">
                    {message.content}
                  </div>
                </div>
              );
            }

            if (message.content.kind === "no_results") {
              return (
                <div key={index} className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl bg-white px-4 py-3 text-sm text-zinc-700 shadow-sm sm:max-w-[75%] sm:text-base">
                    {message.content.message}
                  </div>
                </div>
              );
            }

            return (
              <div key={index} className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl bg-white px-4 py-4 text-sm text-zinc-800 shadow-sm sm:max-w-[75%] sm:text-base">
                  {message.content.paragraphs.map((paragraph, pIndex) => (
                    <div key={pIndex} className="mb-4 last:mb-0">
                      <p className="leading-6 sm:leading-7">{paragraph.text}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-zinc-500 sm:text-xs">
                        {paragraph.citations.map((citation, cIndex) => (
                          <a
                            key={`${pIndex}-${cIndex}`}
                            href={citationLink(citation)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="break-words rounded-full bg-zinc-100 px-2 py-1 transition hover:bg-zinc-200"
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
            <div className="relative overflow-hidden rounded-2xl border border-zinc-100 bg-white px-4 py-3 text-sm text-zinc-600 shadow-sm sm:text-base">
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
        className="sticky bottom-0 z-20 border-t border-zinc-200 bg-white pb-[env(safe-area-inset-bottom)]"
      >
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-3 px-3 py-4 sm:px-6 md:max-w-[760px] lg:max-w-[800px]">
          <div className="flex items-center gap-2">
            <div
              className={`flex w-full flex-1 overflow-hidden border border-zinc-300 bg-white transition-[border-radius] duration-200 ease-in-out focus-within:border-zinc-400 ${
                isMultiline
                  ? "rounded-[32px] sm:rounded-[30px]"
                  : "rounded-full"
              }`}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask about product, growth…"
                className="chat-input premium-scrollbar box-border h-12 max-h-[180px] min-h-12 w-full resize-none overflow-x-hidden border-0 bg-transparent bg-clip-padding px-4 py-3 pr-14 text-[15px] leading-5 text-zinc-900 focus:outline-none sm:px-5 sm:text-base sm:pr-14"
                style={{ scrollbarGutter: "stable both-edges" }}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex h-12 w-12 cursor-pointer items-center justify-center self-end rounded-full bg-zinc-900 text-white transition hover:bg-zinc-800 hover:shadow-[0_0_12px_rgba(0,0,0,0.25)] disabled:opacity-60"
              aria-label="Send message"
              title="Send"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
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
          <div className="flex flex-wrap items-center justify-center gap-1 text-center text-[11px] text-zinc-500 sm:text-xs">
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
