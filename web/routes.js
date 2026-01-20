// web/routes.js
import { Router } from 'express';
import * as webController from './controllers.js';

const router = Router();

router.get('/', webController.home);
router.get('/about', webController.about);

export default router;
