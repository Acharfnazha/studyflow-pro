export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  timezone: string;
  createdAt: string;
}

export interface Course {
  id: string;
  userId: string;
  name: string;
  code: string;
  instructor?: string;
  semester?: string;
  color: string;
  icon: string;
  description?: string;
  createdAt: string;
  _count?: { tasks: number; notes: number };
}

export type TaskType = 'ASSIGNMENT' | 'QUIZ' | 'EXAM' | 'PROJECT' | 'STUDY_SESSION' | 'OTHER';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';

export interface Task {
  id: string;
  userId: string;
  courseId?: string;
  title: string;
  description?: string;
  type: TaskType;
  priority: Priority;
  status: TaskStatus;
  difficulty: Difficulty;
  dueDate?: string;
  estimatedMinutes?: number;
  notes?: string;
  createdAt: string;
  course?: { name: string; color: string; code: string };
}

export interface Note {
  id: string;
  userId: string;
  courseId?: string;
  taskId?: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  course?: { name: string; color: string };
  task?: { title: string };
}

export interface StudySession {
  id: string;
  userId: string;
  taskId?: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  notes?: string;
  createdAt: string;
  task?: { title: string; course?: { name: string; color: string } };
}

export interface DashboardStats {
  totalTasks: number;
  completedThisWeek: number;
  pendingTasks: number;
  overdueTasks: number;
  todayTasks: Task[];
  totalCourses: number;
  studyHoursThisWeek: number;
  completionRate: number;
}

export interface WeeklyProgress {
  day: string;
  date: string;
  completed: number;
  pending: number;
  studyHours: number;
}

export interface Recommendation {
  id: string;
  title: string;
  priority: Priority;
  difficulty: Difficulty;
  dueDate?: string;
  hoursUntilDue: number;
  score: number;
  course?: { name: string; color: string };
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
}
