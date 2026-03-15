import { Router } from 'express';
import { body } from 'express-validator';
import { getTasks, getTask, createTask, updateTask, deleteTask, getOverdueTasks, getTodayTasks } from '../controllers/tasks.controller';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';

const router = Router();

router.use(authenticate);

router.get('/', getTasks);
router.get('/overdue', getOverdueTasks);
router.get('/today', getTodayTasks);
router.get('/:id', getTask);
router.post('/', [body('title').trim().notEmpty()], validate, createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
