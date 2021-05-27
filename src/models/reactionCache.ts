import mongoose, { Document, Schema } from 'mongoose';

export interface IReactionCache extends Document {
  uuid: string;
  reactionId: string;
  messageId: string;
}

const ReactionCacheSchema: Schema = new Schema({
  uuid: { type: String, required: true },
  reactionId: { type: String, required: true },
  messageId: { type: String, required: true },
});

export default mongoose.model<IReactionCache>('ReactionCache', ReactionCacheSchema);
