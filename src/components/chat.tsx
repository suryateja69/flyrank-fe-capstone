"use client";
import { useChat } from "@ai-sdk/react";
import type { LeadMessage } from "@/lib/tools";
import { ArrowDown, ArrowUp, Square, Sparkles, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Message } from "./message";

import { transport, chatErrorMessage, hasReadableContent } from "@/lib/chat-transport";

export function Chat() {
  const [recovery, setRecovery] = useState("");
  const [slow, setSlow] = useState(false);
  const {
    messages,
    sendMessage,
    status,
    stop,
    error,
    regenerate,
    setMessages,
    clearError,
  } = useChat<LeadMessage>({
    transport,
    onFinish: ({ message, isAbort, isError }) => {
      if (!isAbort && !isError && !hasReadableContent(message)) {
        setRecovery("The assistant returned no usable response. Retry the last response, or add more project details.");
      }
    },
  });
  const [input, setInput] = useState("");
  const [atBottom, setAtBottom] = useState(true);
  const [notice, setNotice] = useState("");
  const list = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const pending = status === "submitted" || status === "streaming";
  const busy = useRef(false);
  const latest = messages.at(-1);
  const failure = error ? chatErrorMessage(error) : recovery;
  // The stream can open before its first visible text/tool part arrives.
  const thinking = pending && (latest?.role !== "assistant" || !latest.parts.some(
    (part) => (part.type === "text" && part.text.trim().length > 0) ||
      part.type === "tool-qualifyLead" || part.type === "dynamic-tool",
  ));
  useEffect(() => {
    if (!pending) { setSlow(false); return; }
    const timer = window.setTimeout(() => setSlow(true), 8000);
    return () => window.clearTimeout(timer);
  }, [pending]);
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
    setRecovery("");
    setAtBottom(true);
    void sendMessage({ text: input.trim() }).catch(() => {
      setRecovery("The request could not finish. Retry the last response.");
    }).finally(() => {
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
            setRecovery("");
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
          <Message key={message.id} message={message} streaming={pending && latest?.id === message.id} />
        ))}
        {thinking && (
          <div className="reply-skeleton" role="status">
            <p className="thinking"><span className="pulse" /> Thinking about your project…</p>
            <div className="skeleton" aria-hidden="true" />
            <div className="skeleton" aria-hidden="true" />
          </div>
        )}
      </div>
      {slow && pending && <p className="slow-notice" role="status">This is taking longer than usual. You can stop generation and try again; your conversation will stay here.</p>}
      <div className="sr-only" role="status" aria-live="polite">
        {failure
          ? "Response failed. Retry last response is available."
          : thinking
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
      {failure && (
        <div className="error-box" role="alert" aria-label="Conversation error">
          <strong>Response needs another try</strong>
          <p>{failure}</p>
          <p>Your messages and any partial response are still here. Retry only the last response.</p>
          <button
            disabled={pending}
            onClick={() => {
              if (busy.current) return;
              busy.current = true;
              clearError();
              setRecovery("");
              setAtBottom(true);
              void regenerate().catch(() => {
                setRecovery("The request could not finish. Retry the last response.");
              }).finally(() => {
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
          composer.current?.focus();
          send();
        }}
      >
        <label className="sr-only" htmlFor="chat-input">
          Describe your project
        </label>
        <textarea
          ref={composer}
          id="chat-input"
          rows={2}
          placeholder="Tell us a little about your project…"
          value={input}
          maxLength={2000}
          aria-describedby="composer-count"
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
          <span id="composer-count">{input.length}/2,000 · Keep private details out of chat.</span>
          {pending ? (
            <button
              type="button"
              className="send-button"
              aria-label="Stop generation"
              onClick={() => {
                composer.current?.focus();
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
