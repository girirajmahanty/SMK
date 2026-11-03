import mongoose from 'mongoose';

const localeText = {
  en: { type: String, trim: true, default: '', maxlength: 5000 },
  bn: { type: String, trim: true, default: '', maxlength: 5000 },
};

const festivalSchema = new mongoose.Schema(
  {
    name: { type: new mongoose.Schema(localeText, { _id: false }), required: true },
    date: { type: new mongoose.Schema(localeText, { _id: false }), default: () => ({}) },
    text: { type: new mongoose.Schema(localeText, { _id: false }), default: () => ({}) },
    details: { type: [new mongoose.Schema(localeText, { _id: false })], default: [] },
    tone: { type: String, trim: true, default: 'sun', maxlength: 30 },
    icon: { type: String, trim: true, default: 'Flame', maxlength: 40 },
    img: { type: String, trim: true, default: '', maxlength: 500 },
    position: { type: String, trim: true, default: '', maxlength: 50 },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    startDate: { type: String, default: '', match: /^\d{0,4}-?\d{0,2}-?\d{0,2}$/ },
    endDate: { type: String, default: '', match: /^\d{0,4}-?\d{0,2}-?\d{0,2}$/ },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

festivalSchema.index({ order: 1, createdAt: 1 });
festivalSchema.index({ 'name.en': 1 }, { unique: true });
export default mongoose.model('Festival', festivalSchema);
