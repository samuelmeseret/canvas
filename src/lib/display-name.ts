const MAX_NAME_LENGTH = 32;
const MIN_NAME_LENGTH = 2;

export function sanitizeDisplayName(input: string): string {
  return input.trim().replace(/\s+/g, " ").slice(0, MAX_NAME_LENGTH);
}

export function isValidDisplayName(input: string): boolean {
  const name = sanitizeDisplayName(input);
  return name.length >= MIN_NAME_LENGTH && name.length <= MAX_NAME_LENGTH;
}
