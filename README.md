## StreamAI —  AI Chat

StreamAI is a Next.js 15 app that blends fast, streaming AI chat with personal long‑term memory and Retrieval‑Augmented Generation (RAG). Bring your own data from PDFs, websites, text, and YouTube; index it into Qdrant; and chat with it using Google Generative AI embeddings. It features Google login, persistent chat history, code/maths rendering, and an ergonomic UI.

### Key Features
- **Streaming chat UX**: Low‑latency, incremental responses with a virtualized message list for smooth long threads.
- **BYO data (RAG mode)**: Upload PDFs and text, crawl websites, or pull YouTube transcripts. Indexed to Qdrant for semantic retrieval.
- **Personal memory**: Optional Mem0 memory integration to remember preferences, facts, and context across chats.
- **Rich messages**: Code blocks with syntax highlighting, KaTeX math, inline images, and attachments.
- **Auth & security**: Better Auth with Google provider; per‑user collections, chats, and ACL checks.
- **Modern stack**: Next.js 15, React 19, Tailwind v4, Prisma 6, Postgres, Qdrant, AI SDK.

### Why StreamAI over generic AI chat apps?
- **Your data, first‑class**: Native RAG across PDFs, websites, text, and YouTube—not just file uploads.
- **Search that cites**: Retrieval metadata is preserved for transparency and debugging.
- **Long‑term memory**: Mem0 integration augments assistant behavior beyond a single session.
- **Developer‑friendly**: Clear server actions, typed schemas, and modular libs for rapid extension.
- **Production‑ready plumbing**: Prisma models, auth, vector store wiring, and clean UI out of the box.

## Tech Stack
- **Web**: Next.js 15, React 19, Tailwind v4, Radix UI, Zustand
- **AI**: AI SDK with Google Generative AI, `@langchain/*`, Google embeddings
- **RAG**: Qdrant (JS client), chunking/indexing pipelines
- **DB**: Prisma 6 with PostgreSQL
- **Auth**: Better Auth (Google OAuth)
- **Storage/Media**: Cloudinary (optional)

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Qdrant (managed or self‑hosted)

### 1) Clone and install
```bash
git clone https://github.com/your-org/streamai.git
cd streamai
bun install  # or npm install / bun install / yarn
```

### 2) Environment variables
Create `.env` with the following (set values as applicable):
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/streamai"

# Auth (Better Auth)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
BETTER_AUTH_URL="http://localhost:3000"  # public URL of the app (prod: https://yourdomain)

# AI / Embeddings (Google Generative AI)
GOOGLE_API_KEY="..."  # any of these keys are supported in code paths
# GOOGLE_AI_API_KEY=...
# GOOGLE_GENERATIVE_AI_API_KEY=...
# GEMINI_API_KEY=...

# Vector DB (Qdrant)
QDRANT_URL="http://localhost:6333"
QDRANT_API_KEY=""  # set if your Qdrant requires auth

# Optional: Cloudinary for media
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Optional: Weather tool
WEATHER_API_KEY="..."

# Optional: Mem0 memory
MEM0_API_KEY="..."
```

Notes:
- The app checks multiple Google key env names; providing any one is sufficient.
- Cloudinary, Weather, and Mem0 are optional; affected features gracefully no‑op if unset.

### 3) Database setup
```bash
bun run prisma:generate
bun run prisma:migrate  # or: bun db:push
```

### 4) Run the app
```bash
bun dev
# visit http://localhost:3000
```

## Core Concepts

### Chats
- Stored in Postgres via Prisma (`User`, `Chat`, `Message`).
- Streaming responses with a virtualized list for performance.

### RAG Mode
- Create per‑user `RagCollection`s from PDFs, websites, text, or YouTube.
- Content is chunked, embedded with Google embeddings, and indexed into Qdrant.
- Chat with a collection via `RagChat` and `RagMessage` records; sources can be attached to responses.

### Memory (optional)
- If `MEM0_API_KEY` is set, the app writes durable facts/preferences to Mem0 and reads them to personalize replies.

## Project Structure
```text
/src
  app/               # Next.js routes and server actions
  components/        # UI components (chat, sidebar, RAG modal, etc.)
  lib/               # AI, RAG, Prisma, auth, utilities
  stores/            # Zustand stores
  types/             # Shared types
/prisma              # Prisma schema and migrations
```

## Scripts
```bash
bun dev            # start dev server (Next.js turbopack)
bun build          # prisma generate + next build
bun start          # start production server
bun prisma:migrate # run Prisma migrations
bun prisma:studio  # open Prisma Studio
```

## Deployment
- Works great on Vercel or any Node host.
- Set all required environment variables in your hosting provider.
- Ensure your `BETTER_AUTH_URL` (or public URL) matches the deployed domain.

## Security & Privacy
- Per‑user isolation for chats and RAG collections.
- Do not commit `.env`. Rotate keys regularly. Use least‑privilege keys for Qdrant and Cloudinary.

## Troubleshooting
- Missing keys: features log warnings and skip optional integrations.
- Qdrant connection: verify `QDRANT_URL` and `QDRANT_API_KEY` and that collections are created.
- DB migrations: run `bun prisma:migrate` after schema changes.

## License
MIT