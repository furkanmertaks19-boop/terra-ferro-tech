const ALLOWED_TAGS = new Set(["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "a", "h2", "h3", "h4", "blockquote", "span"]);

export function plainText(value: string, max = 80) {
  return value.replace(/<[^>]*>/g, "").replace(/[<>]/g, "").trim().slice(0, max);
}

export function sanitizeRichHtml(html: string) {
  const withoutDanger = html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, "")
    .replace(/<embed[\s\S]*?>/gi, "")
    .replace(/on\w+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/data:text\/html/gi, "");

  return withoutDanger.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (full, tag: string, attrs: string) => {
    const name = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(name)) return "";
    if (full.startsWith("</")) return `</${name}>`;
    if (name === "br") return "<br>";
    if (name === "a") {
      const href = attrs.match(/href\s*=\s*("([^"]*)"|'([^']*)')/i);
      const url = (href?.[2] || href?.[3] || "").trim();
      if (!url || !/^(https?:|\/|#|mailto:)/i.test(url)) return "<a>";
      return `<a href="${url.replace(/"/g, "")}" rel="noopener noreferrer">`;
    }
    return `<${name}>`;
  });
}
