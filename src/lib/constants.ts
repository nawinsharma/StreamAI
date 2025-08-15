// Design tokens
export const DESIGN_TOKENS = {
  MESSAGE_MAX_WIDTH: 'max-w-[85%]' as const,
  MESSAGE_MIN_WIDTH: 'min-w-[200px]' as const,
  INPUT_MIN_HEIGHT: 'min-h-[60px]' as const,
  INPUT_MAX_HEIGHT: 'max-h-[200px]' as const,
  BUTTON_SIZE: 'h-8 w-8' as const,
} as const;

// API constants
export const API_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_MESSAGE_LENGTH: 2000,
  MAX_TITLE_LENGTH: 100,
  MAX_QUESTION_LENGTH: 500,
  REQUEST_TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// File types
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
] as const;

// Animation durations
export const ANIMATION_DURATIONS = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UPLOAD_FAILED: 'Failed to upload file. Please try again.',
  MESSAGE_TOO_LONG: 'Message is too long. Please shorten it.',
  FILE_TOO_LARGE: 'File is too large. Please select a smaller file.',
  INVALID_FILE_TYPE: 'File type not supported.',
  CHAT_CREATION_FAILED: 'Failed to create new chat.',
  MESSAGE_SENDING_FAILED: 'Failed to send message.',
  UNAUTHORIZED: 'Please sign in to continue.',
  QUOTA_EXCEEDED: 'AI service quota exceeded. Please try again later.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment and try again.',
  DAILY_QUOTA_EXCEEDED: 'Daily AI usage limit reached. Please try again tomorrow.',
} as const;

// Type for error messages
export type ErrorMessage = typeof ERROR_MESSAGES[keyof typeof ERROR_MESSAGES]; 