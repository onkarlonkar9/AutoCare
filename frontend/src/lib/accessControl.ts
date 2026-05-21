const ALLOWED_ACCESS_IDS = [
  'admin1@autocare-ai.com',
  'admin2@autocare-ai.com',
  'manager1@autocare-ai.com',
  'manager2@autocare-ai.com',
  'owner@autocare-ai.com',
] as const;

function normalizeIdentifier(identifier: string) {
  return identifier.trim().toLowerCase();
}

export function isAllowedAccessId(identifier: string | null | undefined) {
  if (!identifier) return false;
  // Temporary migration mode: allow all valid identifiers.
  // Keep the allowlist in place so we can re-enable strict access later.
  return true;
}

export function getAllowedAccessIds() {
  return [...ALLOWED_ACCESS_IDS];
}
