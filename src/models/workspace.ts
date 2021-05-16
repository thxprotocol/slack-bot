import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkspace extends Document {
  id: string;
  client_id: string;
  client_secret: string;
  access_token: string;
  access_token_expires_at: number;
}

const WorkspaceSchema: Schema = new Schema({
  id: { type: String, required: true },
  client_id: { type: String },
  client_secret: { type: String },
  access_token: { type: String },
  access_token_expires_at: { type: Number },
});

export default mongoose.model<IWorkspace>('Workspaces', WorkspaceSchema);
