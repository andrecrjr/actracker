import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  verificationCode?: string;
  codeExpiration?: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  verificationCode: { type: String },
  codeExpiration: { type: Date },
});

export const User = mongoose.model<IUser>('User', UserSchema);
