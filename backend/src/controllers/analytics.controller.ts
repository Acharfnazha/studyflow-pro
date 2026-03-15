import { Response } from 'express';
import { prisma } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middlewares/authenticate';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const [
      totalTasks, completedThisWeek, pendingTasks, overdueTasks,
      todayTasks, totalCourses, studyHoursThisWeek, recentSessions
    ] = await Promise.all([
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, status: 'COMPLETED', updatedAt: { gte: startOfWeek } } }),
      prisma.task.count({ where: { userId, status: { in: ['PENDING', 'IN_PROGRESS'] } } }),
      prisma.task.count({ where: { userId, status: 'OVERDUE' } }),
      prisma.task.findMany({
        where: { userId, dueDate: { gte: startOfToday, lte: endOfToday }, status: { not: 'COMPLETED' } },
        include: { course: { select: { name: true, color: true } } },
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        take: 5,
      }),
      prisma.course.count({ where: { userId } }),
      prisma.studySession.aggregate({
        where: { userId, startTime: { gte: startOfWeek } },
        _sum: { durationMinutes: true },
      }),
      prisma.studySession.findMany({
        where: { userId },
        orderBy: { startTime: 'desc' },
        take: 5,
        include: { task: { select: { title: true } } },
      }),
    ]);

    const completionRate = totalTasks > 0
      ? Math.round((completedThisWeek / Math.max(completedThisWeek + pendingTasks, 1)) * 100)
      : 0;

    return sendSuccess(res, {
      totalTasks,
      completedThisWeek,
      pendingTasks,
      overdueTasks,
      todayTasks,
      totalCourses,
      studyHoursThisWeek: Math.round((studyHoursThisWeek._sum.durationMinutes || 0) / 60),
      completionRate,
      recentSessions,
    });
  } catch (e) {
    console.error(e);
    return sendError(res, 'Failed to fetch dashboard stats', 500);
  }
};

export const getWeeklyProgress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

      const [completed, pending, studyMins] = await Promise.all([
        prisma.task.count({ where: { userId, status: 'COMPLETED', updatedAt: { gte: start, lte: end } } }),
        prisma.task.count({ where: { userId, status: { in: ['PENDING', 'IN_PROGRESS', 'OVERDUE'] }, dueDate: { gte: start, lte: end } } }),
        prisma.studySession.aggregate({ where: { userId, startTime: { gte: start, lte: end } }, _sum: { durationMinutes: true } }),
      ]);

      result.push({
        day: days[date.getDay()],
        date: start.toISOString().split('T')[0],
        completed,
        pending,
        studyHours: Math.round(((studyMins._sum.durationMinutes || 0) / 60) * 10) / 10,
      });
    }
    return sendSuccess(res, result);
  } catch {
    return sendError(res, 'Failed to fetch weekly progress', 500);
  }
};

export const getCourseProgress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const courses = await prisma.course.findMany({
      where: { userId },
      include: { _count: { select: { tasks: true } } },
    });

    const result = await Promise.all(courses.map(async (course) => {
      const completed = await prisma.task.count({ where: { userId, courseId: course.id, status: 'COMPLETED' } });
      const total = course._count.tasks;
      return {
        id: course.id,
        name: course.name,
        code: course.code,
        color: course.color,
        total,
        completed,
        rate: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    }));

    return sendSuccess(res, result);
  } catch {
    return sendError(res, 'Failed to fetch course progress', 500);
  }
};

export const getRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const now = new Date();

    const tasks = await prisma.task.findMany({
      where: { userId, status: { in: ['PENDING', 'IN_PROGRESS'] } },
      include: { course: { select: { name: true, color: true } } },
    });

    const scored = tasks.map(task => {
      const hoursUntilDue = task.dueDate
        ? (task.dueDate.getTime() - now.getTime()) / 3600000
        : 999;

      const urgencyScore = hoursUntilDue < 0 ? 100 : Math.max(0, 100 - hoursUntilDue * 2);
      const priorityScore = { LOW: 10, MEDIUM: 25, HIGH: 50, URGENT: 80 }[task.priority] || 25;
      const difficultyScore = { EASY: 5, MEDIUM: 20, HARD: 40, EXPERT: 60 }[task.difficulty] || 20;
      const overdueBonus = hoursUntilDue < 0 ? 50 : 0;

      return {
        ...task,
        score: urgencyScore + priorityScore + difficultyScore + overdueBonus,
        hoursUntilDue: Math.round(hoursUntilDue),
      };
    });

    const recommendations = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    let suggestion = 'Great job staying on top of things!';
    if (recommendations.length > 0) {
      const top = recommendations[0];
      if (top.hoursUntilDue < 0) {
        suggestion = `You have overdue tasks. Start with "${top.title}" immediately.`;
      } else if (top.hoursUntilDue < 24) {
        suggestion = `"${top.title}" is due in ${top.hoursUntilDue}h — tackle it first!`;
      } else {
        suggestion = `Focus on "${top.title}" today for best results.`;
      }
    }

    return sendSuccess(res, { recommendations, suggestion });
  } catch {
    return sendError(res, 'Failed to get recommendations', 500);
  }
};
