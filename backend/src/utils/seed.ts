import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@studyflow.pro' },
    update: {},
    create: { name: 'Alex Demo', email: 'demo@studyflow.pro', passwordHash, timezone: 'UTC' },
  });

  const courses = await Promise.all([
    prisma.course.upsert({ where: { id: 'course-1' }, update: {}, create: { id: 'course-1', userId: user.id, name: 'Algorithms & Data Structures', code: 'CS401', instructor: 'Dr. Smith', semester: 'Spring 2026', color: '#7F77DD', icon: 'cpu' } }),
    prisma.course.upsert({ where: { id: 'course-2' }, update: {}, create: { id: 'course-2', userId: user.id, name: 'Database Systems', code: 'CS402', instructor: 'Prof. Johnson', semester: 'Spring 2026', color: '#1D9E75', icon: 'database' } }),
    prisma.course.upsert({ where: { id: 'course-3' }, update: {}, create: { id: 'course-3', userId: user.id, name: 'Operating Systems', code: 'CS410', instructor: 'Dr. Lee', semester: 'Spring 2026', color: '#EF9F27', icon: 'server' } }),
    prisma.course.upsert({ where: { id: 'course-4' }, update: {}, create: { id: 'course-4', userId: user.id, name: 'Computer Networks', code: 'CS415', instructor: 'Prof. Chen', semester: 'Spring 2026', color: '#378ADD', icon: 'network' } }),
  ]);

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 86400000);
  const in3days = new Date(now.getTime() + 3 * 86400000);
  const in1week = new Date(now.getTime() + 7 * 86400000);
  const yesterday = new Date(now.getTime() - 86400000);

  await prisma.task.createMany({
    data: [
      { id: 'task-1', userId: user.id, courseId: courses[1].id, title: 'ER Diagram Assignment', description: 'Design a complete ER diagram for a hospital management system', type: 'ASSIGNMENT', priority: 'URGENT', status: 'PENDING', difficulty: 'HARD', dueDate: tomorrow, estimatedMinutes: 180 },
      { id: 'task-2', userId: user.id, courseId: courses[2].id, title: 'Chapter 7 Quiz', description: 'Quiz covering process scheduling algorithms', type: 'QUIZ', priority: 'HIGH', status: 'PENDING', difficulty: 'MEDIUM', dueDate: new Date(now.getTime() + 6 * 3600000), estimatedMinutes: 60 },
      { id: 'task-3', userId: user.id, courseId: courses[0].id, title: 'Problem Set 4', description: 'Sorting algorithms and complexity analysis', type: 'ASSIGNMENT', priority: 'MEDIUM', status: 'IN_PROGRESS', difficulty: 'HARD', dueDate: in3days, estimatedMinutes: 240 },
      { id: 'task-4', userId: user.id, courseId: courses[3].id, title: 'Read Chapters 3-4', description: 'TCP/IP protocol suite and routing', type: 'STUDY_SESSION', priority: 'LOW', status: 'PENDING', difficulty: 'EASY', dueDate: in3days, estimatedMinutes: 120 },
      { id: 'task-5', userId: user.id, courseId: courses[0].id, title: 'Midterm Exam', description: 'Covers all topics from weeks 1-7', type: 'EXAM', priority: 'URGENT', status: 'PENDING', difficulty: 'EXPERT', dueDate: in1week, estimatedMinutes: 120 },
      { id: 'task-6', userId: user.id, courseId: courses[1].id, title: 'SQL Queries Lab', description: 'Advanced SQL joins and subqueries', type: 'ASSIGNMENT', priority: 'MEDIUM', status: 'COMPLETED', difficulty: 'MEDIUM', dueDate: yesterday, estimatedMinutes: 90 },
    ],
  });

  console.log('✅ Database seeded!');
  console.log('📧 Demo login: demo@studyflow.pro / password123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
