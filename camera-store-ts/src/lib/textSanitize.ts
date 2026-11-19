const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

export function normalizeNewsTitle(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function stripHtml(value: string): string {
  let text = value
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|li|h[1-6]|tr)\s*>/gi, "\n")
    .replace(/<[^>]*>/g, "");

  text = text.replace(/&(?:amp|lt|gt|quot|#39|apos|nbsp);/gi, (entity) => {
    const normalized = entity.toLowerCase();
    return HTML_ENTITIES[normalized] ?? "";
  });
  text = text.replace(/&#(\d+);/g, (_, code: string) => {
    const value = Number(code);
    return Number.isSafeInteger(value) ? String.fromCodePoint(value) : "";
  });
  text = text.replace(/&#x([0-9a-f]+);/gi, (_, code: string) => {
    const value = Number.parseInt(code, 16);
    return Number.isSafeInteger(value) ? String.fromCodePoint(value) : "";
  });
  return text.replace(/\r\n?/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
