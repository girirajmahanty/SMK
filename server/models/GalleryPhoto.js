import mongoose from 'mongoose';

// A photo a signed-in visitor sent for the public gallery. It waits as "pending" until an admin approves it;
// rejected photos are deleted. The image itself (WebP) is stored here and served from /uploads/<filename>.
const galleryPhotoSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    mime: { type: String, required: true },
    size: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true },
    caption: { type: String, default: '', trim: true, maxlength: 200 },
    cat: { type: String, enum: ['village', 'temple', 'procession'], default: 'village' },
    status: { type: String, enum: ['pending', 'approved'], default: 'pending', index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, default: '', maxlength: 60 },
    reviewedBy: { type: String, default: '' },
    reviewedAt: { type: Date },
    data: { type: Buffer, select: false },
  },
  { timestamps: true }
);

export default mongoose.model('GalleryPhoto', galleryPhotoSchema);
