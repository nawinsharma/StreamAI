# Auralux Multimodal AI

A powerful AI assistant that combines text and image processing capabilities with a comprehensive suite of tools for enhanced productivity and creativity.

## 🚀 Features

- **Multimodal AI**: Process both text and images in a single conversation
- **Real-time Streaming**: Get instant responses with streaming UI updates
- **Comprehensive Tool Suite**: Access to weather, search, charts, audio, video, and document tools
- **Image Storage**: Cloudinary integration for persistent image storage and retrieval
- **Modern UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS
- **Error Handling**: Robust error handling with user-friendly messages
- **File Upload**: Support for image uploads (JPEG, PNG, GIF, WebP) up to 1MB

## 🛠️ Available Tools

### 1. Weather Tool
Get current weather information for any city worldwide.

**Example:**
```
"What's the weather like in New York?"
```

**Features:**
- Current temperature (Celsius/Fahrenheit)
- Weather conditions and icons
- Wind speed and direction
- Humidity and pressure
- UV index and visibility

### 2. Web Search Tool
Search the web for real-time information using Tavily API.

**Example:**
```
"Search for the latest news about AI developments"
```

**Features:**
- Real-time web search results
- Top relevant results
- Comprehensive information gathering

### 3. Chart Generation Tool
Create beautiful, interactive charts from your data.

**Example:**
```
"Create a bar chart showing monthly sales: January 100, February 150, March 200"
```

**Supported Chart Types:**
- Bar charts
- Line charts
- Pie charts
- Scatter plots
- Bubble charts
- Doughnut charts
- Polar area charts
- Radar charts

### 4. Image Generation Tool
Generate AI images based on text prompts using Google AI Gemini with Cloudinary storage.

**Example:**
```
"Generate an image of a futuristic city skyline"
```

**Features:**
- AI-powered image generation using Google AI Gemini
- Creative text-to-image conversion with enhanced prompts
- Cloudinary cloud storage for persistence
- Images saved in chat history for later viewing
- Automatic image optimization and delivery
- Beautiful placeholder images with gradient designs
- Multiple color schemes and visual effects

### 5. Image Analysis Tool
Analyze and process uploaded images with AI.

**Example:**
```
Upload an image and ask: "What objects do you see in this image?"
```

**Features:**
- Object detection and recognition
- Image description and analysis
- Visual question answering

### 6. Audio Tool
Process and analyze audio content.

**Example:**
```
"Generate audio from this text: 'Hello, welcome to Auralux AI'"
```

**Features:**
- Text-to-speech conversion
- Audio processing capabilities

### 7. Video Tool
Handle video-related tasks and processing.

**Example:**
```
"Search for videos about machine learning tutorials"
```

**Features:**
- Video search and recommendations
- Video content analysis

### 8. Document Tool
Process and analyze document content.

**Example:**
```
"Summarize this document" (with document upload)
```

**Features:**
- Document text extraction
- Content summarization
- Document analysis

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- OpenAI API key
- Google AI API key (for image generation)
- Optional: Tavily API key for web search
- Optional: Weather API key for weather data

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd auralux-multimodal-ai
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   GOOGLE_AI_API_KEY=your_google_ai_api_key_here
   TAVILY_API_KEY=your_tavily_api_key_here
   WEATHER_API_KEY=your_weather_api_key_here
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main chat interface
│   ├── actions.tsx        # AI actions and message handling
│   ├── server.tsx         # Server-side utilities
│   └── layout.tsx         # App layout
├── components/            # React components
│   ├── message/           # Message components
│   ├── ui/                # UI components (weather, charts, etc.)
│   └── use-scroll-to-bottom.tsx
├── lib/                   # Core libraries and utilities
│   ├── tools/             # AI tools implementation
│   │   ├── weather.tsx    # Weather tool
│   │   ├── search.tsx     # Web search tool
│   │   ├── chart.tsx      # Chart generation tool
│   │   ├── image.tsx      # Image analysis tool
│   │   ├── audio.tsx      # Audio processing tool
│   │   ├── video.tsx      # Video handling tool
│   │   └── document.tsx   # Document processing tool
│   ├── graph.ts           # LangGraph workflow
│   ├── error-handler.ts   # Error handling utilities
│   └── utils.ts           # General utilities
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI Framework**: LangChain, LangGraph
- **AI Provider**: OpenAI GPT-4 Turbo (text), Google AI Gemini (images - placeholder)
- **UI Components**: Lucide React, Sonner (toasts)
- **Charts**: Chart.js
- **Package Manager**: pnpm

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for AI model access | Yes |
| `GOOGLE_AI_API_KEY` | Google AI API key for image generation (placeholder) | No |
| `TAVILY_API_KEY` | Tavily API key for web search | No |
| `WEATHER_API_KEY` | Weather API key for weather data | No |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for image storage | No |
| `CLOUDINARY_API_KEY` | Cloudinary API key for image storage | No |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret for image storage | No |

### API Keys Setup

1. **OpenAI API Key**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Google AI API Key**: Get from [Google AI Studio](https://aistudio.google.com/) (currently placeholder for image generation)
3. **Tavily API Key**: Get from [Tavily](https://tavily.com/) for enhanced web search
4. **Weather API Key**: Get from [WeatherAPI.com](https://www.weatherapi.com/) for weather data
5. **Cloudinary Setup**: Get from [Cloudinary](https://cloudinary.com/) for image storage
   - Sign up for a free Cloudinary account
   - Get your Cloud Name, API Key, and API Secret from your dashboard
   - Add them to your `.env.local` file for persistent image storage

### Note on Image Generation

The image generation feature now uses Google AI Gemini for creative text-to-image conversion. The implementation includes:

- **Gemini Integration**: Uses Google AI Gemini 1.5 Pro for enhanced prompt processing
- **Creative Enhancement**: Generates detailed descriptions and visual concepts
- **Beautiful Placeholders**: Creates sophisticated SVG images with gradients and effects
- **Cloudinary Storage**: Automatically uploads and stores images for persistence
- **Chat History**: Images are saved and regenerated when revisiting conversations

For production use with actual image generation, you may want to:
- Integrate with OpenAI DALL-E for photorealistic images
- Use Stable Diffusion API for artistic images
- Implement Google's Imagen when it becomes available
- Add more sophisticated image generation services

### Image Storage with Cloudinary

When image generation is properly implemented, images will be:
- Generated using AI services
- Automatically uploaded to Cloudinary for persistent storage
- Stored in the chat history as JSON data
- Regenerated when users refresh the page or revisit chat history
- Optimized and delivered through Cloudinary's CDN
