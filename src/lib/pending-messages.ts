import { createChat } from "@/app/actions/chatActions";

export interface PendingMessage {
  id: string;
  content: string;
  timestamp: string;
  attachment?: unknown;
}

export interface PendingFile {
  id: string;
  name: string;
  size: number;
  type: string;
  timestamp: string;
}

/**
 * Get pending messages from localStorage
 */
export const getPendingMessages = (): PendingMessage[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const saved = localStorage.getItem('pendingMessages');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error parsing pending messages:', error);
    return [];
  }
};

/**
 * Get pending files from localStorage
 */
export const getPendingFiles = (): PendingFile[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const saved = localStorage.getItem('pendingFiles');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error parsing pending files:', error);
    return [];
  }
};

/**
 * Clear pending messages and files from localStorage
 */
export const clearPendingData = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('pendingMessages');
  localStorage.removeItem('pendingFiles');
};

/**
 * Process pending messages and files after successful authentication
 * Creates a new chat and sends the first pending message
 */
export const processPendingData = async (): Promise<string | null> => {
  console.log(' Processing pending data...');
  
  const pendingMessages = getPendingMessages();
  const pendingFiles = getPendingFiles();
  
  console.log('Pending messages:', pendingMessages);
  console.log('Pending files:', pendingFiles);
  
  if (pendingMessages.length === 0 && pendingFiles.length === 0) {
    console.log('No pending data found');
    return null;
  }
  
  try {
    // Wait a bit for the user context to be fully updated
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('creating new chat via server action...');
    let chatTitle = "New Chat";
    
    if (pendingMessages.length > 0) {
      const firstMessage = pendingMessages[0];
      chatTitle = firstMessage.content.substring(0, 50) + (firstMessage.content.length > 50 ? "..." : "");
    } else if (pendingFiles.length > 0) {
      const firstFile = pendingFiles[0];
      chatTitle = `Chat with ${firstFile.name}`;
    }
    
    const chatResult = await createChat(chatTitle);
    
    if (!chatResult.success) {
      console.error('failed to create chat:', chatResult.error);
      return null;
    }
    
    const chatId = chatResult.data?.id;
    console.log('created chat with ID:', chatId);
    
    // Clear pending data
    clearPendingData();
    
    // If there are pending messages, redirect to chat with the first message
    if (pendingMessages.length > 0) {
      const firstMessage = pendingMessages[0];
      const redirectUrl = `/chat/${chatId}?message=${encodeURIComponent(firstMessage.content)}`;
      console.log('redirecting to:', redirectUrl);
      return redirectUrl;
    }
    
    // If there are only pending files, redirect to chat
    if (pendingFiles.length > 0) {
      const redirectUrl = `/chat/${chatId}`;
      console.log('redirecting to:', redirectUrl);
      return redirectUrl;
    }
    
    const redirectUrl = `/chat/${chatId}`;
    console.log('redirecting to:', redirectUrl);
    return redirectUrl;
  } catch (error) {
    console.error('Error processing pending data:', error);
    return null;
  }
}; 