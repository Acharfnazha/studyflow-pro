import { Response } from 'express';
import { prisma } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middlewares/authenticate';

export const getNotes = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, taskId, search } = req.query;
    const where: any = { userId: req.userId };
    if (courseId) where.courseId = courseId;
    if (taskId) where.taskId = taskId;
    if (search) where.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { content: { contains: search as string, mode: 'insensitive' } },
    ];

    const notes = await prisma.note.findMany({
      where,
      include: {
        course: { select: { name: true, color: true } },
        task: { select: { title: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return sendSuccess(res, notes);
  } catch {
    return sendError(res, 'Failed to fetch notes', 500);
  }
};

export const getNote = async (req: AuthRequest, res: Response) => {
  try {
    const note = await prisma.note.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { course: true, task: { select: { title: true } } },
    });
    if (!note) return sendError(res, 'Note not found', 404);
    return sendSuccess(res, note);
  } catch {
    return sendError(res, 'Failed to fetch note', 500);
  }
};

export const createNote = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, courseId, taskId } = req.body;
    const note = await prisma.note.create({
      data: {
        userId: req.userId!,
        title, content: content || '',
        courseId: courseId || null,
        taskId: taskId || null,
      },
      include: { course: { select: { name: true, color: true } } },
    });
    return sendSuccess(res, note, 'Note created', 201);
  } catch {
    return sendError(res, 'Failed to create note', 500);
  }
};

export const updateNote = async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.note.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!existing) return sendError(res, 'Note not found', 404);

    const note = await prisma.note.update({
      where: { id: req.params.id },
      data: req.body,
      include: { course: { select: { name: true, color: true } } },
    });
    return sendSuccess(res, note, 'Note updated');
  } catch {
    return sendError(res, 'Failed to update note', 500);
  }
};

export const deleteNote = async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.note.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!existing) return sendError(res, 'Note not found', 404);
    await prisma.note.delete({ where: { id: req.params.id } });
    return sendSuccess(res, null, 'Note deleted');
  } catch {
    return sendError(res, 'Failed to delete note', 500);
  }
};
