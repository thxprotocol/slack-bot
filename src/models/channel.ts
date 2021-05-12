import mongoose, { Document, Schema } from 'mongoose';
import { IWorkspace } from './workspace';

export interface IChannel extends Document {
  id: string;
  pool_address: string;
  members: string[];
  workspace: IWorkspace;
}

const ChannelSchema: Schema = new Schema({
  id: { type: String, required: true },
  pool_address: { type: String, required: true },
  members: { type: [String] },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspaces'
  }
});

export default mongoose.model<IChannel>('Channels', ChannelSchema);
