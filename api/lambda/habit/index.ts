// /api/lambda/habit/index.ts
import { useContext } from '@modern-js/runtime/express';
import mongoose from 'mongoose';
import { Habit, connectDB } from '../../models';

// Criar um novo hábito
export const post = async () => {
  const { req, res } = useContext();
  await connectDB();
  const { userId, habitId, habitData } = req.body;

  try {
    const newHabit = new Habit({
      userId: new mongoose.Types.ObjectId(userId),
      habitId,
      habitData,
    });
    await newHabit.save();
    res.status(201).json({
      success: true,
      message: 'Hábito criado com sucesso.',
      habit: newHabit,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Erro ao criar o hábito.', error });
  }
};

// Ler hábitos de um usuário
export const get = async () => {
  const { req, res } = useContext();
  await connectDB();
  const { userId } = req.query;

  try {
    const habits = await Habit.find({
      userId: new mongoose.Types.ObjectId(userId as string),
    });
    console.log(userId, habits);
    res.status(200).json({ success: true, habits, user: userId });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Erro ao buscar os hábitos.', error });
  }
};

// Atualizar um hábito existente
export const put = async () => {
  const { req, res } = useContext();
  await connectDB();
  const { habitId, habitData } = req.body;

  try {
    const updatedHabit = await Habit.findOneAndUpdate(
      { habitId },
      { habitData },
      { new: true },
    );
    if (!updatedHabit) {
      return res
        .status(404)
        .json({ success: false, message: 'Hábito não encontrado.' });
    }
    res.status(200).json({
      success: true,
      message: 'Hábito atualizado com sucesso.',
      habit: updatedHabit,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Erro ao atualizar o hábito.', error });
  }
};

// Excluir um hábito
export const del = async () => {
  const { req, res } = useContext();
  await connectDB();
  const { habitId } = req.body;

  try {
    const deletedHabit = await Habit.findOneAndDelete({ habitId });
    if (!deletedHabit) {
      return res
        .status(404)
        .json({ success: false, message: 'Hábito não encontrado.' });
    }
    res
      .status(200)
      .json({ success: true, message: 'Hábito excluído com sucesso.' });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Erro ao excluir o hábito.', error });
  }
};
