import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { prisma } from '../config/database';
import { sendError } from '../utils/response';

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return sendError(res, 'Access token required', 401);

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, avatarUrl: true, timezone: true },
    });

    if (!user) return sendError(res, 'User not found', 401);
    req.userId = user.id;
    req.user = user;
    next();
  } catch {
    return sendError(res, 'Invalid or expired token', 401);
  }
};
