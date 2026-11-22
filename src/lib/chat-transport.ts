import { DefaultChatTransport } from "ai";
import type { LeadMessage } from "./tools";

export class ChatRequestError extends Error {
  constructor(public readonly status: number) {
    super(status === 429
      ? "Too many requests. Wait a minute before retrying the last response."
      : status === 413
        ? "This conversation is too long. Start a new conversation to continue."
        : status === 503
          ? "The AI service is temporarily unavailable. Please retry shortly."
          : status === 400
            ? "The request could not be processed. Try a shorter project description."
            : "The service could not complete the request. Please retry shortly.");
    this.name = "ChatRequestError";
  }
}

export const transport = new DefaultChatTransport<LeadMessage>({
  api: "/api/chat",
  fetch: async (input, init) => {
    const response = await fetch(input, init);
    // Do not render raw server bodies (including HTML errors or provider details).
    if (!response.ok) throw new ChatRequestError(response.status);
    return response;
  },
});

export function chatErrorMessage(error: Error): string {
  if (error instanceof ChatRequestError) return error.message;
  if (error instanceof TypeError || /network|fetch|connection|load failed/i.test(error.message))
    return "The connection was interrupted. Check your internet connection, then retry the last response.";
  return "The AI response was interrupted. Please retry the last response.";
}

export function hasReadableContent(message: LeadMessage): boolean {
  return message.parts.some(part =>
    (part.type === "text" && part.text.trim().length > 0) ||
    ((part.type === "tool-qualifyLead" || (part.type === "dynamic-tool" && part.toolName === "qualifyLead")) &&
      (part.state === "output-available" || part.state === "output-error")),
  );
}
