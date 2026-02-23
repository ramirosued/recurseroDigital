import express, { Router } from 'express';
import { studentController, studentExtendedController } from '../controllers/studentController';
import { protectAdminRoute, protectRoute } from '../middleware/authMiddleWare';
import { UserRole } from '../../core/models/User';

const router: Router = express.Router();

router.post('/', protectAdminRoute(), studentController.addStudent);
router.get('/', protectAdminRoute(), studentController.getAllStudents);

router.get('/me/games', protectRoute(UserRole.STUDENT), studentController.getMyGames);

router.patch('/:studentId', protectAdminRoute(), studentController.updateStudent);

router.delete('/:studentId', protectAdminRoute(), studentController.deleteStudent);

router.patch('/:studentId/enable', protectAdminRoute(), studentController.enableStudent);

router.post('/:studentId/courses', protectAdminRoute(), studentExtendedController.assignCourseToStudent);

export default router;
