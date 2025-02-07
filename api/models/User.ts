import mongoose, { Document, Schema } from 'mongoose';

interface IUser extends Document {
  email: string;
  verificationCode?: string;
  codeExpiration?: Date;
  habits?: Record<string, any>;
}

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  verificationCode: String,
  codeExpiration: Date,
  habits: { type: Object, default: {} },
});

const User = mongoose.model<IUser>('User', UserSchema);
export default User;
