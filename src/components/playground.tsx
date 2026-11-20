"use client";
import { useEffect, useId, useRef, useState } from "react";
import {
  Dialog as Root,
  DialogTrigger as Trigger,
  DialogContent as Content,
  DialogTitle as Title,
  DialogDescription as Description,
  DialogClose as Close,
} from "./ui/dialog";
const Dialog = { Root, Trigger, Content, Title, Description, Close };
import {
  Tabs as TabsRoot,
  TabsList as List,
  TabsTrigger as TabTrigger,
  TabsContent as TabContent,
} from "./ui/tabs";
const Tabs = { Root: TabsRoot, List, Trigger: TabTrigger, Content: TabContent };

// This dialog is intentionally authored without a component library for FE-05.
export function HandDialog() {
  const [open, setOpen] = useState(false);
  const heading = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLInputElement>("input")?.focus();
    const handle = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const nodes = panel.current?.querySelectorAll<HTMLElement>(
        ":is(button,input,a[href]):not(:disabled)",
      );
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
      trigger.current?.focus();
    };
  }, [open]);
  return (
    <>
      <button ref={trigger} onClick={() => setOpen(true)}>
        Open custom dialog
      </button>
      {open && (
        <div
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
            <label htmlFor="dialog-name">Workspace name</label>
            <input id="dialog-name" />
            <button onClick={() => setOpen(false)}>Cancel</button>
            <button onClick={() => setOpen(false)}>Done</button>
          </div>
        </div>
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
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
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
export function ReferenceComponents() {
  return (
    <>
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <button>Open Radix reference dialog</button>
        </Dialog.Trigger>
        <Dialog.Content
          className="modal-box"
          style={{
            position: "fixed",
            zIndex: 60,
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
          }}
        >
          <Dialog.Title>Reference dialog</Dialog.Title>
          <Dialog.Description>
            Radix supplies the focus scope, dismissal, and accessible
            relationships.
          </Dialog.Description>
          <Dialog.Close asChild>
            <button>Close reference</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>
      <Tabs.Root defaultValue="first">
        <Tabs.List aria-label="Reference tabs" className="tab-list">
          <Tabs.Trigger value="first">First reference</Tabs.Trigger>
          <Tabs.Trigger value="second">Second reference</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="first">Reference overview.</Tabs.Content>
        <Tabs.Content value="second">Reference details.</Tabs.Content>
      </Tabs.Root>
    </>
  );
}
export function MotionButton() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [fail, setFail] = useState(false);
  const busy = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return (
    <>
      <label className="flex gap-2 items-center mb-4">
        <input
          type="checkbox"
          checked={fail}
          onChange={(e) => setFail(e.target.checked)}
        />{" "}
        Simulate failure
      </label>
      <button
        className={`demo-button ${state}`}
        disabled={state === "loading"}
        aria-busy={state === "loading"}
        onClick={() => {
          if (busy.current) return;
          busy.current = true;
          setState("loading");
          timer.current = setTimeout(() => {
            setState(fail ? "error" : "success");
            busy.current = false;
          }, 750);
        }}
      >
        <span key={state} className="button-label">
          {state === "loading"
            ? "Saving…"
            : state === "success"
              ? "Saved successfully"
              : state === "error"
                ? "Save failed — retry"
                : "Save project"}
        </span>
      </button>
      <p role="status">
        {state === "error"
          ? "The demo failed deliberately. Click again to retry."
          : state === "success"
            ? "The simulated save finished."
            : state === "loading"
              ? "Waiting for the simulated response."
              : "Ready to save."}
      </p>
      <p>
        160 ms ease-out for hover/press keeps direct feedback quick. A 200 ms
        opacity/color transition softens asynchronous state changes. Reduced
        motion preserves text feedback.
      </p>
    </>
  );
}
