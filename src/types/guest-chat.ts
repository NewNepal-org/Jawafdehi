import type { CaseDetail } from "@/types/jds";

export interface GuestEntityMatch {
  jawaf_entity_id: number;
  nes_id: string;
  display_name: string;
  match_reason: string;
}

export interface GuestAnswerModel {
  kind: "entity_match";
  text: string;
  confidence: "high" | "medium" | "low";
}

export interface GuestCaseResultItem {
  id: number;
  title: string;
  state: CaseDetail["state"];
  case_type: CaseDetail["case_type"];
  short_description: string;
  tags: string[];
  matched_entity_names: string[];
  caseItem: CaseDetail;
  matchReason: string;
  matchedEntityIds: number[];
  matchedEntityNames: string[];
}

export interface GuestAskResponse {
  query: string;
  answer: GuestAnswerModel;
  entity_matches: GuestEntityMatch[];
  case_results: GuestCaseResultItem[];
  suggested_followups: string[];
  answerOrigin: "public-read-adapter";
}

export interface GuestCaseChatCitation {
  sourceId: number;
  sourceTitle: string;
  reason?: string;
}

export interface GuestCaseChatResponse {
  caseId: number;
  question: string;
  answer: string;
  grounded: boolean;
  citations: GuestCaseChatCitation[];
  followups: string[];
  origin: "public-read-adapter";
}

export interface GuestCaseChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  citations?: GuestCaseChatCitation[];
  origin?: "public-read-adapter";
  isError?: boolean;
  isLoading?: boolean;
}

export type GuestAnswerResponse = GuestAskResponse;
