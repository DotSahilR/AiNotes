'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ArrowLeft, Check, Sparkles, Wand2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import AIButton from '@/components/ai-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAI } from '@/hooks/use-ai';
import api from '@/lib/api';
import { useNotes } from '@/hooks/use-notes';
import type { AIFeature, Note } from '@/types';

const titleSchema = z.object({
  title: z.string().min(1)
});

type TitleForm = z.infer<typeof titleSchema>;

type SaveState = 'idle' | 'saving' | 'saved';

const featureOptions: Array<{ value: AIFeature; label: string }> = [
  { value: 'summarize', label: 'Summarize content' },
  { value: 'rewrite', label: 'Rewrite / Paraphrase' },
  { value: 'explain', label: 'Explain clearly' },
  { value: 'organize', label: 'Organize notes' },
  { value: 'translate', label: 'Translate content' },
  { value: 'improve', label: 'Improve writing' },
  { value: 'change_format', label: 'Change format' },
  { value: 'main_theme', label: 'Identify main theme' },
  { value: 'detect_tone', label: 'Detect tone' },
  { value: 'key_points', label: 'Extract key points' },
  { value: 'answer_question', label: 'Answer question' }
];

const featureLabelMap = new Map(featureOptions.map((option) => [option.value, option.label]));

interface NoteEditorProps {
  noteId: string;
}

