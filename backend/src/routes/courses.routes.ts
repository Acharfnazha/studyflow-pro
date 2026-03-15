import { Router } from 'express';
import { body } from 'express-validator';
import { getCourses, getCourse, createCourse, updateCourse, deleteCourse } from '../controllers/courses.controller';
import { authenticate } from '../middlewares/authenticate';
import { validate } from '../middlewares/validate';

const router = Router();

router.use(authenticate);

router.get('/', getCourses);
router.get('/:id', getCourse);
router.post('/',
  [body('name').trim().notEmpty(), body('code').trim().notEmpty()],
  validate, createCourse
);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

export default router;
