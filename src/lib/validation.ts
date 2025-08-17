import { z } from 'zod';

// Message validation schema
export const MessageSchema = z.object({
  prompt: z.string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message too long (max 2000 characters)')
    .trim()
    .transform((val) => val || ''), // Ensure we never get null
  chatId: z.string().optional(),
  attachmentMeta: z.object({
    name: z.string(),
    mimeType: z.string(),
    url: z.string().url(),
    type: z.enum(['image', 'file']),
    width: z.number().nullable(),
    height: z.number().nullable(),
    size: z.number().optional(),
    extractedTextPreview: z.string().nullable().optional(),
  }).optional(),
});

// File upload validation - only validate File in browser environment
export const FileUploadSchema = z.object({
  file: z.any()
    .refine((file) => {
      // Check if we're in browser environment and File is available
      if (typeof window === 'undefined' || typeof File === 'undefined') {
        return true; // Skip validation during SSR
      }
      return file instanceof File;
    }, 'Invalid file type')
    .refine((file) => {
      if (typeof window === 'undefined' || typeof File === 'undefined') {
        return true; // Skip validation during SSR
      }
      return file.size <= 10 * 1024 * 1024;
    }, 'File size must be less than 10MB')
    .refine((file) => {
      if (typeof window === 'undefined' || typeof File === 'undefined') {
        return true; // Skip validation during SSR
      }
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      return allowedTypes.includes(file.type);
    }, 'File type not supported'),
  chatId: z.string().optional(),
});

// Chat creation validation
export const ChatCreateSchema = z.object({
  title: z.string()
    .min(1, 'Title cannot be empty')
    .max(100, 'Title too long (max 100 characters)')
    .trim()
    .transform((val) => val || 'New Chat'), // Ensure we never get null
});

// User input validation for suggestions
export const SuggestionSchema = z.object({
  question: z.string()
    .min(1, 'Question cannot be empty')
    .max(500, 'Question too long (max 500 characters)')
    .trim()
    .transform((val) => val || ''), // Ensure we never get null
  shouldAutoSubmit: z.boolean().default(false),
});

// Safe validation function that handles null/undefined values
export const safeValidate = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } => {
  try {
    // Pre-process data to handle null/undefined values
    const processedData = data ? JSON.parse(JSON.stringify(data)) : {};
    
    // Ensure prompt is always a string
    if (processedData.prompt === null || processedData.prompt === undefined) {
      processedData.prompt = '';
    }
    
    const result = schema.safeParse(processedData);
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { 
        success: false, 
        error: result.error.issues[0]?.message || 'Validation failed' 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown validation error' 
    };
  }
};

export type MessageInput = z.infer<typeof MessageSchema>;
export type FileUploadInput = z.infer<typeof FileUploadSchema>;
export type ChatCreateInput = z.infer<typeof ChatCreateSchema>;
export type SuggestionInput = z.infer<typeof SuggestionSchema>; 