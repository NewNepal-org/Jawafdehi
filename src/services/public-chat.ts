import axios, { AxiosError, AxiosInstance } from "axios";
import type { PublicChatHistoryItem, PublicChatResponse } from "@/types/public-chat";

const PUBLIC_CHAT_API_BASE_URL =
  import.meta.env.VITE_JDS_API_BASE_URL || "https://portal.jawafdehi.org/api";

const client: AxiosInstance = axios.create({
  baseURL: PUBLIC_CHAT_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

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
    const axiosError = error as AxiosError<{ detail?: string; error?: string }>;
    throw new PublicChatApiError(
      axiosError.response?.data?.detail ||
        axiosError.response?.data?.error ||
        axiosError.message,
      axiosError.response?.status,
    );
  }

  throw new PublicChatApiError(
    error instanceof Error ? error.message : "Unexpected public chat error",
  );
}

export async function askPublicQuestion(input: {
  question: string;
  language?: string;
  sessionId?: string;
  history?: PublicChatHistoryItem[];
}): Promise<PublicChatResponse> {
  try {
    const response = await client.post<PublicChatResponse>("/chat/public/", {
      question: input.question,
      session_id: input.sessionId || "",
      history: input.history || [],
      language: input.language || "auto",
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
}
