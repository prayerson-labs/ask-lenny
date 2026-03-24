"use client";

import { useEffect, useRef, useState } from "react";
import quotes from "./quotes";

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

const SUGGESTIONS = [
  "What makes a great PM?",
  "How to find product-market fit",
  "Growth strategies",
  "Best career advice",
];

function citationLink(citation: Citation) {
  if (citation.episode_url) {
    return citation.episode_url;
  }
  if (citation.episode_id) {
    return `${EPISODE_BASE}${encodeURIComponent(citation.episode_id)}`;
  }
  return "#";
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQuotes, setShowQuotes] = useState(false);
  const [randomQuote, setRandomQuote] = useState(quotes[0]);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setRandomQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = "auto";
    inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
  }, [input]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

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

      if (!response.ok || data.error) {
        const assistantMessage: AssistantMessage = {
          role: "assistant",
          content: {
            kind: "no_results",
            message:
              "Something went wrong. Please try again in a moment.",
          },
        };
        setMessages((prev) => [...prev, assistantMessage]);
        return;
      }

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
    } catch {
      const assistantMessage: AssistantMessage = {
        role: "assistant",
        content: {
          kind: "no_results",
          message:
            "We're having trouble connecting right now. Please try again.",
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

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <header className="shrink-0 bg-background">
        <div className="mx-auto max-w-[760px] px-5 pt-[env(safe-area-inset-top)] sm:px-8">
          <div className="flex items-center justify-between py-3 sm:py-4">
            <button
              type="button"
              onClick={() => {
                setMessages([]);
                setInput("");
                setRandomQuote(
                  quotes[Math.floor(Math.random() * quotes.length)]
                );
              }}
              className="min-w-0 cursor-pointer text-left"
            >
              <h1 className="font-title text-[19px] font-normal tracking-[-0.2px] text-[#1C1510] sm:text-[20px]">
                Ask Lenny
              </h1>
              <p className="mt-[2px] text-[11px] font-light tracking-wide text-[#A89880] sm:text-[12px]">
                Insights from Lenny&#39;s Podcast
              </p>
            </button>
            <div className="group relative flex shrink-0">
              <label className="flex cursor-pointer items-center gap-2.5 select-none text-[12px] font-medium text-[#A89880]">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={showQuotes}
                  onChange={(event) => setShowQuotes(event.target.checked)}
                />
                <span
                  className={`relative flex h-[22px] w-10 items-center rounded-full transition-colors duration-200 ${
                    showQuotes ? "bg-accent" : "bg-border"
                  }`}
                >
                  <span
                    className={`absolute left-0.5 h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      showQuotes ? "translate-x-[18px]" : "translate-x-0"
                    }`}
                  />
                </span>
                Quotes
              </label>
              <div
                role="tooltip"
                className="pointer-events-none absolute top-full right-0 z-50 mt-2.5 translate-y-1 opacity-0 transition-[opacity,transform] duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
              >
                <div className="relative whitespace-nowrap rounded-[10px] border border-[#E0D4C0] bg-white px-3.5 py-2.5 text-[11px] leading-[1.5] text-[#4A3728] shadow-[0_2px_12px_rgba(100,60,20,0.08)]">
                  Show direct quotes from Lenny&#39;s Podcast in responses
                  <div className="absolute -top-[5px] right-5 h-[9px] w-[9px] rotate-45 border-t border-l border-[#E0D4C0] bg-white" />
                </div>
              </div>
            </div>
          </div>
          <div
            className="h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, #D4C8B4 15%, #D4C8B4 85%, transparent)",
            }}
          />
        </div>
      </header>

      <main className="chat-scroll flex flex-1 flex-col overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[760px] flex-1 flex-col px-5 sm:px-8">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-start px-4 pt-6 text-center sm:justify-center sm:pt-0">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 sm:mb-6 sm:h-14 sm:w-14 sm:rounded-2xl">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6 text-accent sm:h-7 sm:w-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h2 className="font-display text-[20px] tracking-tight sm:text-[30px]">
                What would you like to know?
              </h2>
              <p className="mt-2 max-w-md text-[13px] leading-relaxed text-[#A89880] sm:mt-4 sm:text-base">
                Search insights from Lenny&#39;s Podcast. Get cited answers
                from real conversations.
              </p>

              <div className="relative mx-auto mt-5 w-full max-w-[500px] rounded-[12px] border border-[#EAE3D8] bg-white py-3 pl-4 pr-6 text-left shadow-[0_1px_3px_rgba(100,60,20,0.03)] sm:mt-8 sm:rounded-[14px] sm:border-[#E0D4C0] sm:px-5 sm:py-4 sm:shadow-[0_1px_0_#E8DFD0,0_4px_20px_rgba(100,60,20,0.06)]">
                <span className="absolute top-2 left-3 font-display text-[32px] leading-[0.6] text-[#F0E8DC] select-none sm:top-3 sm:left-4 sm:text-[48px] sm:text-[#EAD9C4]">
                  &ldquo;
                </span>
                <p className="pl-5 text-[12px] italic leading-[1.6] text-[#4A3728] sm:text-[13px] sm:leading-[1.7]">
                  {randomQuote.text}
                </p>
                <div className="mt-2.5 flex flex-col gap-[3px] pl-5 text-[10px] text-[#B8A898] sm:mt-3 sm:flex-row sm:items-center sm:gap-1.5 sm:text-[11px]">
                  <span className="truncate">{randomQuote.guest}</span>
                  <span className="hidden h-[3px] w-[3px] shrink-0 rounded-full bg-[#C4A882] sm:block" />
                  <span className="sm:truncate">{randomQuote.episode}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-1.5 sm:mt-7 sm:gap-2.5">
                {SUGGESTIONS.map((text) => (
                  <button
                    key={text}
                    type="button"
                    onClick={() => {
                      setInput(text);
                      inputRef.current?.focus();
                    }}
                    className="cursor-pointer rounded-[20px] border border-[#DDD4C4] bg-white/70 px-[11px] py-[5px] text-[11px] text-[#A89880] transition-colors duration-150 hover:border-[#C4A882] hover:bg-white hover:text-[#C4621E] sm:px-[14px] sm:py-[6px] sm:text-[12px]"
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5 py-5 sm:gap-8 sm:py-8">
              {messages.map((message, index) => {
                if (message.role === "user") {
                  return (
                    <div key={index} className="flex justify-end">
                      <div className="max-w-[85%] break-words rounded-t-[20px] rounded-bl-[20px] rounded-br-[6px] bg-accent px-4 py-2.5 text-[13px] leading-[1.6] text-white shadow-[0_1px_2px_rgba(196,98,30,0.15)] sm:max-w-[72%] sm:px-5 sm:py-3 sm:text-[14px] sm:leading-[1.65]">
                        {message.content}
                      </div>
                    </div>
                  );
                }

                if (message.content.kind === "no_results") {
                  return (
                    <div key={index} className="max-w-[90%] sm:max-w-[82%]">
                      <p className="text-[13px] leading-[1.65] text-secondary sm:text-[14px] sm:leading-[1.7]">
                        {message.content.message}
                      </p>
                    </div>
                  );
                }

                return (
                  <div
                    key={index}
                    className="max-w-[90%] break-words sm:max-w-[82%]"
                  >
                    {message.content.paragraphs.map((paragraph, pIndex) => (
                      <div key={pIndex} className="mb-5 last:mb-0 sm:mb-6">
                        <p className="text-[14px] leading-[1.7] text-foreground sm:text-[15px] sm:leading-[1.75]">
                          {paragraph.text}
                        </p>
                        {paragraph.citations.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {paragraph.citations.map((citation, cIndex) => (
                              <a
                                key={`${pIndex}-${cIndex}`}
                                href={citationLink(citation)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex max-w-full break-words rounded-full bg-accent/[0.07] px-2.5 py-0.5 text-[11px] font-medium text-secondary transition-colors hover:bg-accent/[0.14] hover:text-accent"
                              >
                                {citation.guest} &mdash;{" "}
                                {citation.episode_title}
                              </a>
                            ))}
                          </div>
                        )}
                        {showQuotes && paragraph.quotes.length > 0 ? (
                          <div className="mt-4 border-l-2 border-accent/20 pl-4 sm:mt-5 sm:pl-5">
                            {paragraph.quotes.map((quote, qIndex) => (
                              <p
                                key={`${pIndex}-${qIndex}`}
                                className="mb-2.5 break-words text-[13px] italic leading-[1.65] text-secondary last:mb-0 sm:mb-3 sm:text-[14px] sm:leading-[1.7]"
                              >
                                &ldquo;{quote.quote}&rdquo;
                                <span className="ml-1.5 text-[12px] not-italic text-muted">
                                  — {quote.guest}
                                </span>
                              </p>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                );
              })}
              {isLoading ? (
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent/50 animate-[typing-dot_1s_ease-in-out_infinite]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-accent/50 animate-[typing-dot_1s_ease-in-out_infinite_0.15s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-accent/50 animate-[typing-dot_1s_ease-in-out_infinite_0.3s]" />
                </div>
              ) : null}
              <div ref={endRef} />
            </div>
          )}
        </div>
      </main>

      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-[#DDD4C4]/50 bg-background pb-[env(safe-area-inset-bottom)]"
      >
        <div className="mx-auto max-w-[760px] px-5 sm:px-8">
          <div className="flex flex-col gap-1.5 py-2.5 sm:gap-2.5 sm:py-4">
            <div className="rounded-[14px] border border-[#DDD4C4] bg-white transition-[border-color,box-shadow] duration-200 focus-within:border-[#C4A882] focus-within:shadow-[0_0_0_3px_rgba(196,98,30,0.07)]">
              <div className="flex items-start">
                <div className="chat-input-scroll max-h-[160px] flex-1 overflow-y-auto px-[14px] sm:max-h-[200px] sm:px-[18px]">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder="Ask about product, growth, strategy…"
                    className="w-full resize-none border-0 bg-transparent py-[10px] text-[13px] leading-[1.6] text-foreground placeholder:text-[#C8BAA8] focus:outline-none sm:py-[14px] sm:text-[14px] sm:leading-[1.65]"
                  />
                </div>
                <div className="w-[14px] shrink-0" />
              </div>
              <div className="flex items-center justify-end px-[10px] py-[6px] sm:justify-between sm:px-[12px] sm:py-[8px]">
                <div className="hidden items-center gap-3 sm:flex">
                  <span className="text-[11px] text-[#C8BAA8]">↵ send</span>
                  <span className="text-[11px] text-[#C8BAA8]">⇧↵ new line</span>
                </div>
                <div className="flex items-center gap-2">
                  {input.length > 0 && (
                    <span className="text-[11px] text-[#C8BAA8]">
                      {input.length}
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex h-[32px] w-[32px] shrink-0 cursor-pointer items-center justify-center rounded-[8px] bg-[#C4621E] text-white transition-colors duration-150 hover:bg-[#A8521A] active:scale-95 disabled:opacity-30 disabled:active:scale-100"
                    aria-label="Send message"
                    title="Send"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m12 5 0 14" />
                      <path d="m6 11 6-6 6 6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1 text-center text-[11px] text-[#B8A898]">
              <span>A product by Prayerson Christian</span>
              <span className="px-0.5">&middot;</span>
              <a
                href="https://x.com/iamprayerson"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#B8A898] underline-offset-2 transition-colors hover:text-accent hover:underline"
              >
                X
              </a>
              <span className="px-0.5">&middot;</span>
              <a
                href="https://www.linkedin.com/in/prayersonchristian"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#B8A898] underline-offset-2 transition-colors hover:text-accent hover:underline"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
