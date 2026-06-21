// Chat model registry shared by the UI and the API.
// Premium models are gated server-side via the user's `isPremiumUser` flag.

export type ChatModelProvider = "google" | "anthropic";

export interface ChatModelOption {
  id: string; // provider model id passed to the AI SDK
  label: string; // shown in the selector
  provider: ChatModelProvider;
  premium: boolean; // requires isPremiumUser
}

// Default model for everyone (current behavior). Non-premium users always get this.
export const DEFAULT_MODEL_ID = "gemini-2.5-flash";

export const CHAT_MODELS: ChatModelOption[] = [
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", provider: "google", premium: false },
  { id: "claude-opus-4-8", label: "Claude Opus 4.8", provider: "anthropic", premium: true },
  { id: "claude-opus-4-7", label: "Claude Opus 4.7", provider: "anthropic", premium: true },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", provider: "anthropic", premium: true },
  { id: "claude-haiku-4-5", label: "Claude Haiku 4.5", provider: "anthropic", premium: true },
];

export function getModelById(id?: string | null): ChatModelOption | undefined {
  if (!id) return undefined;
  return CHAT_MODELS.find((m) => m.id === id);
}

/**
 * Resolves the model the request is allowed to use.
 * Falls back to the default model when the requested model is unknown,
 * or is premium-only and the user is not premium.
 */
export function resolveAllowedModelId(
  requestedId: string | undefined,
  isPremiumUser: boolean
): string {
  const selected = getModelById(requestedId);
  if (selected && (!selected.premium || isPremiumUser)) {
    return selected.id;
  }
  return DEFAULT_MODEL_ID;
}
