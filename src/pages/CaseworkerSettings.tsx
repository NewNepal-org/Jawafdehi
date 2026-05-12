
import { useEffect, useState } from "react";
import type React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Bot, MessageSquare, Server, ShieldCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useCaseworkerAuth } from "@/context/CaseworkerAuthContext";
import { listKnowledgeCollections, listLLMProviders, listPrompts, listSkills } from "@/services/caseworker-api";
import type { KnowledgeCollection, LLMProvider, Prompt, Skill } from "@/types/caseworker";
import { cn } from "@/lib/utils";
import { KnowledgeTab } from "./caseworker-settings/tabs/KnowledgeTab";
import { LLMTab } from "./caseworker-settings/tabs/LLMTab";
import { MCPTab } from "./caseworker-settings/tabs/MCPTab";
import { PromptsTab } from "./caseworker-settings/tabs/PromptsTab";
import { PublicChatTab } from "./caseworker-settings/tabs/PublicChatTab";
import { rows, type Tab } from "./caseworker-settings/utils";

export default function CaseworkerSettings() {
  const { isAdmin } = useCaseworkerAuth();
  const [tab, setTab] = useState<Tab>("prompts");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [knowledgeCollections, setKnowledgeCollections] = useState<KnowledgeCollection[]>([]);

  useEffect(() => {
    Promise.all([listSkills(), listPrompts(), listLLMProviders(), listKnowledgeCollections()]).then(([skillsData, promptsData, providersData, knowledgeData]) => {
      setSkills(rows(skillsData));
      setPrompts(rows(promptsData));
      setProviders(providersData.results ?? []);
      setKnowledgeCollections(rows(knowledgeData));
    });
  }, []);

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/20">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Access denied. Administrator role required.</p>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "prompts", label: "Prompts", description: "Instruction templates", icon: MessageSquare },
    // Skills tab is temporarily hidden.
    // { id: "skills", label: "Skills", description: "RAG routing rules", icon: Sparkles },
    { id: "knowledge", label: "Knowledge", description: "Collections and sources", icon: BookOpen },
    { id: "public-chat", label: "Public Chat", description: "Guest chat limits", icon: ShieldCheck },
    { id: "llm", label: "LLM Providers", description: "Model connections", icon: Bot },
    { id: "mcp", label: "MCP Servers", description: "Tool servers", icon: Server },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="container mx-auto max-w-6xl flex-1 px-4 py-7 lg:px-6">
        <div className="mb-7 flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild className="mt-0.5 h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground">
            <Link to="/caseworker/dashboard" aria-label="Back to dashboard"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-foreground">Caseworker Settings</h1>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">Configure the assistant workspace, public chat guardrails, retrieval knowledge, providers, and tool servers.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-1.5">
              {tabs.map((item) => {
                const Icon = item.icon;
                const selected = tab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      selected ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-white hover:text-foreground",
                    )}
                  >
                    <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md", selected ? "bg-white/15" : "bg-white")}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className={cn("block truncate text-xs", selected ? "text-primary-foreground/75" : "text-muted-foreground")}>{item.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="min-w-0">
            {tab === "prompts" ? <PromptsTab skills={skills} /> : null}
            {/* Skills tab is temporarily hidden. */}
            {tab === "knowledge" ? <KnowledgeTab collections={knowledgeCollections} onCollectionsChange={setKnowledgeCollections} /> : null}
            {tab === "public-chat" ? <PublicChatTab prompts={prompts} providers={providers} /> : null}
            {tab === "llm" ? <LLMTab /> : null}
            {tab === "mcp" ? <MCPTab /> : null}
          </section>
        </div>
      </main>
    </div>
  );
}
