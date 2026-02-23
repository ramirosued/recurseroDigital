import express, { Router } from 'express';
import { courseController } from '../controllers/courseController';
import { protectAdminRoute, protectTeacherOrAdminRoute } from '../middleware/authMiddleWare';

const router: Router = express.Router();

router.get('/', protectAdminRoute(), courseController.getAllCourses);
router.post('/', protectAdminRoute(), courseController.createCourse);
router.patch('/games/:courseGameId/status', protectTeacherOrAdminRoute(), courseController.updateCourseGameStatus);
router.post('/:courseId/game', protectAdminRoute(), courseController.addGameToCourse);
router.get('/:courseId/statistics', protectTeacherOrAdminRoute(), courseController.getCourseStatistics);
router.get('/:courseId/games', protectTeacherOrAdminRoute(), courseController.getAllCourseGames);
router.get('/:courseId/students', courseController.getCourseStudents);
router.patch('/:courseId', protectAdminRoute(), courseController.updateCourse);
router.delete('/:courseId', protectAdminRoute(), courseController.deleteCourse);

export default router;