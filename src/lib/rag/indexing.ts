import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { Document } from "@langchain/core/documents";
import { QdrantClient } from "@qdrant/js-client-rest";
import axios from "axios";
import { parse } from "node-html-parser";
import { Innertube } from "youtubei.js";
import { RAG_LIMITS } from "./limits";

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

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const createQdrantClient = () => {
  return new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
    checkCompatibility: false,
  } as ConstructorParameters<typeof QdrantClient>[0] & { checkCompatibility: boolean });
};

export const indexPdf = async (file: File, collectionName: string) => {
  try {
    // Check file size limit
    if (file.size > RAG_LIMITS.PDF_MAX_FILE_SIZE) {
      throw new Error(`PDF file is too large. Maximum size is ${RAG_LIMITS.PDF_MAX_FILE_SIZE / (1024 * 1024)}MB.`);
    }

    // Load PDF
    const loader = new PDFLoader(file);
    const docs = await loader.load();

    // Check page limit
    if (docs.length > RAG_LIMITS.PDF_MAX_PAGES) {
      throw new Error(`PDF has too many pages (${docs.length}). Maximum is ${RAG_LIMITS.PDF_MAX_PAGES} pages.`);
    }

    // Split documents
    const splitDocs = await textSplitter.splitDocuments(docs);

    // Check chunk limit to prevent too many API calls
    if (splitDocs.length > RAG_LIMITS.PDF_MAX_CHUNKS) {
      console.warn(`PDF has ${splitDocs.length} chunks, limiting to ${RAG_LIMITS.PDF_MAX_CHUNKS} chunks to prevent API overload.`);
      // Truncate to limit
      const limitedDocs = splitDocs.slice(0, RAG_LIMITS.PDF_MAX_CHUNKS);
      
      // Create vector store with limited chunks
      await QdrantVectorStore.fromDocuments(
        limitedDocs,
        embeddings,
        {
          client: createQdrantClient(),
          collectionName,
        }
      );

      return {
        success: true,
        documentsCount: limitedDocs.length,
        collectionName,
        warning: `Document was truncated to ${RAG_LIMITS.PDF_MAX_CHUNKS} chunks to prevent API overload.`,
      };
    }

    // Create vector store
    await QdrantVectorStore.fromDocuments(
      splitDocs,
      embeddings,
      {
        client: createQdrantClient(),
        collectionName,
      }
    );

    return {
      success: true,
      documentsCount: splitDocs.length,
      collectionName,
    };
  } catch (error) {
    console.error("PDF indexing error:", error);
    throw new Error(`Failed to index PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const indexWebsite = async (url: string, collectionName: string) => {
  try {
    console.log("🚀 Fetching website content...");
    
    // Fetch page content using axios and node-html-parser
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 30000,
      maxRedirects: 5,
    });
    
    // Parse HTML using node-html-parser
    const root = parse(data);
    
    // Extract text content from the page
    const bodyElement = root.querySelector('body');
    let pageText = bodyElement ? bodyElement.innerText.replace(/\s+/g, ' ').trim() : '';
    
    // Get title
    const titleElement = root.querySelector('title');
    const title = titleElement ? titleElement.innerText : 'Untitled Page';
    
    if (!pageText) {
      throw new Error('No content found on the page');
    }

    console.log(`📄 Extracted ${pageText.length} characters from: ${title}`);

    // Check character limit
    if (pageText.length > RAG_LIMITS.WEBSITE_MAX_CHARACTERS) {
      console.warn(`Website content is too long (${pageText.length} chars), truncating to ${RAG_LIMITS.WEBSITE_MAX_CHARACTERS} characters.`);
      pageText = pageText.substring(0, RAG_LIMITS.WEBSITE_MAX_CHARACTERS);
    }

    // Create document from extracted text
    const doc = new Document({
      pageContent: pageText,
      metadata: { 
        source: "website", 
        url,
        title
      },
    });

    // Split document
    const splitDocs = await textSplitter.splitDocuments([doc]);
    
    console.log(`📖 Created ${splitDocs.length} chunks from website`);

    // Check chunk limit
    if (splitDocs.length > RAG_LIMITS.WEBSITE_MAX_CHUNKS) {
      console.warn(`Website has ${splitDocs.length} chunks, limiting to ${RAG_LIMITS.WEBSITE_MAX_CHUNKS} chunks to prevent API overload.`);
      const limitedDocs = splitDocs.slice(0, RAG_LIMITS.WEBSITE_MAX_CHUNKS);
      
      await QdrantVectorStore.fromDocuments(
        limitedDocs,
        embeddings,
        {
          client: createQdrantClient(),
          collectionName,
        }
      );

      return {
        success: true,
        documentsCount: limitedDocs.length,
        collectionName,
        sourceUrl: url,
        warning: `Content was truncated to ${RAG_LIMITS.WEBSITE_MAX_CHUNKS} chunks to prevent API overload.`,
      };
    }

    // Create vector store
    await QdrantVectorStore.fromDocuments(
      splitDocs,
      embeddings,
      {
        client: createQdrantClient(),
        collectionName,
      }
    );

    return {
      success: true,
      documentsCount: splitDocs.length,
      collectionName,
      sourceUrl: url,
    };
  } catch (error) {
    console.error("Website indexing error:", error);
    throw new Error(`Failed to index website: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const indexText = async (text: string, title: string, collectionName: string) => {
  try {
    // Check character limit
    if (text.length > RAG_LIMITS.TEXT_MAX_CHARACTERS) {
      throw new Error(`Text content is too long (${text.length} characters). Maximum is ${RAG_LIMITS.TEXT_MAX_CHARACTERS} characters.`);
    }

    // Create document from text
    const doc = new Document({
      pageContent: text,
      metadata: { title, source: "text_input" },
    });

    // Split document
    const splitDocs = await textSplitter.splitDocuments([doc]);

    // Check chunk limit
    if (splitDocs.length > RAG_LIMITS.TEXT_MAX_CHUNKS) {
      console.warn(`Text has ${splitDocs.length} chunks, limiting to ${RAG_LIMITS.TEXT_MAX_CHUNKS} chunks to prevent API overload.`);
      const limitedDocs = splitDocs.slice(0, RAG_LIMITS.TEXT_MAX_CHUNKS);
      
      await QdrantVectorStore.fromDocuments(
        limitedDocs,
        embeddings,
        {
          client: createQdrantClient(),
          collectionName,
        }
      );

      return {
        success: true,
        documentsCount: limitedDocs.length,
        collectionName,
        title,
        warning: `Content was truncated to ${RAG_LIMITS.TEXT_MAX_CHUNKS} chunks to prevent API overload.`,
      };
    }

    // Create vector store
    await QdrantVectorStore.fromDocuments(
      splitDocs,
      embeddings,
      {
        client: createQdrantClient(),
        collectionName,
      }
    );

    return {
      success: true,
      documentsCount: splitDocs.length,
      collectionName,
      title,
    };
  } catch (error) {
    console.error("Text indexing error:", error);
    throw new Error(`Failed to index text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const indexYoutube = async (url: string, collectionName: string) => {
  try {
    console.log("🎥 Fetching YouTube video content...");
    
    // Enhanced YouTube content extraction
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    // Initialize YouTube client
    const youtube = await Innertube.create();
    
    // Get video info
    const videoInfo = await youtube.getInfo(videoId);
    
    if (!videoInfo) {
      throw new Error('Could not fetch video information');
    }

    const videoDetails = videoInfo.basic_info;
    const title = videoDetails.title || `YouTube Video ${videoId}`;
    const description = videoDetails.short_description || '';
    
    console.log(`📹 Processing: ${title}`);

    // Try to get transcript/captions
    let transcript = '';
    try {
      const transcriptData = await videoInfo.getTranscript();
      if (transcriptData?.transcript?.content?.body?.initial_segments) {
        transcript = transcriptData.transcript.content.body.initial_segments
          .map((segment: { snippet?: { text?: string } }) => segment.snippet?.text || '')
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        // Limit transcript length to prevent API overload
        if (transcript.length > RAG_LIMITS.YOUTUBE_MAX_TRANSCRIPT_LENGTH) {
          console.warn(`Transcript is too long (${transcript.length} chars), truncating to ${RAG_LIMITS.YOUTUBE_MAX_TRANSCRIPT_LENGTH} characters.`);
          transcript = transcript.substring(0, RAG_LIMITS.YOUTUBE_MAX_TRANSCRIPT_LENGTH);
        }
      }
    } catch {
      console.log("📝 No transcript available, using description only");
    }

    // Format duration
    const duration = typeof videoDetails.duration === 'number' 
      ? `${Math.floor(videoDetails.duration / 60)}:${String(videoDetails.duration % 60).padStart(2, '0')}`
      : 'Unknown';

    // Combine available content
    const contentParts = [
      `Title: ${title}`,
      description ? `Description: ${description}` : '',
      transcript ? `Transcript: ${transcript}` : '',
      `Video URL: ${url}`,
      `Video ID: ${videoId}`,
      `Duration: ${duration}`,
      `Channel: ${videoDetails.channel?.name || 'Unknown'}`
    ].filter(Boolean);

    const pageContent = contentParts.join('\n\n');

    if (!pageContent.trim()) {
      throw new Error('No content could be extracted from the YouTube video');
    }

    console.log(`📄 Extracted ${pageContent.length} characters from YouTube video`);

    // Create document from extracted content
    const doc = new Document({
      pageContent,
      metadata: { 
        source: "youtube", 
        url,
        videoId,
        title,
        channel: videoDetails.channel?.name || 'Unknown',
        duration,
        hasTranscript: transcript.length > 0
      },
    });

    // Split document
    const splitDocs = await textSplitter.splitDocuments([doc]);
    
    console.log(`📖 Created ${splitDocs.length} chunks from YouTube video`);

    // Check chunk limit
    if (splitDocs.length > RAG_LIMITS.YOUTUBE_MAX_CHUNKS) {
      console.warn(`YouTube video has ${splitDocs.length} chunks, limiting to ${RAG_LIMITS.YOUTUBE_MAX_CHUNKS} chunks to prevent API overload.`);
      const limitedDocs = splitDocs.slice(0, RAG_LIMITS.YOUTUBE_MAX_CHUNKS);
      
      await QdrantVectorStore.fromDocuments(
        limitedDocs,
        embeddings,
        {
          client: createQdrantClient(),
          collectionName,
        }
      );

      return {
        success: true,
        documentsCount: limitedDocs.length,
        collectionName,
        sourceUrl: url,
        title,
        hasTranscript: transcript.length > 0,
        warning: `Content was truncated to ${RAG_LIMITS.YOUTUBE_MAX_CHUNKS} chunks to prevent API overload.`,
      };
    }

    // Create vector store
    await QdrantVectorStore.fromDocuments(
      splitDocs,
      embeddings,
      {
        client: createQdrantClient(),
        collectionName,
      }
    );

    return {
      success: true,
      documentsCount: splitDocs.length,
      collectionName,
      sourceUrl: url,
      title,
      hasTranscript: transcript.length > 0
    };
  } catch (error) {
    console.error("YouTube indexing error:", error);
    throw new Error(`Failed to index YouTube video: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

function extractYouTubeVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}