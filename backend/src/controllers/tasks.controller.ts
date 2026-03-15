import { Response } from 'express';
import { prisma } from '../config/database';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { AuthRequest } from '../middlewares/authenticate';

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, type, status, priority, search, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Auto-mark overdue tasks
    await prisma.task.updateMany({
      where: {
        userId: req.userId,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        dueDate: { lt: new Date() },
      },
      data: { status: 'OVERDUE' },
    });

    const where: any = { userId: req.userId };
    if (courseId) where.courseId = courseId;
    if (type) where.type = type;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) where.title = { contains: search as string, mode: 'insensitive' };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: { course: { select: { name: true, color: true, code: true } } },
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        skip,
        take: limitNum,
      }),
      prisma.task.count({ where }),
    ]);

    return sendPaginated(res, tasks, total, pageNum, limitNum);
  } catch {
    return sendError(res, 'Failed to fetch tasks', 500);
  }
};

export const getTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await prisma.task.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: {
        course: true,
        studySessions: { orderBy: { startTime: 'desc' }, take: 5 },
      },
    });
    if (!task) return sendError(res, 'Task not found', 404);
    return sendSuccess(res, task);
  } catch {
    return sendError(res, 'Failed to fetch task', 500);
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, type, priority, status, difficulty, dueDate, estimatedMinutes, notes, courseId } = req.body;
    const task = await prisma.task.create({
      data: {
        userId: req.userId!,
        courseId: courseId || null,
        title, description, type: type || 'ASSIGNMENT',
        priority: priority || 'MEDIUM',
        status: status || 'PENDING',
        difficulty: difficulty || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedMinutes, notes,
      },
      include: { course: { select: { name: true, color: true, code: true } } },
    });
    return sendSuccess(res, task, 'Task created', 201);
  } catch {
    return sendError(res, 'Failed to create task', 500);
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.task.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!existing) return sendError(res, 'Task not found', 404);

    const data: any = { ...req.body };
    if (data.dueDate) data.dueDate = new Date(data.dueDate);

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data,
      include: { course: { select: { name: true, color: true, code: true } } },
    });
    return sendSuccess(res, task, 'Task updated');
  } catch {
    return sendError(res, 'Failed to update task', 500);
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.task.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!existing) return sendError(res, 'Task not found', 404);
    await prisma.task.delete({ where: { id: req.params.id } });
    return sendSuccess(res, null, 'Task deleted');
  } catch {
    return sendError(res, 'Failed to delete task', 500);
  }
};

export const getOverdueTasks = async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.userId, status: 'OVERDUE' },
      include: { course: { select: { name: true, color: true } } },
      orderBy: { dueDate: 'asc' },
    });
    return sendSuccess(res, tasks);
  } catch {
    return sendError(res, 'Failed to fetch overdue tasks', 500);
  }
};

export const getTodayTasks = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const tasks = await prisma.task.findMany({
      where: {
        userId: req.userId,
        dueDate: { gte: startOfDay, lte: endOfDay },
        status: { not: 'COMPLETED' },
      },
      include: { course: { select: { name: true, color: true } } },
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
    });
    return sendSuccess(res, tasks);
  } catch {
    return sendError(res, 'Failed to fetch today tasks', 500);
  }
};
