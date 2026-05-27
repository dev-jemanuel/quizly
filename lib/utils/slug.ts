import slugify from "slugify";

export function generateSlug(title: string): string {
  const base = slugify(title, {
    lower: true,
    strict: true,
    locale: "pt",
  });
  const random = Math.random().toString(36).slice(2, 7);
  return `${base}-${random}`;
}