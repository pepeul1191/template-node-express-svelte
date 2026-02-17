// management/configs/routes.js
import { Router } from 'express';
import * as departmentController from '../controllers/departments_controller.js';
import * as provinceController from '../controllers/provinces_controller.js';
import * as districtController from '../controllers/districts_controller.js';
import { requireAuth } from '../../configs/middlewares.js';
import { redirectIfAuthenticated } from '../../configs/middlewares.js'; 


const router = Router();

router.get('/api/v1/departments', requireAuth, departmentController.fetchAll);
router.post('/api/v1/departments', requireAuth, departmentController.save);
router.get('/api/v1/provinces/:departmentId', requireAuth, provinceController.fetchAll);
router.post('/api/v1/provinces/:departmentId', requireAuth, provinceController.save);
router.get('/api/v1/districts/:provinceId', requireAuth, districtController.fetchAll);
router.post('/api/v1/districts/:provinceId', requireAuth, districtController.save);

export default router;
