"use client";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

// AI-assisted React practice; no component-library imports.
export function HandDialog() {
  const [open, setOpen] = useState(false);
  const heading = useId();
  const inputId = useId();
  const overlay = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const background = Array.from(document.body.children)
      .filter((node): node is HTMLElement => node instanceof HTMLElement && node !== overlay.current)
      .map((node) => ({ node, inert: node.getAttribute("inert") }));
    background.forEach(({ node }) => node.setAttribute("inert", ""));
    const focusFirst = () => panel.current?.querySelector<HTMLInputElement>("input")?.focus();
    focusFirst();
    const containFocus = (event: FocusEvent) => {
      if (!panel.current?.contains(event.target as Node)) focusFirst();
    };
    document.addEventListener("focusin", containFocus);
    const handle = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const nodes = Array.from(panel.current?.querySelectorAll<HTMLElement>(
        'button, input, select, textarea, a[href], [tabindex]',
      ) ?? []).filter((node) => node.tabIndex >= 0 && !node.matches(":disabled") && !node.closest("[hidden], [inert]"));
      if (!nodes?.length) return;
      const first = nodes[0],
        last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handle, true);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", handle, true);
      document.removeEventListener("focusin", containFocus);
      background.forEach(({ node, inert }) => {
        if (inert === null) node.removeAttribute("inert");
        else node.setAttribute("inert", inert);
      });
      trigger.current?.focus();
    };
  }, [open]);
  return (
    <>
      <button type="button" ref={trigger} onClick={() => setOpen(true)}>
        Open custom dialog
      </button>
      {open && createPortal(
        <div
          ref={overlay}
          className="modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div
            className="modal-box"
            role="dialog"
            aria-modal="true"
            aria-labelledby={heading}
            ref={panel}
          >
            <h2 id={heading}>Name your workspace</h2>
            <label htmlFor={inputId}>Workspace name</label>
            <input id={inputId} />
            <button type="button" onClick={() => setOpen(false)}>Cancel</button>
            <button type="button" onClick={() => setOpen(false)}>Done</button>
          </div>
        </div>, document.body
      )}
    </>
  );
}
export function HandTabs() {
  const [active, setActive] = useState(0);
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const names = ["Overview", "Scoring", "Privacy"];
  return (
    <>
      <div role="tablist" aria-label="Project information" className="tab-list">
        {names.map((name, index) => (
          <button
            key={name}
            type="button"
            role="tab"
            id={`${id}-tab-${index}`}
            aria-selected={active === index}
            aria-controls={`${id}-panel-${index}`}
            tabIndex={active === index ? 0 : -1}
            ref={(el) => {
              refs.current[index] = el;
            }}
            onClick={() => setActive(index)}
            onKeyDown={(event) => {
              let next = index;
              if (event.key === "ArrowRight") next = (index + 1) % 3;
              else if (event.key === "ArrowLeft") next = (index + 2) % 3;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End") next = 2;
              else return;
              event.preventDefault();
              setActive(next);
              refs.current[next]?.focus();
            }}
          >
            {name}
          </button>
        ))}
      </div>
      {names.map((name, index) => (
        <div
          key={name}
          role="tabpanel"
          id={`${id}-panel-${index}`}
          aria-labelledby={`${id}-tab-${index}`}
          hidden={active !== index}
          tabIndex={0}
        >
          {
            [
              "A guided discovery conversation for agency clients.",
              "A fixed rubric turns supplied facts into an explainable score.",
              "Conversations stay in the current tab and clear on refresh.",
            ][index]
          }
        </div>
      ))}
    </>
  );
}
export function HandDisclosure() {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((current) => !current)}
      >
        How is a lead scored?
      </button>
      <div id={id} hidden={!open}>
        <p>
          Budget, timeline, decision authority, and a project need contribute to
          a score of up to 100.
        </p>
      </div>
    </>
  );
}
