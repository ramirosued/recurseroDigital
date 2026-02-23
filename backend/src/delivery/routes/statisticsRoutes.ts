import express, { Router } from 'express';
import { statisticsController } from '../controllers/StatisticsController';

const router: Router = express.Router();

router.post('/', statisticsController.saveGameStatistics);
router.get('/student/:studentId', statisticsController.getStudentProgress);
router.get('/student/:studentId/game/:gameId', statisticsController.getStudentProgress);
router.get('/game/:gameId', statisticsController.getGameStatistics);
router.post('/student/:studentId/report', statisticsController.generateStudentReport);

export default router;
