import { Router } from 'express';
import { getSessions, createSession, deleteSession } from '../controllers/sessions.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

router.use(authenticate);
router.get('/', getSessions);
router.post('/', createSession);
router.delete('/:id', deleteSession);

export default router;
