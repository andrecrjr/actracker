import mongoose from 'mongoose';
import { User } from './User';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/seu_banco_de_dados';

export const connectDB = async () => {
  try {
    console.log(process.env.MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    await User.findOne();
    console.log('Conectado ao MongoDB');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
  }
};
