// management/configs/routes.js
import { Router } from 'express';
import * as locationController from '../controllers/locations_controller.js';
import * as departmentController from '../controllers/departments_controller.js';
import { requireAuth } from '../../configs/middlewares.js';
import { redirectIfAuthenticated } from '../../configs/middlewares.js'; 


const router = Router();

router.get('/api/v1/departments', requireAuth, departmentController.fetchAll);
router.post('/api/v1/departments', requireAuth, departmentController.save);

export default router;
