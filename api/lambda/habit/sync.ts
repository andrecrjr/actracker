import { useContext } from '@modern-js/runtime/express';

import { Habit as IHabit } from '@/ac-components/types';
import { connectDB } from '../../models';
import Habit from '../../models/Habit';

export const post = async () => {
  const { req, res } = useContext();
  await connectDB();
  const { habits } = JSON.parse(req.body);
  const { userId } = req.query;

  try {
    // Remove existing habits for the user
    // await Habit.deleteMany({ userId });

    // Insert new habits
    const habitDocuments = habits.map((habit: IHabit) => ({
      userId,
      habitId: habit.id,
      habitData: habit,
    }));
    // updatemany
    await Habit.insertMany(habitDocuments);

    res.status(200).json({ success: true, message: 'Habits synchronized.' });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Synchronization failed.' });
  }
};
