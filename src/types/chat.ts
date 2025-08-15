export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'file';
  mimeType?: string;
  size?: number;
  extractedTextPreview?: string | null;
}

export interface ChatMessage {
  id: string;
  isUser: boolean;
  content: string | React.ReactNode;
  timestamp: string;
  attachment?: Attachment | null;
}

export interface QuickAction {
  icon: string;
  label: string;
  action: string;
  autoSubmit: boolean;
} 