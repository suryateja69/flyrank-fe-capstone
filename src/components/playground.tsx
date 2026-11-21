"use client";
import { useEffect, useRef, useState } from "react";
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

export { HandDialog, HandTabs, HandDisclosure } from "../../playground/handmade";

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
