export function cleanContent(content: string): string {
  return content
    .replace(/\n/g, "")
    .replace(/\[quote.*?\].*?\[\/quote\]/gis, "") // DOTALL + case-insensitive
    .trim();
}