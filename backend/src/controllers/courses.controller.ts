import { Response } from 'express';
import { prisma } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middlewares/authenticate';

export const getCourses = async (req: AuthRequest, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      where: { userId: req.userId },
      include: { _count: { select: { tasks: true, notes: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, courses);
  } catch {
    return sendError(res, 'Failed to fetch courses', 500);
  }
};

export const getCourse = async (req: AuthRequest, res: Response) => {
  try {
    const course = await prisma.course.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: {
        tasks: { orderBy: { dueDate: 'asc' } },
        notes: { orderBy: { updatedAt: 'desc' } },
        _count: { select: { tasks: true, notes: true } },
      },
    });
    if (!course) return sendError(res, 'Course not found', 404);
    return sendSuccess(res, course);
  } catch {
    return sendError(res, 'Failed to fetch course', 500);
  }
};

export const createCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, instructor, semester, color, icon, description } = req.body;
    const course = await prisma.course.create({
      data: { userId: req.userId!, name, code, instructor, semester, color: color || '#7F77DD', icon: icon || 'book', description },
    });
    return sendSuccess(res, course, 'Course created', 201);
  } catch {
    return sendError(res, 'Failed to create course', 500);
  }
};

export const updateCourse = async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.course.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!existing) return sendError(res, 'Course not found', 404);

    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: req.body,
    });
    return sendSuccess(res, course, 'Course updated');
  } catch {
    return sendError(res, 'Failed to update course', 500);
  }
};

export const deleteCourse = async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.course.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!existing) return sendError(res, 'Course not found', 404);

    await prisma.course.delete({ where: { id: req.params.id } });
    return sendSuccess(res, null, 'Course deleted');
  } catch {
    return sendError(res, 'Failed to delete course', 500);
  }
};
