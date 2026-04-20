export interface PublicChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

export interface PublicChatSource {
  title: string;
  url: string;
  type: string;
  snippet?: string;
}

export interface PublicChatRelatedCase {
  id: number;
  title: string;
  url: string;
}

export interface PublicChatResponse {
  answer_text: string;
  sources: PublicChatSource[];
  related_cases: PublicChatRelatedCase[];
  follow_up_questions: string[];
}
