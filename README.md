# Auralux Multimodal AI

A powerful AI assistant that combines text and image processing capabilities with a comprehensive suite of tools for enhanced productivity and creativity.

## 🚀 Features

- **Multimodal AI**: Process both text and images in a single conversation
- **Real-time Streaming**: Get instant responses with streaming UI updates
- **Comprehensive Tool Suite**: Access to weather, search, charts, audio, video, and document tools
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

### 4. Image Analysis Tool
Analyze and process uploaded images with AI.

**Example:**
```
Upload an image and ask: "What objects do you see in this image?"
```

**Features:**
- Object detection and recognition
- Image description and analysis
- Visual question answering

### 5. Audio Tool
Process and analyze audio content.

**Example:**
```
"Generate audio from this text: 'Hello, welcome to Auralux AI'"
```

**Features:**
- Text-to-speech conversion
- Audio processing capabilities

### 6. Video Tool
Handle video-related tasks and processing.

**Example:**
```
"Search for videos about machine learning tutorials"
```

**Features:**
- Video search and recommendations
- Video content analysis

### 7. Document Tool
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
   TAVILY_API_KEY=your_tavily_api_key_here
   WEATHER_API_KEY=your_weather_api_key_here
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
- **AI Provider**: OpenAI GPT-4 Turbo
- **UI Components**: Lucide React, Sonner (toasts)
- **Charts**: Chart.js
- **Package Manager**: pnpm

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for AI model access | Yes |
| `TAVILY_API_KEY` | Tavily API key for web search | No |
| `WEATHER_API_KEY` | Weather API key for weather data | No |

### API Keys Setup

1. **OpenAI API Key**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Tavily API Key**: Get from [Tavily](https://tavily.com/) for enhanced web search
3. **Weather API Key**: Get from [WeatherAPI.com](https://www.weatherapi.com/) for weather data
