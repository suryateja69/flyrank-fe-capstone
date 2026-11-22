import type { LeadMessage } from "@/lib/tools";
import { ToolResult, isToolState } from "./tool-result";

export function Message({ message }: { message: LeadMessage }) {
  return (
    <article
      className={`message ${message.role}`}
      aria-label={
        message.role === "user" ? "Your message" : "Assistant message"
      }
    >
      <div className="message-author">
        {message.role === "user" ? "YOU" : "LEADDESK"}
      </div>
      {message.parts.map((part, index) => {
        if (part.type === "text")
          return (
            <p key={index} className="message-text">
              {part.text}
            </p>
          );
        if (
          part.type === "tool-qualifyLead" ||
          (part.type === "dynamic-tool" && part.toolName === "qualifyLead")
        ) {
          if (
            "state" in part &&
            isToolState(part.state)
          ) {
            return (
              <ToolResult
                key={index}
                state={part.state}
                input={"input" in part ? part.input : undefined}
                output={"output" in part ? part.output : undefined}
              />
            );
          }
        }
        return null;
      })}
    </article>
  );
}
