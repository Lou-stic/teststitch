export interface ParsedPart {
  type: 'text' | 'artifact';
  content: string;
  language?: string;
  id?: string;
}

/**
 * Parses a string containing markdown code blocks into block parts.
 * Code blocks are designated as "artifacts" to render in a stylized container.
 */
export function parseContentParts(text: string): ParsedPart[] {
  if (!text) return [];

  const parts: ParsedPart[] = [];
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const textBefore = text.slice(lastIndex, match.index);
    if (textBefore.trim()) {
      parts.push({
        type: 'text',
        content: textBefore,
      });
    }

    const language = (match[1] || 'text').toLowerCase();
    const code = match[2];
    const id = `artifact-${match.index}`;

    parts.push({
      type: 'artifact',
      content: code,
      language,
      id,
    });

    lastIndex = codeBlockRegex.lastIndex;
  }

  const textAfter = text.slice(lastIndex);
  if (textAfter.trim() || parts.length === 0) {
    parts.push({
      type: 'text',
      content: textAfter || text, // Ensure we fall back to something if entire message has no block
    });
  }

  return parts;
}

/**
 * Super clean helper to copy content to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Fallback
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch (err) {
    console.error("Copy failed", err);
    return false;
  }
}
