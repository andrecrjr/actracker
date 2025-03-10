import { useContext } from '@modern-js/runtime/express';

import { Habit as IHabit } from '@/ac-components/types';
import { connectDB } from '../../models';
import Habit from '../../models/Habit';

export const post = async () => {
  const { req, res } = useContext();
  await connectDB();
  const { habits } = req.body;
  const { userId } = req.query;

  try {
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: 'User ID is required.' });
    }
    const bulkOps = habits.map((habit: IHabit) => ({
      updateOne: {
        filter: { userId, habitId: habit.id },
        update: {
          $set: {
            userId,
            habitData: { ...habit, cloudSync: true },
            habitId: habit.id,
          },
        },
        upsert: true,
      },
    }));
    await Habit.bulkWrite(bulkOps);

    res.status(200).json({ success: true, message: 'Habits synchronized.' });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Synchronization failed.' });
  }
};

export const del = async () => {
  const { req, res } = useContext();
  await connectDB();
  await Habit.deleteMany();
  res.status(200).json({ success: true, message: 'All habits deleted' });
};
