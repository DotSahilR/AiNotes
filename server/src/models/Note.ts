import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const aiOutputSchema = new Schema(
  {
    originalInput: { type: String, required: true },
    feature: { type: String, required: true },
    output: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const noteSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, default: 'Untitled', trim: true },
    content: { type: String, default: '' },
    summary: { type: String, default: '' },
    tags: { type: [String], default: [] },
    isPinned: { type: Boolean, default: false },
    aiOutputs: { type: [aiOutputSchema], default: [] }
  },
  { timestamps: true }
);

export type NoteDocument = InferSchemaType<typeof noteSchema> & { _id: string };

export const Note = mongoose.models.Note || mongoose.model('Note', noteSchema);
