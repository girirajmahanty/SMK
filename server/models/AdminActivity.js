import mongoose from 'mongoose';

const adminActivitySchema = new mongoose.Schema(
  {
    actor: { type: String, required: true, maxlength: 120 },
    action: { type: String, required: true, maxlength: 80 },
    target: { type: String, default: '', maxlength: 200 },
  },
  { timestamps: true }
);

adminActivitySchema.index({ createdAt: -1 });
export default mongoose.model('AdminActivity', adminActivitySchema);
