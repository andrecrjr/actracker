export * from './habits';
export * from '../lib/plugins/types';
import { Request } from 'express';

export interface IGetUserAuthInfoRequest extends Request {
  userId?: string; // or any other type
}
