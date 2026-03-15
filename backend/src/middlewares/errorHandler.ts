import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  if (err.code === 'P2002') return sendError(res, 'Record already exists', 409);
  if (err.code === 'P2025') return sendError(res, 'Record not found', 404);
  return sendError(res, err.message || 'Internal server error', err.status || 500);
};
