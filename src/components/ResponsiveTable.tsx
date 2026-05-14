import React, { useMemo } from 'react';

interface ResponsiveTableProps {
  html: string;
}

interface ParsedContent {
  before: string;
  table: string | null;
  after: string;
}

function parseHtmlContent(html: string): ParsedContent {
  const tableRegex = /<table[\s\S]*<\/table>/i;
  const match = html.match(tableRegex);

  if (!match || match.index === undefined) {
    return { before: html, table: null, after: '' };
  }

  const before = html.slice(0, match.index).trim();
  const table = match[0];
  const after = html.slice(match.index + table.length).trim();

  return { before, table, after };
}

function convertMarkdownToHtml(markdown: string): string {
  let html = markdown;

  html = html.replace(/&/g, '&amp;');
  html = html.replace(/</g, '&lt;');
  html = html.replace(/>/g, '&gt;');

  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

  html = html.replace(/#### (.+)/g, '<h4>$1</h4>');
  html = html.replace(/### (.+)/g, '<h3>$1</h3>');
  html = html.replace(/## (.+)/g, '<h2>$1</h2>');
  html = html.replace(/# (.+)/g, '<h1>$1</h1>');

  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  html = html.replace(/^- (.+)/gm, '<li>$1</li>');
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

  html = html.replace(/^\d+\. (.+)/gm, '<li>$1</li>');
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, (match) => {
    if (match.includes('<ul>')) return match;
    return `<ol>${match}</ol>`;
  });

  html = html.replace(/^>\s?(.+)/gm, '<blockquote>$1</blockquote>');

  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  html = html.replace(/\n\n+/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');

  html = '<p>' + html + '</p>';

  html = html.replace(/<p>\s*<\/p>/g, '');

  return html;
}

function isHtmlContent(content: string): boolean {
  return /<\s*[a-zA-Z][a-zA-Z0-9]*[\s>]/.test(content);
}

function prepareHtml(content: string): string {
  if (!content) return '';

  if (isHtmlContent(content)) {
    return content;
  }

  return convertMarkdownToHtml(content);
}

const PROSE_BASE = 'prose prose-sm sm:prose-base max-w-none text-foreground leading-relaxed';

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({ html }) => {
  const processedHtml = useMemo(() => prepareHtml(html), [html]);

  const { before, table, after } = useMemo(
    () => parseHtmlContent(processedHtml),
    [processedHtml]
  );

  return (
    <div className="w-full">
      <style>{`
        .table-scroll-wrapper::-webkit-scrollbar {
          display: none;
        }
        .table-scroll-wrapper {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        @media (max-width: 639px) {
          .table-scroll-wrapper table {
            table-layout: auto;
          }
          .table-scroll-wrapper td,
          .table-scroll-wrapper th {
            white-space: nowrap;
            font-size: 11px;
            padding: 4px 6px;
          }
        }
      `}</style>

      {before && (
        <div
          className={`${PROSE_BASE} mb-4`}
          dangerouslySetInnerHTML={{ __html: before }}
        />
      )}

      {table && (
        <div
          className="table-scroll-wrapper overflow-x-auto -mx-4 px-4"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div
            className="[&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-border [&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-2 [&_th]:text-left [&_th]:bg-gradient-to-b [&_th]:from-muted [&_th]:to-muted/80 [&_th]:font-semibold [&_th]:text-xs [&_th]:text-foreground [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1.5 [&_td]:text-xs [&_td]:text-foreground [&_tr:nth-child(even)]:bg-muted/40 [&_tr:hover]:bg-muted/60 [&_tr]:transition-colors [&_caption]:text-sm [&_caption]:font-semibold [&_caption]:mb-3 [&_caption]:text-foreground sm:[&_th]:px-3 sm:[&_th]:py-3 sm:[&_th]:text-sm sm:[&_td]:px-3 sm:[&_td]:py-2.5 sm:[&_td]:text-sm"
            dangerouslySetInnerHTML={{ __html: table }}
          />
        </div>
      )}

      {after && (
        <div
          className={`${PROSE_BASE} mt-4`}
          dangerouslySetInnerHTML={{ __html: after }}
        />
      )}
    </div>
  );
};
