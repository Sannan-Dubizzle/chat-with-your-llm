import { useMemo } from "react";

interface MessageContentProps {
  content: string;
  isUser: boolean;
}

// Simple markdown table parser
const parseMarkdownTable = (content: string) => {
  const tableRegex = /(\|.*\|[\r\n]+\|[-:\s|]+\|[\r\n]+((\|.*\|[\r\n]*)+))/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = tableRegex.exec(content)) !== null) {
    // Add text before table
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex, match.index).trim()
      });
    }

    // Parse table
    const tableContent = match[0];
    const lines = tableContent.trim().split('\n').filter(line => line.trim());
    
    if (lines.length >= 3) {
      const headers = lines[0].split('|').map(h => h.trim()).filter(h => h);
      const rows = lines.slice(2).map(row => 
        row.split('|').map(cell => cell.trim()).filter(cell => cell)
      );

      parts.push({
        type: 'table',
        headers,
        rows
      });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.slice(lastIndex).trim()
    });
  }

  return parts.length > 0 ? parts : [{ type: 'text', content }];
};

// Simple code block parser
const parseCodeBlocks = (content: string) => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex, match.index)
      });
    }

    // Add code block
    parts.push({
      type: 'code',
      language: match[1] || 'text',
      content: match[2].trim()
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.slice(lastIndex)
    });
  }

  return parts.length > 1 ? parts : [{ type: 'text', content }];
};

const Table = ({ headers, rows }: { headers: string[], rows: string[][] }) => (
  <div className="my-4 overflow-x-auto rounded-lg border border-border/50 bg-card shadow-sm">
    <table className="w-full text-sm">
      <thead className="bg-muted/50">
        <tr>
          {headers.map((header, index) => (
            <th 
              key={index} 
              className="px-4 py-3 text-left font-medium text-foreground border-b border-border/30"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr 
            key={rowIndex} 
            className="border-b border-border/20 hover:bg-muted/30 transition-colors"
          >
            {row.map((cell, cellIndex) => (
              <td 
                key={cellIndex} 
                className="px-4 py-3 text-foreground/90"
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const CodeBlock = ({ language, content }: { language: string, content: string }) => (
  <div className="my-4 rounded-lg border border-border/50 bg-muted/30 overflow-hidden">
    <div className="px-4 py-2 bg-muted/50 border-b border-border/30 text-xs font-medium text-muted-foreground">
      {language}
    </div>
    <pre className="p-4 overflow-x-auto text-sm">
      <code className="font-mono text-foreground/90">{content}</code>
    </pre>
  </div>
);

export const MessageContent = ({ content, isUser }: MessageContentProps) => {
  const parsedContent = useMemo(() => {
    // First parse tables, then code blocks from any text parts
    let parts = parseMarkdownTable(content);
    
    // Process text parts for code blocks
    const processedParts = [];
    for (const part of parts) {
      if (part.type === 'text' && part.content) {
        const codeParts = parseCodeBlocks(part.content);
        processedParts.push(...codeParts);
      } else {
        processedParts.push(part);
      }
    }
    
    return processedParts;
  }, [content]);

  return (
    <div className="space-y-2">
      {parsedContent.map((part, index) => {
        switch (part.type) {
          case 'table':
            return (
              <Table 
                key={index} 
                headers={part.headers} 
                rows={part.rows} 
              />
            );
          case 'code':
            return (
              <CodeBlock 
                key={index} 
                language={part.language} 
                content={part.content} 
              />
            );
          case 'text':
          default:
            return part.content ? (
              <p 
                key={index} 
                className="leading-relaxed whitespace-pre-wrap break-words"
              >
                {part.content}
              </p>
            ) : null;
        }
      })}
    </div>
  );
};