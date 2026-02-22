// management/configs/routes.js
import { Router } from 'express';
import * as departmentController from '../controllers/departments_controller.js';
import * as provinceController from '../controllers/provinces_controller.js';
import * as districtController from '../controllers/districts_controller.js';
import * as employeeRoleController from '../controllers/employee_roles_controller.js';
import * as representativeRoleController from '../controllers/reprsentative_roles_controller.js';
import * as documentTypeController from '../controllers/document_types_controller.js';
import { requireAuth } from '../../configs/middlewares.js';
import { redirectIfAuthenticated } from '../../configs/middlewares.js'; 


const router = Router();

// departments
router.get('/api/v1/departments', requireAuth, departmentController.fetchAll);
router.post('/api/v1/departments', requireAuth, departmentController.save);
// provinces
router.get('/api/v1/provinces/:departmentId', requireAuth, provinceController.fetchAll);
router.post('/api/v1/provinces/:departmentId', requireAuth, provinceController.save);
// districts
router.get('/api/v1/districts/:provinceId', requireAuth, districtController.fetchAll);
router.post('/api/v1/districts/:provinceId', requireAuth, districtController.save);
// employee-roles
router.get('/api/v1/employee-roles', requireAuth, employeeRoleController.fetchAll);
router.post('/api/v1/employee-roles', requireAuth, employeeRoleController.save);
// representative-roles
router.get('/api/v1/representative-roles', requireAuth, representativeRoleController.fetchAll);
router.post('/api/v1/representative-roles', requireAuth, representativeRoleController.save);
// document_types
router.get('/api/v1/document-types', requireAuth, documentTypeController.fetchAll);

export default router;
