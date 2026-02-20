# AI Notes

A modern, AI-powered note-taking application built with the T3 stack philosophy. Create, organize, and enhance your notes with powerful AI features.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5=flat-square&logo=typescript)
![Tailwind CSS](https://img.6-blue?style.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwind-css)

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

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Next.js)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │   Pages  │  │Components│  │  Hooks   │  │  API Client  │   │
│  │ /notes   │  │ NoteEditor│  │ useNotes │  │   (Axios)    │   │
│  │ /notes/id│  │ NoteCard  │  │   useAI  │  │ + interceptors│  │
│  └────┬─────┘  └──────────┘  └────┬─────┘  └──────┬───────┘   │
│       │                           │                │            │
│       └───────────────────────────┼────────────────┘            │
│                                   │                              │
│                          ┌────────▼────────┐                    │
│                          │   Clerk Auth    │                    │
│                          │ (Middleware.ts) │                    │
│                          └────────┬────────┘                    │
└───────────────────────────────────┼───────────────────────────────┘
                                    │ JWT Token
                                    ▼
┌───────────────────────────────────────────────────────────────────┐
│                        SERVER (Hono)                              │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────────┐   │
│  │  Auth Middle   │  │   Routes       │  │    AI Service   │   │
│  │ (Clerk Verify) │─▶│ /notes/*       │─▶│  (Grok API)     │   │
│  └────────────────┘  │ /ai/*          │  └─────────────────┘   │
│                      └───────┬────────┘                         │
│                              │                                    │
│                      ┌───────▼────────┐                         │
│                      │   MongoDB      │                         │
│                      │   (Mongoose)   │                         │
│                      └────────────────┘                         │
└──────────────────────────────────────────────────────────────────┘
```

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

## 💻 Code Logic & Methodology

### 1. Authentication Flow

The application uses **Clerk** for authentication with a dual-layer approach:

#### Client-Side (middleware.ts)
```typescript
// Protects routes at the edge
const isProtectedRoute = createRouteMatcher(['/notes(.*)']);

export default clerkMiddleware((auth, request) => {
  if (isProtectedRoute(request)) {
    auth().protect();  // Redirects to sign-in if unauthenticated
  }
});
```

#### Server-Side (middleware/auth.ts)
```typescript
// Verifies JWT token for API requests
export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const token = authHeader?.slice(7);  // Extract Bearer token
  
  const payload = await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY });
  const userId = payload.sub;  // Clerk user ID
  c.set('userId', userId);      // Attach to request context
  
  await next();
});
```

#### API Client Interceptor (lib/api.ts)
```typescript
// Automatically attaches token to every request
api.interceptors.request.use(async (config) => {
  const token = await tokenGetter?.();  // Get token from Clerk
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

**Flow:**
1. User signs in via Clerk → receives JWT token
2. Token stored in browser by Clerk SDK
3. Middleware protects `/notes` routes
4. API interceptor attaches token to all Axios requests
5. Server validates token and extracts `userId`

### 2. Data Model & Database

#### MongoDB Schema (models/Note.ts)
```typescript
const noteSchema = new Schema({
  userId: { type: String, required: true, index: true },  // Clerk user ID
  title: { type: String, default: 'Untitled' },
  content: { type: String, default: '' },                 // HTML from Tiptap
  summary: { type: String, default: '' },                  // AI-generated summary
  tags: { type: [String], default: [] },                  // AI-generated tags
  isPinned: { type: Boolean, default: false },
  aiOutputs: [aiOutputSchema],                             // History of AI operations
}, { timestamps: true });
```

**Key Design Decisions:**
- `userId` indexed for fast user-specific queries
- `aiOutputs` stored as embedded array for history tracking
- Timestamps enabled for auto-sorting by update time

### 3. Notes API Logic

#### Notes Route (routes/notes.ts)

**GET /notes - Fetch user's notes with search:**
```typescript
notesRouter.get('/', async (c) => {
  const userId = c.get('userId');  // From auth middleware
  const search = c.req.query('search')?.trim();
  
  const query: { userId: string; $or?: Array<Record<string, unknown>> } = { userId };
  
  if (search) {
    // Regex search on title and tags
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { tags: { $elemMatch: { $regex: search, $options: 'i' } } }
    ];
  }
  
  const notes = await Note.find(query).sort({ updatedAt: -1 });
  return c.json(notes);
});
```

**POST /notes/:id/ai-output - Save AI results:**
```typescript
notesRouter.post('/:id/ai-output', async (c) => {
  const note = await Note.findOne({ _id: id, userId });
  
  // Prepend new output (most recent first)
  note.aiOutputs.unshift({
    originalInput,
    feature,
    output,
    createdAt: new Date()
  });
  
  await note.save();
  return c.json(note);
});
```

### 4. React Hooks Architecture

#### useNotes Hook (hooks/use-notes.ts)
```typescript
export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch all notes (with optional search)
  const fetchNotes = useCallback(async (search?: string) => {
    const response = await api.get<Note[]>('/notes', { params: { search } });
    setNotes(response.data);
  }, []);

  // Create new note and navigate to editor
  const createNote = useCallback(async () => {
    const response = await api.post<Note>('/notes', { title: 'Untitled', content: '' });
    return response.data;
  }, []);

  // Update with debouncing handled by caller
  const updateNote = useCallback(async (id: string, payload: Partial<Note>) => {
    const response = await api.put<Note>(`/notes/${id}`, payload);
    return response.data;
  }, []);

  return { notes, loading, fetchNotes, getNote, createNote, updateNote, deleteNote };
}
```

**Usage Pattern:**
- Notes page calls `fetchNotes()` on mount
- Editor page calls `getNote(id)` to load single note
- Auto-save in editor uses 1.5s debounce before calling `updateNote()`

#### useAI Hook (hooks/use-ai.ts)
```typescript
export function useAI() {
  // Process content with selected AI feature
  const process = async (payload: {
    content: string;      // Plain text from editor
    feature: AIFeature;  // Which AI operation
    language?: string;    // For translate
    format?: string;     // For change_format
    question?: string;   // For answer_question
  }): Promise<string> => {
    const response = await api.post('/ai/process', payload);
    return response.data.output;
  };

  // Generate tags from title + content
  const generateTags = async (title: string, content: string): Promise<string[]> => {
    const response = await api.post('/ai/tags', { title, content });
    return response.data.tags;
  };

  return { process, generateTags, /* loading states */ };
}
```

### 5. Rich Text Editor Implementation

#### NoteEditor Component (components/note-editor.tsx)

**Tiptap Setup:**
```typescript
const editor = useEditor({
  extensions: [
    StarterKit,                    // Basic editing features
    Placeholder.configure({        // Placeholder text
      placeholder: 'Start writing your note...'
    })
  ],
  content: '',
  onUpdate: ({ editor }) => {
    setContentHtml(editor.getHTML());  // Save as HTML
  },
  editorProps: {
    attributes: {
      class: 'min-h-[360px] rounded-lg border...'  // Tailwind classes
    }
  }
});
```

**Auto-Save Logic:**
```typescript
useEffect(() => {
  if (!note || !editor || firstRender.current) return;

  const timer = setTimeout(async () => {
    setSaveState('saving');
    const updated = await updateNote(note._id, {
      title: watchedTitle,
      content: contentHtml
    });
    setSaveState('saved');
    setTimeout(() => setSaveState('idle'), 900);
  }, 1500);  // 1.5s debounce

  return () => clearTimeout(timer);
}, [watchedTitle, contentHtml]);
```

**AI Feature Handling:**
```typescript
const handleRunFeature = async () => {
  const plainText = editor?.getText() || '';  // Get plain text for AI
  
  const output = await process({
    content: plainText,
    feature: selectedFeature,
    language: targetLanguage,
    format: targetFormat,
    question: question
  });

  if (selectedFeature === 'improve') {
    // Replace editor content with improved version
    editor.commands.setContent(`<p>${output.replace(/\n/g, '</p><p>')}</p>`);
  }

  if (selectedFeature === 'summarize') {
    // Save as note summary
    await updateNote(note._id, { summary: output });
  }
};
```

### 6. AI Integration Logic

#### Server AI Routes (routes/ai.ts)

**Unified Process Endpoint:**
```typescript
aiRouter.post('/process', zValidator('json', processSchema), async (c) => {
  const { content, feature, language, format, question } = c.req.valid('json');

  // Feature-specific prompts
  const promptByFeature: Record<typeof feature, string> = {
    summarize: `Summarize this content in 2-3 concise sentences:\n\n${content}`,
    rewrite: `Rewrite this content clearly while preserving meaning:\n\n${content}`,
    translate: `Translate this content to ${language}:\n\n${content}`,
    improve: `Improve grammar, clarity, and flow:\n\n${content}`,
    // ... more features
    answer_question: `Using only this content, answer:\nQuestion: ${question}\n\nContent:\n${content}`
  };

  const output = await askGrok(promptByFeature[feature]);
  return c.json({ feature, output });
});
```

#### Grok API Integration (lib/grok.ts)
```typescript
export async function askGrok(prompt: string): Promise<string> {
  const response = await fetch(`${env.AI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.AI_API_KEY}`
    },
    body: JSON.stringify({
      model: env.AI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2  // Low temperature for consistent results
    })
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}
```

**AI Features Implemented:**
| Feature | Prompt Strategy |
|---------|-----------------|
| summarize | 2-3 sentence summary |
| rewrite | Clear rephrasing |
| explain | Simple explanation |
| organize | Section headings + bullets |
| translate | Target language insertion |
| improve | Grammar + clarity + vocabulary |
| change_format | Target format conversion |
| main_theme | Theme identification |
| detect_tone | Tone analysis + justification |
| key_points | Bullet point extraction |
| answer_question | Q&A based on content |

### 7. State Management Pattern

The app uses **React hooks + Context** for state management:

```typescript
// Each feature has its own hook
const { notes, loading, fetchNotes, createNote, deleteNote } = useNotes();
const { process, processLoading, generateTags, tagsLoading } = useAI();

// Local state for UI
const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
const [selectedFeature, setSelectedFeature] = useState<AIFeature>('summarize');
```

**Benefits:**
- Separation of concerns (API logic in hooks, UI logic in components)
- Easy to test and reuse
- No external state library needed

## 📖 API Endpoints

### Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notes` | Get all user notes (supports ?search= query) |
| POST | `/notes` | Create a new note |
| GET | `/notes/:id` | Get a specific note |
| PUT | `/notes/:id` | Update a note |
| DELETE | `/notes/:id` | Delete a note |
| POST | `/notes/:id/ai-output` | Save AI output to history |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/summarize` | Summarize content |
| POST | `/ai/improve` | Improve writing |
| POST | `/ai/tags` | Generate tags |
| POST | `/ai/process` | Process with any AI feature |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |

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

## 📝 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

