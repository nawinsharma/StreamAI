import { toast } from "sonner";

export interface ToolError {
  tool: string;
  error: string;
  details?: unknown;
}

export class ErrorHandler {
  static handleToolError(error: ToolError) {
    const errorMessages: Record<string, string> = {
      'ImageGenerationTool': 'Failed to generate image. Please check your prompt and try again.',
      'WeatherTool': 'Unable to fetch weather data. Please check the city name and try again.',
      'WebSearchTool': 'Search failed. Please try a different search term.',
      'YoutubeTool': 'Unable to find videos. Please try a different search term.',
      'AudioGenerationTool': 'Failed to generate audio. Please try again.',
      'DocumentGenerationTool': 'Unable to retrieve documents. Please try a different search term.',
      'ChartGenerationTool': 'Failed to generate chart. Please check your data and try again.',
    };

    const defaultMessage = `Tool '${error.tool}' failed: ${error.error}`;
    const userFriendlyMessage = errorMessages[error.tool] || defaultMessage;

    // Show toast notification
    toast.error("Tool Error", {
      description: userFriendlyMessage,
      duration: 5000,
    });

    // Log detailed error for debugging
    console.error(`Tool Error - ${error.tool}:`, {
      error: error.error,
      details: error.details,
    });

    return userFriendlyMessage;
  }

  static handleGeneralError(error: Error | string, context?: string) {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const contextMessage = context ? `${context}: ${errorMessage}` : errorMessage;

    // Show toast notification
    toast.error("Error", {
      description: contextMessage,
      duration: 5000,
    });

    // Log error for debugging
    console.error(`General Error${context ? ` - ${context}` : ''}:`, error);

    return contextMessage;
  }

  static handleAPIError(error: unknown, apiName: string) {
    let userMessage = `Failed to connect to ${apiName}`;
    
    const errorObj = error as { response?: { status?: number }; message?: string };
    
    if (errorObj?.response?.status === 401) {
      userMessage = `${apiName} authentication failed. Please check your API key.`;
    } else if (errorObj?.response?.status === 429) {
      userMessage = `${apiName} rate limit exceeded. Please try again later.`;
    } else if (errorObj?.response?.status && errorObj.response.status >= 500) {
      userMessage = `${apiName} service is temporarily unavailable. Please try again later.`;
    } else if (errorObj?.message) {
      userMessage = `${apiName} error: ${errorObj.message}`;
    }

    // Show toast notification
    toast.error("API Error", {
      description: userMessage,
      duration: 5000,
    });

    // Log detailed error for debugging
    console.error(`API Error - ${apiName}:`, error);

    return userMessage;
  }

  static handleNetworkError(error: unknown) {
    const userMessage = "Network connection failed. Please check your internet connection and try again.";

    // Show toast notification
    toast.error("Network Error", {
      description: userMessage,
      duration: 5000,
    });

    // Log error for debugging
    console.error("Network Error:", error);

    return userMessage;
  }

  static handleValidationError(field: string, message: string) {
    const userMessage = `${field}: ${message}`;

    // Show toast notification
    toast.error("Validation Error", {
      description: userMessage,
      duration: 3000,
    });

    // Log error for debugging
    console.error(`Validation Error - ${field}:`, message);

    return userMessage;
  }
}

// Helper function to extract tool name from error message
export function extractToolNameFromError(errorMessage: string): string {
  const toolPatterns = [
    /ImageGenerationTool/,
    /WeatherTool/,
    /WebSearchTool/,
    /YoutubeTool/,
    /AudioGenerationTool/,
    /DocumentGenerationTool/,
    /ChartGenerationTool/,
  ];

  for (const pattern of toolPatterns) {
    if (pattern.test(errorMessage)) {
      return pattern.source.replace(/[\/\\]/g, '');
    }
  }

  return 'UnknownTool';
}

// Helper function to create tool error object
export function createToolError(toolName: string, error: string, details?: unknown): ToolError {
  return {
    tool: toolName,
    error,
    details,
  };
} 