import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    mime: { type: String, required: true },
    size: { type: Number, required: true },
    caption: { type: String, default: '', trim: true, maxlength: 300 },
    data: { type: Buffer, select: false },
  },
  { timestamps: true }
);

export default mongoose.model('Media', mediaSchema);
