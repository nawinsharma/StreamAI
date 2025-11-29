// RAG Mode Limits to prevent API overload
export const RAG_LIMITS = {
  // PDF Limits
  PDF_MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  PDF_MAX_PAGES: 100, // Maximum number of pages
  PDF_MAX_CHUNKS: 500, // Maximum number of chunks to prevent too many embedding calls
  
  // Website Limits
  WEBSITE_MAX_CHARACTERS: 10000, // 10k characters
  WEBSITE_MAX_CHUNKS: 200, // Maximum number of chunks
  
  // Text Input Limits
  TEXT_MAX_CHARACTERS: 5000, // 5k characters
  TEXT_MAX_CHUNKS: 100, // Maximum number of chunks
  
  // YouTube Limits
  YOUTUBE_MAX_TRANSCRIPT_LENGTH: 50000, // 50k characters for transcript
  YOUTUBE_MAX_CHUNKS: 150, // Maximum number of chunks
  
  // Rate Limiting (per user per day)
  MAX_INDEXING_OPERATIONS_PER_DAY: 5, // Maximum indexing operations per user per day
} as const;

