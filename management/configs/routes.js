// management/configs/routes.js
import { Router } from 'express';
import * as locationController from '../controllers/locations_controller.js';
import { requireAuth } from '../../configs/middlewares.js';
import { redirectIfAuthenticated } from '../../configs/middlewares.js'; 


const router = Router();

router.get('/locations', requireAuth, locationController.index);

export default router;
