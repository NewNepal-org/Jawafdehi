import axios, { AxiosError, AxiosInstance } from "axios";
import type { PublicChatHistoryItem, PublicChatResponse } from "@/types/public-chat";

const PUBLIC_CHAT_API_BASE_URL =
  import.meta.env.VITE_JDS_API_BASE_URL || "https://portal.jawafdehi.org/api";

const client: AxiosInstance = axios.create({
  baseURL: PUBLIC_CHAT_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

const PUBLIC_CHAT_SESSION_KEY = "jawafdehi_public_chat_session_id";

function createSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `public-chat-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getPublicChatSessionId() {
  if (typeof window === "undefined") {
    return "";
  }
  const existing = window.sessionStorage.getItem(PUBLIC_CHAT_SESSION_KEY);
  if (existing) {
    return existing;
  }
  const next = createSessionId();
  window.sessionStorage.setItem(PUBLIC_CHAT_SESSION_KEY, next);
  return next;
}

export function resetPublicChatSession() {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.removeItem(PUBLIC_CHAT_SESSION_KEY);
}

export class PublicChatApiError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "PublicChatApiError";
    this.statusCode = statusCode;
  }
}

function handleError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      detail?: string;
      error?: string;
      errors?: Record<string, string[]>;
      limit?: number;
      window_seconds?: number;
    }>;
    const validationMessage = axiosError.response?.data?.errors
      ? Object.values(axiosError.response.data.errors).flat().join(" ")
      : undefined;
    throw new PublicChatApiError(
      axiosError.response?.data?.detail ||
        axiosError.response?.data?.error ||
        validationMessage ||
        axiosError.message,
      axiosError.response?.status,
    );
  }

  throw new PublicChatApiError(
    error instanceof Error ? error.message : "Unexpected public chat error",
  );
}

function quotaResponseFromError(
  error: unknown,
  sessionId: string,
): PublicChatResponse | null {
  if (!axios.isAxiosError(error) || error.response?.status !== 429) {
    return null;
  }

  const data = error.response.data as { detail?: string; error?: string };
  if (data?.error !== "quota_exceeded") {
    return null;
  }

  return {
    answer_text: data.detail || "Public chat query limit reached.",
    session_id: sessionId,
    sources: [],
    related_cases: [],
    follow_up_questions: [],
  };
}

export async function askPublicQuestion(input: {
  question: string;
  language?: string;
  sessionId?: string;
  history?: PublicChatHistoryItem[];
}): Promise<PublicChatResponse> {
  const sessionId = input.sessionId || getPublicChatSessionId();
  try {
    const response = await client.post<PublicChatResponse>("/chat/public/", {
      question: input.question,
      session_id: sessionId,
      history: input.history || [],
      language: input.language || "auto",
    });
    return response.data;
  } catch (error) {
    const quotaResponse = quotaResponseFromError(error, sessionId);
    if (quotaResponse) {
      return quotaResponse;
    }
    handleError(error);
  }
}

type PublicChatStreamFinal = {
  status: number;
  data: PublicChatResponse | { detail?: string; error?: string };
};

function parseSseEvents(buffer: string) {
  const rawEvents = buffer.split("\n\n");
  const remainder = rawEvents.pop() ?? "";
  const parsed = rawEvents
    .map((rawEvent) => {
      const lines = rawEvent.split("\n");
      const event = lines
        .find((line) => line.startsWith("event:"))
        ?.replace("event:", "")
        .trim();
      const data = lines
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.replace("data:", "").trim())
        .join("\n");
      return { event, data };
    })
    .filter((item) => item.event && item.data);
  return { parsed, remainder };
}

export async function askPublicQuestionStream(input: {
  question: string;
  language?: string;
  sessionId?: string;
  history?: PublicChatHistoryItem[];
}): Promise<PublicChatResponse> {
  const sessionId = input.sessionId || getPublicChatSessionId();
  let response: Response;
  try {
    response = await fetch(`${PUBLIC_CHAT_API_BASE_URL}/chat/public/stream/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: input.question,
        session_id: sessionId,
        history: input.history || [],
        language: input.language || "auto",
      }),
    });
  } catch {
    return askPublicQuestion(input);
  }

  if (!response.ok || !response.body) {
    return askPublicQuestion(input);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });
    const { parsed, remainder } = parseSseEvents(buffer);
    buffer = remainder;

    for (const item of parsed) {
      if (item.event !== "final") {
        continue;
      }
      const finalPayload = JSON.parse(item.data) as PublicChatStreamFinal;
      if (finalPayload.status === 429) {
        return {
          answer_text:
            "detail" in finalPayload.data && finalPayload.data.detail
              ? finalPayload.data.detail
              : "Public chat query limit reached.",
          session_id: sessionId,
          sources: [],
          related_cases: [],
          follow_up_questions: [],
        };
      }
      if (finalPayload.status >= 400) {
        const detail =
          "detail" in finalPayload.data
            ? finalPayload.data.detail || finalPayload.data.error
            : undefined;
        throw new PublicChatApiError(detail || "Public chat request failed", finalPayload.status);
      }
      return finalPayload.data as PublicChatResponse;
    }

    if (done) {
      break;
    }
  }

  throw new PublicChatApiError("Public chat stream ended before a final response.");
}
