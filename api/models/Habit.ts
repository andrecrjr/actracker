import mongoose, { Document, Schema } from 'mongoose';

interface IHabit extends Document {
  userId: mongoose.Types.ObjectId;
  habitData: Record<string, any>; // Flexible JSON structure for habit data
  habitId: string;
}

const HabitSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  habitData: { type: Schema.Types.Mixed, default: {} },
  habitId: { type: Schema.Types.String, required: true, unique: true },
});

const Habit = mongoose.model<IHabit>('Habit', HabitSchema);
export default Habit;
