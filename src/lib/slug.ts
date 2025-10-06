const NON_ALPHANUMERIC = /[^a-z0-9]+/g;
const DIACRITICS = /[\u0300-\u036f]/g;

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(DIACRITICS, '')
    .replace(NON_ALPHANUMERIC, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function uniqueSlug(base: string, existing: Set<string>) {
  const initial = slugify(base);
  if (!existing.has(initial)) return initial;

  let suffix = 2;
  let candidate = `${initial}-${suffix}`;
  while (existing.has(candidate)) {
    suffix += 1;
    candidate = `${initial}-${suffix}`;
  }

  return candidate;
}
