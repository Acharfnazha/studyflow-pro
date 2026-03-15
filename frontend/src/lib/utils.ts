import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const d = new Date(date);
  if (isToday(d)) return `Today ${format(d, 'h:mm a')}`;
  if (isTomorrow(d)) return `Tomorrow ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d, h:mm a');
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function isOverdue(date: string | Date | null | undefined): boolean {
  if (!date) return false;
  return isPast(new Date(date));
}

export const PRIORITY_COLORS: Record<string, string> = {
  LOW:    'bg-green-50 text-green-700 border-green-200',
  MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200',
  HIGH:   'bg-amber-50 text-amber-700 border-amber-200',
  URGENT: 'bg-red-50 text-red-700 border-red-200',
};

export const STATUS_COLORS: Record<string, string> = {
  PENDING:     'bg-gray-100 text-gray-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED:   'bg-green-100 text-green-700',
  OVERDUE:     'bg-red-100 text-red-700',
};

export const TYPE_LABELS: Record<string, string> = {
  ASSIGNMENT:    'Assignment',
  QUIZ:          'Quiz',
  EXAM:          'Exam',
  PROJECT:       'Project',
  STUDY_SESSION: 'Study',
  OTHER:         'Other',
};

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', URGENT: 'Urgent',
};

export const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed', OVERDUE: 'Overdue',
};

export const COURSE_COLORS = [
  '#7F77DD', '#1D9E75', '#EF9F27', '#378ADD',
  '#E24B4A', '#D4537E', '#639922', '#D85A30',
  '#0F6E56', '#534AB7', '#993556', '#185FA5',
];
