import mongoose from 'mongoose';

const cmsContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    en: { type: String, default: '', maxlength: 5000 },
    bn: { type: String, default: '', maxlength: 5000 },
  },
  { timestamps: true }
);

export default mongoose.model('CmsContent', cmsContentSchema);
