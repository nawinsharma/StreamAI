# Multimodal AI Chat Application

A modern, full-stack AI chat application built with Next.js, featuring multimodal capabilities, real-time streaming, and comprehensive context window maintenance. **Authentication required for all features.**

## Features

- 🤖 **AI Chat with Context Window**: Maintains full conversation history for contextual responses
- 🖼️ **Multimodal Support**: Upload and analyze images, documents, and files
- 🌤️ **Weather Integration**: Built-in weather tool for location-based queries
- 🔄 **Real-time Streaming**: Instant, streaming AI responses
- 👤 **User Authentication**: Secure user management with session handling
- 📱 **Responsive Design**: Modern, mobile-friendly UI
- 🎨 **Dark/Light Mode**: Beautiful, accessible interface
- 🔒 **Secure**: Authentication required for all operations

## Context Window Implementation

The application maintains conversation context through the following architecture:

### Database Schema
- **Chats**: Store conversation metadata and user associations
- **Messages**: Store individual user and AI messages with timestamps
- **Attachments**: Handle file uploads and metadata

### Context Flow
1. **Chat Creation**: Each conversation gets a unique chat ID
2. **Message Storage**: All messages are persisted to the database
3. **Context Retrieval**: When sending a new message, the system fetches all previous messages
4. **AI Context**: The full conversation history is sent to the AI model for contextual responses
5. **Message Persistence**: New messages are saved to maintain future context

### Key Components
- `src/lib/ai-chat-handler.ts`: Core logic for context management and AI communication
- `src/app/api/chat/route.ts`: API endpoint that handles context retrieval
- `src/hooks/use-chat.ts`: Frontend hook for chat state management
- `src/app/chat/[chatId]/page.tsx`: Individual chat page with full context

### Context Maintenance Features
- ✅ **Full History**: Complete conversation history is maintained
- ✅ **Multimodal Context**: Images and documents are included in context
- ✅ **Session Persistence**: Context survives page refreshes and navigation
- ✅ **User Isolation**: Each user's conversations are properly isolated
- ✅ **Performance Optimized**: Efficient database queries for context retrieval
- ✅ **Authentication Required**: All operations require user authentication

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **AI**: Google Gemini AI SDK
- **Authentication**: NextAuth.js
- **File Storage**: Cloudinary
- **Deployment**: Vercel

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd multimodel-stream
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `GOOGLE_AI_API_KEY`: Google AI API key
   - `NEXTAUTH_SECRET`: NextAuth.js secret
   - `NEXTAUTH_URL`: Your application URL
   - `CLOUDINARY_URL`: Cloudinary configuration

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Authentication
1. Visit the homepage
2. Click "Sign In to Continue"
3. Create an account or sign in with existing credentials
4. Start chatting with full context maintenance

### Starting a Conversation
1. After signing in, type your first message
2. The system automatically creates a chat session
3. All subsequent messages maintain context

### Uploading Files
1. Click the attachment button
2. Select an image or document
3. The file is processed and included in the conversation context
4. Ask questions about the uploaded content

### Weather Queries
- Ask for weather in any city: "What's the weather in New York?"
- The system automatically detects location queries
- Weather data is fetched and displayed in a card format

### Context Examples
```
User: "Hello, my name is John"
AI: "Hello John! Nice to meet you. How can I help you today?"

User: "What did I just tell you my name was?"
AI: "You just told me your name is John."
```

## API Endpoints

- `POST /api/chat`: Send messages with context maintenance (requires auth)
- `POST /api/chats`: Create new chat sessions (requires auth)
- `GET /api/chats/[id]`: Retrieve chat with full message history (requires auth)
- `POST /api/upload`: Handle file uploads (requires auth)
- `GET /api/chats`: List user's chat history (requires auth)

## Development

### Project Structure
```
src/
├── app/                 # Next.js app router
│   ├── api/            # API routes
│   └── chat/           # Chat pages
├── components/         # React components
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries
├── types/             # TypeScript type definitions
└── context/           # React context providers
```

### Key Files for Context Implementation
- `src/lib/ai-chat-handler.ts`: Core AI and context logic
- `src/app/api/chat/route.ts`: Chat API with context retrieval
- `src/hooks/use-chat.ts`: Frontend chat state management
- `prisma/schema.prisma`: Database schema for messages and chats

## Security

- **Authentication Required**: All chat operations require user authentication
- **User Isolation**: Each user can only access their own chats and messages
- **Session Management**: Secure session handling with NextAuth.js
- **API Protection**: All API endpoints validate user authentication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
