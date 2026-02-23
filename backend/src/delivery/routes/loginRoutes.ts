import express, { Router } from 'express';
import { loginController } from '../controllers/loginController';

const router: Router = express.Router();

router.post('/teacher', loginController.loginTeacher);
router.post('/student', loginController.loginStudent);
router.post('/admin', loginController.loginAdmin);

export default router;