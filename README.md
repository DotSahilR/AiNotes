# AI Notes

A modern, AI-powered note-taking application built with the T3 stack philosophy. Create, organize, and enhance your notes with powerful AI features.

## ✨ Features

### AI-Powered Features
- **Summarize** - Get concise summaries of your notes
- **Rewrite/Paraphrase** - Rephrase content for clarity
- **Explain** - Simplify complex content
- **Organize** - Restructure notes into clear sections with headings
- **Translate** - Translate content to multiple languages
- **Improve Writing** - Enhance grammar, vocabulary, and flow
- **Change Format** - Convert content to different formats (emails, reports, speeches)
- **Identify Main Theme** - Extract the core theme of your content
- **Detect Tone** - Analyze the tone of your writing
- **Extract Key Points** - Get bullet-point summaries
- **Answer Questions** - Ask AI questions based on your notes
- **Auto-Generate Tags** - AI automatically suggests relevant tags
- **AI History** - Track and revisit all AI outputs

### User Experience
- **Dark/Light Theme** - Toggle between themes
- **Responsive Design** - Works on desktop and mobile
- **Authentication** - Secure sign-in with Clerk

## 🛠 Tech Stack

### Client
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Tiptap** - Rich text editor
- **Clerk** - Authentication
- **Radix UI** - Accessible UI components
- **Lucide React** - Icons
- **Sonner** - Toast notifications

### Server
- **Hono** - Lightweight web framework
- **Node.js** - JavaScript runtime
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Clerk** - Authentication
- **Zod** - Schema validation

### AI
- **Grok** - AI model for content generation

## 📂 Project Structure

```
ai-notes/
├── client/                 # Next.js frontend
│   ├── app/               # App Router pages
│   │   ├── notes/         # Notes list page
│   │   ├── notes/[id]/    # Note editor page
│   │   ├── sign-in/      # Clerk sign-in
│   │   └── sign-up/      # Clerk sign-up
│   ├── components/       # React components
│   │   └── ui/           # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── middleware.ts     # Clerk route protection
│   └── types/            # TypeScript types
│
└── server/                # Hono API backend
    └── src/
        ├── routes/       # API routes
        │   ├── notes.ts  # Notes CRUD
        │   └── ai.ts     # AI endpoints
        ├── models/       # Mongoose models
        ├── middleware/   # Auth middleware
        └── lib/          # Utilities (DB, env, Grok)
```





## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Clerk account for authentication
- Grok API key (xAI)

### Installation

1. **Clone the repository**
   ```bash
   cd ai-notes
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd client
   npm install
   ```

4. **Configure environment variables**

   Create `.env` files in both `server/` and `client/` directories:

   **Server `.env`:**
   ```env
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/ai-notes
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLIENT_URL=http://localhost:3000
   AI_API_KEY=your_grok_api_key
   AI_BASE_URL=https://api.x.ai/v1
   AI_MODEL=grok-2-1212
   ```

   **Client `.env.local`:**
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

### Running the Application

1. **Start the server**
   ```bash
   cd server
   npm run dev
   ```
   Server runs on http://localhost:3001

2. **Start the client**
   ```bash
   cd client
   npm run dev
   ```
   Client runs on http://localhost:3000

3. **Open your browser**
   Navigate to http://localhost:3000

