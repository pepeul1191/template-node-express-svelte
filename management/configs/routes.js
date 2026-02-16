// management/configs/routes.js
import { Router } from 'express';
import * as locationController from '../controllers/locations_controller.js';
import * as departmentController from '../controllers/departments_controller.js';
import { requireAuth } from '../../configs/middlewares.js';
import { redirectIfAuthenticated } from '../../configs/middlewares.js'; 


const router = Router();

//router.get('/locations', requireAuth, locationController.index);
//router.get('/locations/departments', requireAuth, departmentController.add);
router.post('/locations/departments', requireAuth, departmentController.create);

export default router;
