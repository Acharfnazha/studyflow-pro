import { Router } from 'express';
import { getDashboardStats, getWeeklyProgress, getCourseProgress, getRecommendations } from '../controllers/analytics.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

router.use(authenticate);
router.get('/dashboard', getDashboardStats);
router.get('/weekly', getWeeklyProgress);
router.get('/courses', getCourseProgress);
router.get('/recommendations', getRecommendations);

export default router;
