import { Response } from 'express';
import { prisma } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middlewares/authenticate';

export const getSessions = async (req: AuthRequest, res: Response) => {
  try {
    const sessions = await prisma.studySession.findMany({
      where: { userId: req.userId },
      include: { task: { select: { title: true, course: { select: { name: true, color: true } } } } },
      orderBy: { startTime: 'desc' },
      take: 50,
    });
    return sendSuccess(res, sessions);
  } catch {
    return sendError(res, 'Failed to fetch sessions', 500);
  }
};

export const createSession = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId, startTime, endTime, notes } = req.body;
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : null;
    const durationMinutes = end ? Math.round((end.getTime() - start.getTime()) / 60000) : null;

    const session = await prisma.studySession.create({
      data: { userId: req.userId!, taskId: taskId || null, startTime: start, endTime: end, durationMinutes, notes },
    });
    return sendSuccess(res, session, 'Session logged', 201);
  } catch {
    return sendError(res, 'Failed to log session', 500);
  }
};

export const deleteSession = async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.studySession.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!existing) return sendError(res, 'Session not found', 404);
    await prisma.studySession.delete({ where: { id: req.params.id } });
    return sendSuccess(res, null, 'Session deleted');
  } catch {
    return sendError(res, 'Failed to delete session', 500);
  }
};