export default function NoteEditor({ noteId }: NoteEditorProps): JSX.Element {
  const router = useRouter();
  const { getNote, updateNote } = useNotes();
  const { process, processLoading, generateTags, tagsLoading } = useAI();

  const [note, setNote] = useState<Note | null>(null);
  const [contentHtml, setContentHtml] = useState<string>('');
  const [saveState, setSaveState] = useState<SaveState>('idle');

  const [selectedFeature, setSelectedFeature] = useState<AIFeature>('summarize');
  const [targetLanguage, setTargetLanguage] = useState<string>('Spanish');
  const [targetFormat, setTargetFormat] = useState<string>('professional email');
  const [question, setQuestion] = useState<string>('');
  const [latestOutput, setLatestOutput] = useState<string>('');
  const [latestOutputFeature, setLatestOutputFeature] = useState<string>('');

  const firstRender = useRef<boolean>(true);

  const { register, watch, setValue } = useForm<TitleForm>({
    resolver: zodResolver(titleSchema),
    defaultValues: { title: 'Untitled' }
  });

  const watchedTitle = watch('title');
  const safeTags = Array.isArray(note?.tags) ? note.tags : [];
  const safeAiOutputs = Array.isArray(note?.aiOutputs) ? note.aiOutputs : [];

  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder: 'Start writing your note...' })],
    content: '',
    onUpdate: ({ editor: instance }) => setContentHtml(instance.getHTML()),
    editorProps: {
      attributes: {
        class: 'min-h-[360px] rounded-lg border border-border bg-card px-4 py-3 text-base outline-none'
      }
    }
  });

  useEffect(() => {
    const load = async (): Promise<void> => {
      const fetched = await getNote(noteId);
      if (!fetched) {
        router.push('/notes');
        return;
      }

      setNote(fetched);
      setValue('title', fetched.title || 'Untitled');
      setContentHtml(fetched.content || '');
      setLatestOutput(fetched.summary || '');
      setLatestOutputFeature(fetched.summary ? 'Summarize content' : '');
      editor?.commands.setContent(fetched.content || '<p></p>');
      firstRender.current = true;
    };

    void load();
  }, [noteId, getNote, setValue, editor, router]);

  useEffect(() => {
    if (!note || !editor) return;
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      setSaveState('saving');
      const updated = await updateNote(note._id, {
        title: watchedTitle,
        content: contentHtml
      });

      if (updated) {
        setNote(updated);
        setSaveState('saved');
        setTimeout(() => setSaveState('idle'), 900);
      } else {
        setSaveState('idle');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [watchedTitle, contentHtml, note, editor, updateNote]);

  const plainText = useMemo(() => editor?.getText() || '', [editor, contentHtml]);

  const saveHistoryOutput = async (feature: string, output: string): Promise<void> => {
    if (!note || !plainText.trim() || !output.trim()) return;

    const response = await api.post<Note>(`/notes/${note._id}/ai-output`, {
      originalInput: plainText,
      feature,
      output
    });

    setNote({
      ...response.data,
      tags: Array.isArray(response.data.tags) ? response.data.tags : [],
      aiOutputs: Array.isArray(response.data.aiOutputs) ? response.data.aiOutputs : []
    });
  };

  const handleRunFeature = async (): Promise<void> => {
    if (!note || plainText.trim().length < 5) return;

    const output = await process({
      content: plainText,
      feature: selectedFeature,
      language: selectedFeature === 'translate' ? targetLanguage : undefined,
      format: selectedFeature === 'change_format' ? targetFormat : undefined,
      question: selectedFeature === 'answer_question' ? question : undefined
    });

    if (!output) return;

    setLatestOutput(output);
    setLatestOutputFeature(featureLabelMap.get(selectedFeature) || selectedFeature);

    if (selectedFeature === 'improve' && editor) {
      editor.commands.setContent(`<p>${output.replace(/\n/g, '</p><p>')}</p>`);
    }

    if (selectedFeature === 'summarize') {
      const updated = await updateNote(note._id, { summary: output });
      if (updated) setNote(updated);
    } else {
      const updated = await updateNote(note._id, { summary: '' });
      if (updated) setNote(updated);
    }

    await saveHistoryOutput(selectedFeature, output);
  };

  const handleGenerateTags = async (): Promise<void> => {
    if (!note || plainText.trim().length < 5) return;

    const tags = await generateTags(watchedTitle, plainText);
    if (tags.length === 0) return;

    const updated = await updateNote(note._id, { tags });
    if (updated) {
      setNote(updated);
    }

    const tagOutput = tags.map((tag) => `#${tag}`).join(', ');
    setLatestOutput(tagOutput);
    setLatestOutputFeature('Auto-generate tags');

    await saveHistoryOutput('tags', tagOutput);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto max-w-3xl space-y-5">
        <Button variant="ghost" size="icon" onClick={() => router.push('/notes')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center justify-between gap-3">
          <Input
            className="h-12 border-none px-0 text-3xl font-semibold shadow-none focus-visible:ring-0"
            {...register('title')}
          />
          <div className="min-w-20 text-right text-sm text-muted-foreground">
            {saveState === 'saving' && 'Saving...'}
            {saveState === 'saved' && (
              <span className="inline-flex items-center gap-1">
                <Check className="h-4 w-4" /> Saved
              </span>
            )}
          </div>
        </div>

        {safeTags.length ? (
          <div className="flex flex-wrap gap-2">
            {safeTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="lowercase">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}

        <EditorContent editor={editor} />

        <Card>
          <CardContent className="space-y-3 p-4">
            <p className="text-sm font-medium">AI tools</p>

            <select
              value={selectedFeature}
              onChange={(event) => setSelectedFeature(event.target.value as AIFeature)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {featureOptions.map((feature) => (
                <option key={feature.value} value={feature.value}>
                  {feature.label}
                </option>
              ))}
            </select>

            {selectedFeature === 'translate' && (
              <Input
                placeholder="Target language (e.g. Spanish)"
                value={targetLanguage}
                onChange={(event) => setTargetLanguage(event.target.value)}
              />
            )}

            {selectedFeature === 'change_format' && (
              <Input
                placeholder="Target format (e.g. report, speech, email)"
                value={targetFormat}
                onChange={(event) => setTargetFormat(event.target.value)}
              />
            )}

            {selectedFeature === 'answer_question' && (
              <Textarea
                placeholder="Ask a question based on this content"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
              />
            )}

            <div className="flex flex-wrap gap-2">
              <AIButton
                label={featureLabelMap.get(selectedFeature) || 'Run AI'}
                icon={<Sparkles className="h-4 w-4" />}
                onClick={handleRunFeature}
                loading={processLoading}
                disabled={plainText.trim().length < 5}
              />

              <AIButton
                label="Generate Tags"
                icon={<Wand2 className="h-4 w-4" />}
                onClick={handleGenerateTags}
                loading={tagsLoading}
                disabled={plainText.trim().length < 10}
              />
            </div>
          </CardContent>
        </Card>

        {latestOutput ? (
          <Card className="border-blue-200 bg-blue-50/70 dark:border-blue-900 dark:bg-blue-950/20">
            <CardContent className="p-4">
              <p className="mb-1 text-sm font-medium text-blue-700 dark:text-blue-300">
                AI Output: {latestOutputFeature || 'Result'}
              </p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-blue-900 dark:text-blue-100">{latestOutput}</p>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardContent className="space-y-3 p-4">
            <p className="text-sm font-medium">AI History</p>

            {safeAiOutputs.length ? (
              <div className="space-y-3">
                {safeAiOutputs.map((item) => (
                  <Card key={item._id}>
                    <CardContent className="space-y-2 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline">{featureLabelMap.get(item.feature as AIFeature) || item.feature}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm text-foreground">{item.output}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No AI history yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
