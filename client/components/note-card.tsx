'use client';

import { formatDistanceToNow } from 'date-fns';
import { Pin, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Note } from '@/types';

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => Promise<void>;
}

const stripHtml = (html: string): string => html.replace(/<[^>]+>/g, '').trim();

export default function NoteCard({ note, onDelete }: NoteCardProps): JSX.Element {
  const router = useRouter();
  const preview = stripHtml(note.content);

  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => router.push(`/notes/${note._id}`)}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-base font-semibold">{note.title || 'Untitled'}</h3>
          {note.isPinned && <Pin className="h-4 w-4 text-amber-500" />}
        </div>

        <p className="line-clamp-3 text-sm text-muted-foreground">{preview.length > 120 ? `${preview.slice(0, 120)}...` : preview || 'Empty note'}</p>

        <div className="flex flex-wrap gap-1">
          {note.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="lowercase">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Updated {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</p>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Delete this note?')) {
                void onDelete(note._id);
              }
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
