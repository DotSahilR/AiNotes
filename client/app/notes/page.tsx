'use client';

import { FileX, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

import Navbar from '@/components/navbar';
import NoteCard from '@/components/note-card';
import SearchBar from '@/components/search-bar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotes } from '@/hooks/use-notes';

export default function NotesPage(): JSX.Element {
  const router = useRouter();
  const { notes, loading, fetchNotes, createNote, deleteNote } = useNotes();

  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes]);

  const onSearch = useCallback(
    (value: string) => {
      void fetchNotes(value);
    },
    [fetchNotes]
  );

  const onNewNote = async (): Promise<void> => {
    const note = await createNote();
    if (note) router.push(`/notes/${note._id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <SearchBar onSearch={onSearch} />
          <Button onClick={() => void onNewNote()} className="whitespace-nowrap">
            <Plus className="mr-2 h-4 w-4" />
            New Note
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Card key={idx} className="space-y-3 p-4">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </Card>
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-dashed">
            <FileX className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="font-medium">No notes found</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <NoteCard key={note._id} note={note} onDelete={deleteNote} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
