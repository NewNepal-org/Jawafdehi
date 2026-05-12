import { useEffect, useState } from "react";
import { Check, Database, Edit2, ExternalLink, FileText, Loader2, Plus, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { importKnowledgeSource, listKnowledgeSources, updateKnowledgeCollection, updateKnowledgeSource } from "@/services/caseworker-api";
import type { KnowledgeCollection, KnowledgeImportManifest, KnowledgeSource, KnowledgeSourceImportPayload } from "@/types/caseworker";
import { cn } from "@/lib/utils";
import { AlertBanner, EmptyState, SourceTypeControl, StatusPill, ToggleRow } from "../components";
import { errorMessage, rows, slugify } from "../utils";

export function KnowledgeTab({
  collections,
  onCollectionsChange,
}: {
  collections: KnowledgeCollection[];
  onCollectionsChange: (collections: KnowledgeCollection[]) => void;
}) {
  const [mode, setMode] = useState<"url" | "upload" | "text" | "manifest">("url");
  const [importOpen, setImportOpen] = useState(false);
  const [collectionName, setCollectionName] = useState("public-docs");
  const [collectionDisplayName, setCollectionDisplayName] = useState("Public Docs");
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceType, setSourceType] = useState("document");
  const [sourceUrl, setSourceUrl] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [embed, setEmbed] = useState(false);
  const [expandCatalog, setExpandCatalog] = useState(true);
  const [convertLinkedDocuments, setConvertLinkedDocuments] = useState(false);
  const [pages, setPages] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentText, setDocumentText] = useState("");
  const [documentFormat, setDocumentFormat] = useState<"text" | "markdown">("markdown");
  const [manifestText, setManifestText] = useState("");
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [sourceSearch, setSourceSearch] = useState("");
  const [sourcesLoading, setSourcesLoading] = useState(false);
  const [editingCollection, setEditingCollection] = useState<KnowledgeCollection | null>(null);
  const [collectionForm, setCollectionForm] = useState({
    display_name: "",
    description: "",
    access_level: "public" as "private" | "public",
    is_active: true,
  });
  const [editingSource, setEditingSource] = useState<KnowledgeSource | null>(null);
  const [sourceForm, setSourceForm] = useState({
    title: "",
    source_type: "document",
    source_url: "",
    access_level: "public" as "private" | "public",
    is_active: true,
  });
  const [importing, setImporting] = useState(false);
  const [savingCollection, setSavingCollection] = useState(false);
  const [savingSource, setSavingSource] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const publicCollections = collections.filter((collection) => collection.access_level === "public");
  const selectedCollection = collections.find((collection) => collection.id === selectedCollectionId) ?? collections[0] ?? null;

  useEffect(() => {
    if (!selectedCollectionId && collections.length > 0) {
      setSelectedCollectionId(collections[0].id);
    }
  }, [collections, selectedCollectionId]);

  useEffect(() => {
    if (!selectedCollectionId) {
      setSources([]);
      return;
    }
    const timer = window.setTimeout(() => {
      setSourcesLoading(true);
      listKnowledgeSources({ collection: selectedCollectionId, search: sourceSearch || undefined })
        .then((data) => setSources(rows(data)))
        .catch((err) => setError(errorMessage(err)))
        .finally(() => setSourcesLoading(false));
    }, sourceSearch ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [selectedCollectionId, sourceSearch]);

  const upsertCollection = (collection: KnowledgeCollection) => {
    onCollectionsChange(
      collections.some((item) => item.id === collection.id)
        ? collections.map((item) => item.id === collection.id ? collection : item)
        : [...collections, collection],
    );
  };

  const refreshSources = async (collectionId = selectedCollectionId) => {
    if (!collectionId) return;
    setSourcesLoading(true);
    try {
      const data = await listKnowledgeSources({ collection: collectionId, search: sourceSearch || undefined });
      setSources(rows(data));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSourcesLoading(false);
    }
  };

  const handleFile = (file: File | null) => {
    if (!file) return;
    setError("");
    setSelectedFile(file);
    setMode("upload");
    setSourceTitle((current) => current || file.name.replace(/\.[^.]+$/, ""));
  };

  const handleManifestFile = async (file: File | null) => {
    if (!file) return;
    setError("");
    const text = await file.text();
    if (file.name.toLowerCase().endsWith(".json")) {
      setMode("manifest");
      setManifestText(text);
      return;
    }
    setMode("upload");
    setSelectedFile(file);
    setSourceTitle((current) => current || file.name.replace(/\.[^.]+$/, ""));
  };

  const selectCollectionForImport = (collection: KnowledgeCollection) => {
    setCollectionName(collection.name);
    setCollectionDisplayName(collection.display_name || collection.name);
    setIsPublic(collection.access_level === "public");
    setImportOpen(true);
  };

  const startEditCollection = (collection: KnowledgeCollection) => {
    setEditingCollection(collection);
    setCollectionForm({
      display_name: collection.display_name,
      description: collection.description || "",
      access_level: collection.access_level,
      is_active: collection.is_active,
    });
    setError("");
    setSuccess("");
  };

  const saveCollection = async () => {
    if (!editingCollection) return;
    setError("");
    setSuccess("");
    setSavingCollection(true);
    try {
      const updated = await updateKnowledgeCollection(editingCollection.id, collectionForm);
      upsertCollection(updated);
      setEditingCollection(updated);
      setSuccess(`Updated ${updated.display_name}.`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSavingCollection(false);
    }
  };

  const startEditSource = (source: KnowledgeSource) => {
    setEditingSource(source);
    setSourceForm({
      title: source.title,
      source_type: source.source_type || "document",
      source_url: source.source_url || "",
      access_level: source.access_level,
      is_active: source.is_active,
    });
    setError("");
    setSuccess("");
  };

  const saveSource = async () => {
    if (!editingSource) return;
    setError("");
    setSuccess("");
    setSavingSource(true);
    try {
      const updated = await updateKnowledgeSource(editingSource.id, sourceForm);
      setSources((current) => current.map((source) => source.id === updated.id ? { ...source, ...updated } : source));
      setEditingSource(updated);
      setSuccess(`Updated ${updated.title}.`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSavingSource(false);
    }
  };

  const save = async () => {
    setError("");
    setSuccess("");
    setImporting(true);
    try {
      let payload: KnowledgeSourceImportPayload = {
        collection_name: slugify(collectionName),
        collection_display_name: collectionDisplayName || collectionName,
        source_title: sourceTitle,
        source_type: sourceType || "document",
        access_level: isPublic ? "public" as const : "private" as const,
        embed,
        pages: pages.trim() || undefined,
        expand_catalog: expandCatalog,
        convert_linked_documents: convertLinkedDocuments,
      };

      if (mode === "manifest") {
        const parsed = JSON.parse(manifestText || "{}") as unknown;
        payload = { ...payload, manifest: parsed as KnowledgeImportManifest };
      } else if (mode === "url") {
        if (!sourceUrl.trim()) {
          setError("Source URL is required.");
          return;
        }
        payload = { ...payload, source_url: sourceUrl.trim() };
      } else if (mode === "upload") {
        if (!selectedFile) {
          setError("Choose a file to upload.");
          return;
        }
        payload = { ...payload, file: selectedFile };
      } else {
        if (!documentText.trim()) {
          setError("Document text is required.");
          return;
        }
        payload = documentFormat === "markdown"
          ? { ...payload, markdown: documentText }
          : { ...payload, text: documentText };
      }

      const result = await importKnowledgeSource(payload);
      upsertCollection(result.collection);
      setSelectedCollectionId(result.collection.id);
      void refreshSources(result.collection.id);
      const failureText = result.failures.length
        ? ` ${result.failures.length} item${result.failures.length !== 1 ? "s" : ""} failed.`
        : "";
      setSuccess(
        `Imported ${result.sources_imported} source${result.sources_imported !== 1 ? "s" : ""}, ${result.chunks_imported} chunk${result.chunks_imported !== 1 ? "s" : ""}, and ${result.embeddings_imported} embedding${result.embeddings_imported !== 1 ? "s" : ""} into ${result.collection.display_name}.${failureText}`,
      );
      setImportOpen(false);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Knowledge Library</h2>
          <p className="mt-1 text-sm text-muted-foreground">Manage the collections and documents the public chat agent can retrieve.</p>
        </div>
        <Button size="sm" variant="primary" onClick={() => setImportOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Import Source
        </Button>
      </div>

      {error ? <AlertBanner tone="error">{error}</AlertBanner> : null}
      {success ? <AlertBanner tone="success">{success}</AlertBanner> : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-3">
          <div className="px-0.5">
            <p className="text-sm font-semibold text-foreground">Collections</p>
            <p className="mt-1 text-xs text-muted-foreground">{publicCollections.length} public collection{publicCollections.length !== 1 ? "s" : ""} available for public chat RAG</p>
          </div>
          {collections.length === 0 ? (
            <EmptyState
              icon={Database}
              title="No collections imported"
              description="Import a public source to create a searchable collection."
              action={<Button size="sm" variant="primary" onClick={() => setImportOpen(true)}><Plus className="mr-1 h-4 w-4" /> Import Source</Button>}
            />
          ) : (
            <div className="space-y-2">
              {collections.map((collection) => (
                <button
                  key={collection.id}
                  type="button"
                  onClick={() => setSelectedCollectionId(collection.id)}
                  className={cn(
                    "w-full rounded-lg border px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    selectedCollectionId === collection.id ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-background hover:bg-muted/40",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <p className="min-w-0 flex-1 truncate text-sm font-medium">{collection.display_name}</p>
                    {collection.access_level === "public" ? <StatusPill tone="green">Public</StatusPill> : <StatusPill>Private</StatusPill>}
                    {!collection.is_active ? <StatusPill>Inactive</StatusPill> : null}
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">/{collection.name}</p>
                  {collection.description ? <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{collection.description}</p> : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" className="h-8 px-3" onClick={(event) => { event.stopPropagation(); selectCollectionForImport(collection); }}>
                      Use
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 px-3" onClick={(event) => { event.stopPropagation(); startEditCollection(collection); }}>
                      <Edit2 className="mr-1 h-3.5 w-3.5" />
                      Edit
                    </Button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-background shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3.5">
              <div className="min-w-0">
                <p className="text-sm font-medium">{selectedCollection?.display_name ?? "Documents"}</p>
                <p className="text-xs text-muted-foreground">{sources.length} document{sources.length !== 1 ? "s" : ""}{selectedCollection ? ` in /${selectedCollection.name}` : ""}</p>
              </div>
              <div className="relative w-full sm:w-80">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" value={sourceSearch} onChange={(event) => setSourceSearch(event.target.value)} placeholder="Search documents" />
              </div>
            </div>
            {sourcesLoading ? (
              <div className="flex items-center gap-2 px-4 py-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading documents...
              </div>
            ) : sources.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={FileText}
                  title="No documents found"
                  description={sourceSearch ? "Try a different search term or clear the document search." : "Import a source into this collection to make it searchable."}
                />
              </div>
            ) : (
              <div className="divide-y divide-border">
                {sources.map((source) => (
                  <div key={source.id} className="grid gap-3 px-4 py-3.5 transition-colors hover:bg-muted/30 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium">{source.title}</p>
                        <StatusPill>{source.source_type || "document"}</StatusPill>
                        {source.access_level === "public" ? <StatusPill tone="green">Public</StatusPill> : <StatusPill>Private</StatusPill>}
                        {!source.is_active ? <StatusPill>Inactive</StatusPill> : null}
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{source.source_url || "No public URL"}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{source.chunk_count ?? 0} chunk{source.chunk_count === 1 ? "" : "s"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      {source.source_url ? (
                        <Button size="sm" variant="outline" className="h-8 px-3" asChild>
                          <a href={source.source_url} target="_blank" rel="noreferrer">
                            <ExternalLink className="mr-1 h-3.5 w-3.5" />
                            Open
                          </a>
                        </Button>
                      ) : null}
                      <Button size="sm" variant="outline" className="h-8 px-3" onClick={() => startEditSource(source)}>
                        <Edit2 className="mr-1 h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Import Knowledge Source</DialogTitle>
            <DialogDescription>Add a URL, upload, pasted content, or manifest. Catalog URLs expand into individual documents.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="inline-flex flex-wrap rounded-lg border border-border bg-background p-1">
              {(["url", "upload", "text", "manifest"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium ${mode === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {item === "url" ? "Source URL" : item === "upload" ? "Upload File" : item === "text" ? "Paste Text" : "Manifest JSON"}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="knowledge-collection-name">Collection Name</Label>
                <Input id="knowledge-collection-name" value={collectionName} onChange={(event) => setCollectionName(event.target.value)} placeholder="ciaa_annual_reports" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="knowledge-collection-display">Collection Display Name</Label>
                <Input id="knowledge-collection-display" value={collectionDisplayName} onChange={(event) => setCollectionDisplayName(event.target.value)} placeholder="CIAA Annual Reports" />
              </div>
              {collections.length ? (
                <div className="space-y-1 sm:col-span-2">
                  <Label>Use Existing Collection</Label>
                  <Select value={selectedCollectionId ? String(selectedCollectionId) : ""} onValueChange={(value) => {
                    const collection = collections.find((item) => item.id === Number(value));
                    if (collection) selectCollectionForImport(collection);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a collection" />
                    </SelectTrigger>
                    <SelectContent>
                      {collections.map((collection) => (
                        <SelectItem key={collection.id} value={String(collection.id)}>{collection.display_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
              <div className="space-y-1">
                <Label htmlFor="knowledge-source-title">Source Title</Label>
                <Input id="knowledge-source-title" value={sourceTitle} onChange={(event) => setSourceTitle(event.target.value)} placeholder="Optional; inferred for URLs/files" />
              </div>
              <SourceTypeControl value={sourceType} onChange={setSourceType} idPrefix="knowledge-source-type" />

              {mode === "url" ? (
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="knowledge-source-url">Source URL</Label>
                  <Input id="knowledge-source-url" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://ngm-store.jawafdehi.org/indices/2026-05-11/index.ciaa-annual-reports.json" />
                </div>
              ) : null}

              {mode === "upload" ? (
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="knowledge-file">Upload File</Label>
                  <Input id="knowledge-file" type="file" onChange={(event) => handleFile(event.target.files?.[0] ?? null)} />
                  {selectedFile ? <p className="text-xs text-muted-foreground">{selectedFile.name}</p> : null}
                </div>
              ) : null}

              {mode === "text" ? (
                <div className="space-y-2 sm:col-span-2">
                  <div className="inline-flex rounded-lg border border-border bg-background p-1">
                    {(["markdown", "text"] as const).map((format) => (
                      <button
                        key={format}
                        type="button"
                        onClick={() => setDocumentFormat(format)}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium ${documentFormat === format ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {format === "markdown" ? "Markdown" : "Plain Text"}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="knowledge-document-text">Document Content</Label>
                    <Textarea id="knowledge-document-text" value={documentText} onChange={(event) => setDocumentText(event.target.value)} rows={12} className="font-mono text-xs" placeholder="Paste public knowledge content here." />
                  </div>
                </div>
              ) : null}

              {mode === "manifest" ? (
                <div className="space-y-2 sm:col-span-2">
                  <label className="inline-flex cursor-pointer items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-muted">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload JSON
                    <input type="file" accept=".json,application/json" className="sr-only" onChange={(event) => void handleManifestFile(event.target.files?.[0] ?? null)} />
                  </label>
                  <div className="space-y-1">
                    <Label htmlFor="knowledge-manifest">Manifest JSON</Label>
                    <Textarea id="knowledge-manifest" value={manifestText} onChange={(event) => setManifestText(event.target.value)} rows={14} className="font-mono text-xs" placeholder='{"collection":{"name":"ciaa_annual_reports","access_level":"public"},"source":{"title":"CIAA Annual Report","source_url":"https://...","access_level":"public"},"chunks":[{"text":"..."}]}' />
                  </div>
                </div>
              ) : null}

              <div className="space-y-1">
                <Label htmlFor="knowledge-pages">PDF Pages</Label>
                <Input id="knowledge-pages" value={pages} onChange={(event) => setPages(event.target.value)} placeholder="Optional, e.g. 12-15" />
              </div>
              <ToggleRow label="Publicly retrievable" checked={isPublic} onCheckedChange={setIsPublic} />
              <ToggleRow label="Generate embeddings" checked={embed} onCheckedChange={setEmbed} />
              {mode === "url" ? (
                <>
                  <ToggleRow label="Expand catalog/index if detected" checked={expandCatalog} onCheckedChange={setExpandCatalog} />
                  <ToggleRow label="Convert linked documents now" checked={convertLinkedDocuments} onCheckedChange={setConvertLinkedDocuments} />
                </>
              ) : null}
            </div>
            {error ? <AlertBanner tone="error">{error}</AlertBanner> : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={save} disabled={importing}>
              {importing ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Upload className="mr-1 h-4 w-4" />}
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingCollection)} onOpenChange={(open) => !open && setEditingCollection(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
            <DialogDescription>{editingCollection ? `/${editingCollection.name}` : ""}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="edit-collection-display">Display Name</Label>
              <Input id="edit-collection-display" value={collectionForm.display_name} onChange={(event) => setCollectionForm((current) => ({ ...current, display_name: event.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-collection-description">Description</Label>
              <Textarea id="edit-collection-description" value={collectionForm.description} onChange={(event) => setCollectionForm((current) => ({ ...current, description: event.target.value }))} rows={3} />
            </div>
            <ToggleRow
              label="Publicly retrievable"
              checked={collectionForm.access_level === "public"}
              onCheckedChange={(checked) => setCollectionForm((current) => ({ ...current, access_level: checked ? "public" : "private" }))}
            />
            <ToggleRow
              label="Active"
              checked={collectionForm.is_active}
              onCheckedChange={(checked) => setCollectionForm((current) => ({ ...current, is_active: checked }))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCollection(null)}>Cancel</Button>
            <Button variant="primary" onClick={saveCollection} disabled={savingCollection}>
              {savingCollection ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Check className="mr-1 h-4 w-4" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingSource)} onOpenChange={(open) => !open && setEditingSource(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
            <DialogDescription>{editingSource ? editingSource.collection_name : ""}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="edit-source-title">Title</Label>
              <Input id="edit-source-title" value={sourceForm.title} onChange={(event) => setSourceForm((current) => ({ ...current, title: event.target.value }))} />
            </div>
            <SourceTypeControl
              value={sourceForm.source_type}
              onChange={(value) => setSourceForm((current) => ({ ...current, source_type: value }))}
              idPrefix="edit-source-type"
            />
            <div className="space-y-1">
              <Label htmlFor="edit-source-url">Source URL</Label>
              <Input id="edit-source-url" value={sourceForm.source_url} onChange={(event) => setSourceForm((current) => ({ ...current, source_url: event.target.value }))} />
            </div>
            <ToggleRow
              label="Publicly retrievable"
              checked={sourceForm.access_level === "public"}
              onCheckedChange={(checked) => setSourceForm((current) => ({ ...current, access_level: checked ? "public" : "private" }))}
            />
            <ToggleRow
              label="Active"
              checked={sourceForm.is_active}
              onCheckedChange={(checked) => setSourceForm((current) => ({ ...current, is_active: checked }))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSource(null)}>Cancel</Button>
            <Button variant="primary" onClick={saveSource} disabled={savingSource}>
              {savingSource ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Check className="mr-1 h-4 w-4" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
