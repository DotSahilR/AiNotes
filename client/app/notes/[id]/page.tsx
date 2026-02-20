import NoteEditor from '@/components/note-editor';

export default function NoteEditorPage({ params }: { params: { id: string } }): JSX.Element {
  return <NoteEditor noteId={params.id} />;
}
