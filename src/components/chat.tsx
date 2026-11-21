"use client";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { z } from "zod";
import { ArrowDown, ArrowUp, Square, Sparkles, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Message } from "./message";

const errorSchema = z.object({ error: z.string().max(1000) });
const transport = new DefaultChatTransport({
  api: "/api/chat",
  fetch: async (input, init) => {
    const response = await fetch(input, init);
    if (!response.ok) {
      const parsed = errorSchema.safeParse(
        await response.json().catch(() => null),
      );
      throw new Error(
        parsed.success
          ? parsed.data.error
          : "The request failed. Please retry shortly.",
      );
    }
    return response;
  },
});
export function Chat() {
  const {
    messages,
    sendMessage,
    status,
    stop,
    error,
    regenerate,
    setMessages,
    clearError,
  } = useChat({ transport });
  const [input, setInput] = useState("");
  const [atBottom, setAtBottom] = useState(true);
  const [notice, setNotice] = useState("");
  const list = useRef<HTMLDivElement>(null);
  const pending = status === "submitted" || status === "streaming";
  const busy = useRef(false);
  const latest = messages.at(-1);
  // The stream can open before its first visible text/tool part arrives.
  const thinking = pending && (latest?.role !== "assistant" || !latest.parts.some(
    (part) => (part.type === "text" && part.text.trim().length > 0) ||
      part.type === "tool-qualifyLead" || part.type === "dynamic-tool",
  ));
  const jump = () => {
    if (list.current) list.current.scrollTop = list.current.scrollHeight;
    setAtBottom(true);
  };
  useEffect(() => {
    if (atBottom && list.current)
      list.current.scrollTop = list.current.scrollHeight;
  }, [messages, status, atBottom]);
  useEffect(() => {
    if (!pending) busy.current = false;
  }, [pending, error]);
  const send = () => {
    if (!input.trim() || pending || busy.current) return;
    if (messages.length >= 20) {
      setNotice(
        "This conversation has reached its limit. Start a new conversation to continue.",
      );
      return;
    }
    busy.current = true;
    clearError();
    setNotice("");
    setAtBottom(true);
    void sendMessage({ text: input.trim() }).finally(() => {
      busy.current = false;
    });
    setInput("");
  };
  return (
    <section className="chat-panel" aria-label="Project discovery conversation">
      <header className="chat-header">
        <div className="flex items-center gap-3">
          <div className="assistant-avatar">
            <Sparkles size={20} />
          </div>
          <div>
            <h2>Let’s find the right fit.</h2>
            <p>Tell us about the project you have in mind.</p>
          </div>
        </div>
        <button
          className="icon-button"
          aria-label="Start a new conversation"
          disabled={pending || messages.length === 0}
          onClick={() => {
            setMessages([]);
            clearError();
            setNotice("");
            setInput("");
          }}
        >
          <RotateCcw size={17} />
        </button>
      </header>
      <div
        ref={list}
        className="message-list"
        role="log"
        aria-label="Conversation"
        aria-live="polite"
        aria-relevant="additions text"
        onScroll={() => {
          const el = list.current;
          if (el)
            setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 70);
        }}
      >
        {messages.length === 0 && (
          <div className="chat-empty">
            <div className="empty-orbit">
              <Sparkles size={30} />
            </div>
            <h3>
              A good project starts
              <br />
              with a good conversation.
            </h3>
            <p>
              Share a little about your business. We’ll help clarify your needs
              and suggest a next step.
            </p>
            <button
              className="suggestion"
              onClick={() =>
                setInput(
                  "I’m exploring a new website for my business. Where should I start?",
                )
              }
            >
              I’m exploring a new website <ArrowUp size={15} />
            </button>
            <button
              className="suggestion"
              onClick={() =>
                setInput(
                  "My company needs a web application. Can you help scope it?",
                )
              }
            >
              I need a web application <ArrowUp size={15} />
            </button>
          </div>
        )}
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        {thinking && (
          <p className="thinking" role="status">
            <span className="pulse" /> Thinking about your project…
          </p>
        )}
      </div>
      <div className="sr-only" role="status" aria-live="polite">
        {thinking
          ? "Assistant is thinking."
          : status === "streaming"
            ? "Assistant is responding. Stop generation is available."
            : messages.length
              ? "Response finished. Review the conversation above."
              : "Ready for your first message."}
      </div>
      {!atBottom && messages.length > 0 && (
        <button className="jump-button" onClick={jump}>
          <ArrowDown size={14} /> Jump to latest
        </button>
      )}
      {error && (
        <div className="error-box" role="alert" aria-label="Conversation error">
          <p>
            {error.message || "The response was interrupted. Please retry."}
          </p>
          <button
            disabled={pending}
            onClick={() => {
              if (busy.current) return;
              busy.current = true;
              clearError();
              void regenerate().finally(() => {
                busy.current = false;
              });
            }}
          >
            Retry last response
          </button>
        </div>
      )}
      {notice && (
        <p role="status" className="error-box">
          {notice}
        </p>
      )}
      <form
        className="composer"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <label className="sr-only" htmlFor="chat-input">
          Describe your project
        </label>
        <textarea
          id="chat-input"
          rows={2}
          placeholder="Tell us a little about your project…"
          value={input}
          maxLength={2000}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              send();
            }
          }}
        />
        <div className="composer-footer">
          <span>Keep private or sensitive details out of chat.</span>
          {pending ? (
            <button
              type="button"
              className="send-button"
              aria-label="Stop generation"
              onClick={() => {
                void stop();
              }}
            >
              <Square size={16} />
            </button>
          ) : (
            <button
              type="submit"
              className="send-button"
              disabled={!input.trim()}
              aria-label="Send message"
            >
              <ArrowUp size={20} />
            </button>
          )}
        </div>
      </form>
      <p className="chat-fineprint">
        AI-assisted discovery · Final decisions are made by a person.
      </p>
    </section>
  );
}
