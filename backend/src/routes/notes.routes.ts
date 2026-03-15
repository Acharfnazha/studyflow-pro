import { Router } from 'express';
import { body } from 'express-validator';
import { getNotes, getNote, createNote, updateNote, deleteNote } from '../controllers/notes.controller';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';

const router = Router();

router.use(authenticate);

router.get('/', getNotes);
router.get('/:id', getNote);
router.post('/', [body('title').trim().notEmpty()], validate, createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;
