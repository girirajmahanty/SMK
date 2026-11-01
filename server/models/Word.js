import mongoose from 'mongoose';

const wordSchema = new mongoose.Schema(
  {
    word: { type: String, required: true, trim: true },
    pronunciation: { type: String, trim: true, default: '' },
    meaning: { type: String, required: true, trim: true },
    meaningBn: { type: String, trim: true, default: '' },
    category: {
      type: String,
      enum: ['greeting', 'family', 'food', 'nature', 'daily', 'phrase', 'number', 'other'],
      default: 'other',
    },
    example: { type: String, trim: true, default: '' },
    exampleMeaning: { type: String, trim: true, default: '' },
    contributor: { type: String, trim: true, default: 'Village team' },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

wordSchema.index({ word: 'text', meaning: 'text' });

export default mongoose.model('Word', wordSchema);
