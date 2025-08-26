// Minimal constants used across the UI

export const DESIGN_TOKENS = {
  MESSAGE_MAX_WIDTH: 'max-w-[85%]' as const,
  INPUT_MIN_HEIGHT: 'min-h-[60px]' as const,
  INPUT_MAX_HEIGHT: 'max-h-[200px]' as const,
  BUTTON_SIZE: 'h-8 w-8' as const,
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UPLOAD_FAILED: 'Failed to upload file. Please try again.',
  QUOTA_EXCEEDED: 'AI service quota exceeded. Please try again later.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment and try again.',
  DAILY_QUOTA_EXCEEDED: 'Daily AI usage limit reached. Please try again tomorrow.',
} as const;



