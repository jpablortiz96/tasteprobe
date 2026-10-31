export function productError(code: string) {
  const messages: Record<string, string> = {
    FORBIDDEN_ORIGIN: 'The page address and server address do not match. Reopen TasteProbe at its published address, or the exact local address shown by the server.',
    BLOCKED_LIVE: 'Live recommendations are unavailable. The workspace owner needs to verify authorized access and usage protection.',
    AUTH: 'Qloo could not authorize this workspace. Ask the owner to check its server credential.',
    RATE_LIMIT: 'The cultural data service has reached its usage limit. Please try later.',
    REQUEST_BUDGET: 'This workspace has reached its request budget. Your selections are still available.',
    TIMEOUT: 'The cultural data service took too long. No recommendations were inferred. You can retry manually.',
    NETWORK: 'We could not reach the cultural data service. Your selections are still here.',
    IDENTITY_EXPIRED: 'Your identity confirmations expired. Search and confirm the films again.',
    IDENTITY_REQUIRED: 'Please search and explicitly confirm each favorite before discovering movies.',
    DUPLICATE_ENTITY: 'This film is already selected. Choose a different favorite.',
    INVALID_INPUT: 'Check your movie title and try again. Use between 2 and 80 characters.',
    SESSION_EXPIRED: 'This audit session expired. Prepare your list again to start a fresh session.',
    INTERNAL_ERROR: 'The workspace could not complete the request. Reload this page and search and confirm your favorites again. If it continues, share the diagnostic details with the workspace owner.',
    INVALID_RESPONSE: 'A response arrived, but its format could not be validated. No unverified recommendations are shown. Share the diagnostic details with the workspace owner.',
    UPSTREAM: 'The cultural data service could not complete this request. No recommendations were inferred. You can retry explicitly later.',
    REQUEST_REJECTED: 'The cultural data service rejected this request. The workspace owner can inspect its diagnostic details; no recommendations were inferred.',
  };
  return messages[code] ?? 'We could not verify the response. No recommendations were inferred. Please try again later.';
}
