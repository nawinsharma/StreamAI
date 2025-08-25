import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { Document } from "@langchain/core/documents";
import axios from "axios";
import { parse } from "node-html-parser";
import { Innertube } from "youtubei.js";

// Validate Google API key
const validateGoogleAPIKey = () => {
  const apiKeys = [
    process.env.GOOGLE_API_KEY,
    process.env.GOOGLE_AI_API_KEY,
    process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    process.env.GEMINI_API_KEY
  ];
  
  const validKey = apiKeys.find(key => key && key.length > 0);
  
  if (!validKey) {
    throw new Error('No valid Google API key found. Please set one of: GOOGLE_API_KEY, GOOGLE_AI_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY, or GEMINI_API_KEY');
  }
  
  return validKey;
};

const GOOGLE_API_KEY = validateGoogleAPIKey();

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: GOOGLE_API_KEY,
  model: "models/embedding-001",
});

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

export const indexPdf = async (file: File, collectionName: string) => {
  try {
    // Load PDF
    const loader = new PDFLoader(file);
    const docs = await loader.load();

    // Split documents
    const splitDocs = await textSplitter.splitDocuments(docs);

    // Create vector store
    await QdrantVectorStore.fromDocuments(
      splitDocs,
      embeddings,
      {
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_API_KEY,
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
    const pageText = bodyElement ? bodyElement.innerText.replace(/\s+/g, ' ').trim() : '';
    
    // Get title
    const titleElement = root.querySelector('title');
    const title = titleElement ? titleElement.innerText : 'Untitled Page';
    
    if (!pageText) {
      throw new Error('No content found on the page');
    }

    console.log(`📄 Extracted ${pageText.length} characters from: ${title}`);

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

    // Create vector store
    await QdrantVectorStore.fromDocuments(
      splitDocs,
      embeddings,
      {
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_API_KEY,
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
    // Create document from text
    const doc = new Document({
      pageContent: text,
      metadata: { title, source: "text_input" },
    });

    // Split document
    const splitDocs = await textSplitter.splitDocuments([doc]);

    // Create vector store
    await QdrantVectorStore.fromDocuments(
      splitDocs,
      embeddings,
      {
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_API_KEY,
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

    // Create vector store
    await QdrantVectorStore.fromDocuments(
      splitDocs,
      embeddings,
      {
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_API_KEY,
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