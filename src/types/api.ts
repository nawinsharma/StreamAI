export interface ChatResponse {
  ui?: string | React.ReactNode;
  data?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface UploadResponse {
  attachment: {
    id: string;
    name: string;
    url: string;
    type: 'image' | 'file';
    mimeType?: string;
    size?: number;
    extractedTextPreview?: string | null;
  };
}

export interface ChatCreateResponse {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
} 