// web/routes.js
import { Router } from 'express';
import * as webController from './controllers.js';
import { requireAuth } from '../configs/middlewares.js';

const router = Router();

router.get('/', requireAuth, webController.home);
router.get('/sign-in', webController.signIn);
router.get('/reset-password', webController.resetPassword);
router.get('/sign-up', webController.signUp);

export default router;
