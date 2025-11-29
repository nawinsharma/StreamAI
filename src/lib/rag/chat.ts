import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

// Validate OpenAI API key
const validateOpenAIAPIKey = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey || apiKey.length === 0) {
    throw new Error('No valid OpenAI API key found. Please set OPENAI_API_KEY in your environment variables.');
  }
  
  return apiKey;
};

const OPENAI_API_KEY = validateOpenAIAPIKey();

// Initialize OpenAI embeddings
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: OPENAI_API_KEY,
  modelName: "text-embedding-3-small", // Using the smaller, faster model
});

// Initialize Google provider for AI SDK with v1 API
const google = createGoogleGenerativeAI({ 
  apiKey: process.env.GOOGLE_API_KEY,
});

const createQdrantClient = () => {
  return new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
    checkCompatibility: false, // Skip version check to avoid compatibility errors
  } as ConstructorParameters<typeof QdrantClient>[0] & { checkCompatibility: boolean });
};

export interface RagChatResponse {
  response: string;
  sources: Array<{
    content: string;
    metadata: unknown;
    score?: number;
  }>;
}

export const chatWithCollection = async (
  userQuery: string,
  collectionName: string,
  chatHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<RagChatResponse> => {
  try {
    console.log("🔍 Searching in collection:", collectionName);
    console.log("💬 User query:", userQuery);

    // Connect to existing vector store
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        client: createQdrantClient(),
        collectionName,
      }
    );

    // Retrieve relevant documents
    const retriever = vectorStore.asRetriever({ 
      k: 5, // Number of documents to retrieve
      searchType: "similarity",
    });

    const relevantDocs = await retriever.invoke(userQuery);
    console.log(`📚 Found ${relevantDocs.length} relevant documents`);

    // Prepare context from retrieved documents
    const context = relevantDocs
      .map((doc, index) => `Document ${index + 1}:\n${doc.pageContent}`)
      .join("\n\n");

    // Build conversation history for context
    const conversationHistory = chatHistory
      ? chatHistory
          .slice(-6) // Keep last 6 messages for context
          .map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
          .join('\n')
      : '';

    // Create system prompt
    const systemPrompt = `You are an AI assistant that answers questions based on the provided context from documents. 
Your task is to provide accurate, helpful answers using only the information available in the context.

Guidelines:
- Answer based solely on the provided context
- If the context doesn't contain enough information to answer the question, say so
- Be concise but thorough
- Use direct quotes when appropriate
- Maintain the conversation flow by considering previous messages`;

    const prompt = `Context from documents:\n${context}\n\n${conversationHistory ? `Previous conversation:\n${conversationHistory}\n\n` : ''}Question: ${userQuery}`;

    console.log("🤖 Generating response...");

    // Generate response using Google via AI SDK
    const { text } = await generateText({
      model: google('gemini-2.5-flash'), // Using same model as city-parser
      system: systemPrompt,
      prompt,
      temperature: 0.1,
      maxOutputTokens: 1000,
    });

    const response = text || "I apologize, but I couldn't generate a response.";

    // Format sources
    const sources = relevantDocs.map((doc) => ({
      content: doc.pageContent.substring(0, 200) + (doc.pageContent.length > 200 ? '...' : ''),
      metadata: doc.metadata,
      score: undefined, // Qdrant doesn't return scores by default in this setup
    }));

    console.log("✅ Response generated successfully");

    return {
      response,
      sources,
    };

  } catch (error) {
    console.error("RAG chat error:", error);
    throw new Error(`Failed to process chat request: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const generateSummary = async (collectionName: string): Promise<string> => {
  try {
    console.log("📝 Generating summary for collection:", collectionName);

    // Connect to existing vector store
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        client: createQdrantClient(),
        collectionName,
      }
    );

    // Get a broader sample of documents for summary
    const retriever = vectorStore.asRetriever({
      k: 10, // Get more documents for summary
    });

    const docs = await retriever.invoke("summary overview content main topics");

    // Prepare content for summary
    const content = docs
      .map(doc => doc.pageContent)
      .join("\n\n")
      .substring(0, 4000); // Limit content length

    // Generate summary using Google via AI SDK
    const { text } = await generateText({
      model: google('gemini-2.5-flash'), // Using same model as city-parser
      system: "You are an AI assistant that creates concise, informative summaries of documents. Create a summary that captures the main topics, key points, and overall theme of the content.",
      prompt: `Please create a concise summary of the following content:\n\n${content}`,
      temperature: 0.3,
      maxOutputTokens: 250,
    });

    return text || "Summary not available.";

  } catch (error) {
    console.error("Summary generation error:", error);
    return "Unable to generate summary at this time.";
  }
}; 
