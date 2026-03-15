import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { config } from '../config/env';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middlewares/authenticate';

const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as any,
  });
  const refreshToken = jwt.sign({ userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as any,
  });
  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, timezone } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return sendError(res, 'Email already in use', 409);

    const passwordHash = await bcrypt.hash(password, config.bcrypt.saltRounds);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, timezone: timezone || 'UTC' },
      select: { id: true, name: true, email: true, avatarUrl: true, timezone: true, createdAt: true },
    });

    const { accessToken, refreshToken } = generateTokens(user.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

    return sendSuccess(res, { user, accessToken, refreshToken }, 'Account created successfully', 201);
  } catch (error) {
    return sendError(res, 'Registration failed', 500);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return sendError(res, 'Invalid credentials', 401);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return sendError(res, 'Invalid credentials', 401);

    const { accessToken, refreshToken } = generateTokens(user.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return sendSuccess(res, { user: userWithoutPassword, accessToken, refreshToken }, 'Login successful');
  } catch {
    return sendError(res, 'Login failed', 500);
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return sendError(res, 'Refresh token required', 401);

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) return sendError(res, 'Invalid refresh token', 401);

    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as { userId: string };
    const tokens = generateTokens(decoded.userId);

    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { token: tokens.refreshToken, userId: decoded.userId, expiresAt } });

    return sendSuccess(res, tokens, 'Tokens refreshed');
  } catch {
    return sendError(res, 'Token refresh failed', 401);
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    return sendSuccess(res, null, 'Logged out successfully');
  } catch {
    return sendError(res, 'Logout failed', 500);
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  return sendSuccess(res, req.user, 'Profile fetched');
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, timezone, avatarUrl } = req.body;
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { ...(name && { name }), ...(timezone && { timezone }), ...(avatarUrl && { avatarUrl }) },
      select: { id: true, name: true, email: true, avatarUrl: true, timezone: true },
    });
    return sendSuccess(res, user, 'Profile updated');
  } catch {
    return sendError(res, 'Update failed', 500);
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return sendError(res, 'User not found', 404);

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return sendError(res, 'Current password is incorrect', 401);

    const passwordHash = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);
    await prisma.user.update({ where: { id: req.userId }, data: { passwordHash } });
    await prisma.refreshToken.deleteMany({ where: { userId: req.userId } });

    return sendSuccess(res, null, 'Password changed successfully');
  } catch {
    return sendError(res, 'Password change failed', 500);
  }
};
