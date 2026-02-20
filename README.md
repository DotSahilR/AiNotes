# AI Notes

A modern, AI-powered note-taking application built with the T3 stack philosophy. Create, organize, and enhance your notes with powerful AI features.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwind-css)

## ✨ Features

### Core Note-Taking
- **Rich Text Editor** - Powered by Tiptap for a seamless writing experience
- **Auto-Save** - Notes are automatically saved as you type
- **Search** - Quickly find notes by title or content
- **Tag System** - Organize notes with custom tags

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
| Technology | Purpose |
|------------|---------|
| [Next.js 14](https://nextjs.org/) | React framework with App Router |
| [React 18](https://react.dev/) | UI library |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | Styling |
| [Tiptap](https://tiptap.dev/) | Rich text editor |
| [Clerk](https://clerk.com/) | Authentication |
| [Radix UI](https://www.radix-ui.com/) | Accessible UI components |
| [Lucide React](https://lucide.dev/) | Icons |
| [Sonner](https://sonner.emilkowal.ski/) | Toast notifications |

### Server
| Technology | Purpose |
|------------|---------|
| [Hono](https://hono.dev/) | Lightweight web framework |
| [Node.js](https://nodejs.org/) | JavaScript runtime |
| [MongoDB](https://www.mongodb.com/) | Database |
| [Mongoose](https://mongoosejs.com/) | ODM for MongoDB |
| [Clerk](https://clerk.com/) | Authentication |
| [Zod](https://zod.dev/) | Schema validation |

### AI
| Technology | Purpose |
|------------|---------|
| [Grok](https://x.ai/) | AI model for content generation |

## 📁 Project Structure

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

## 📖 API Endpoints

### Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notes` | Get all user notes |
| POST | `/notes` | Create a new note |
| GET | `/notes/:id` | Get a specific note |
| PUT | `/notes/:id` | Update a note |
| DELETE | `/notes/:id` | Delete a note |
| POST | `/notes/:id/ai-output` | Save AI output |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/summarize` | Summarize content |
| POST | `/ai/improve` | Improve writing |
| POST | `/ai/tags` | Generate tags |
| POST | `/ai/process` | Process with any AI feature |

## 🎨 Design System

### Colors
The app uses CSS custom properties for theming:
- Background (`--background`)
- Foreground (`--foreground`)
- Primary accent (`--primary`)
- Secondary (`--secondary`)
- Muted (`--muted`)
- Border (`--border`)

### Components
- Button, Card, Input, Textarea
- Dialog, Dropdown Menu
- Avatar, Badge, Separator
- Skeleton loaders

## 🔐 Authentication

The app uses Clerk for authentication:
- Sign in / Sign up pages are automatically generated
- Protected routes redirect unauthenticated users
- User ID is used to associate notes in the database

## 📝 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

