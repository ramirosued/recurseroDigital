import express, { Router } from 'express';
import { logoutController } from '../controllers/logoutController';

const router: Router = express.Router();

router.post('/', logoutController.logout);


export default router;

