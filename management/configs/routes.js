// management/configs/routes.js
import { Router } from 'express';
import * as departmentController from '../controllers/departments_controller.js';
import * as provinceController from '../controllers/provinces_controller.js';
import * as districtController from '../controllers/districts_controller.js';
import * as employeeRoleController from '../controllers/employee_roles_controller.js';
import * as representativeRoleController from '../controllers/reprsentative_roles_controller.js';
import * as documentTypeController from '../controllers/document_types_controller.js';
import * as levelController from '../controllers/levels_controller.js';
import * as evaluationTypeController from '../controllers/evalutation_types_controller.js';
import * as sexController from '../controllers/sexs_controller.js';
import * as workersController from '../controllers/workers_controller.js';
import * as addressesController from '../controllers/addresses_controller.js';
import * as phonesController from '../controllers/phones_controller.js';
import * as studentsController from '../controllers/student_controller.js';
import * as representativesController from '../controllers/representatives_controller.js';
import * as representativesStudentsRolesController from '../controllers/representatives_students_roles_controller.js';

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
router.get('/api/v1/districts/search', requireAuth, districtController.searchLocations);
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
// levels
router.get('/api/v1/levels', requireAuth, levelController.fetchAll);
router.post('/api/v1/levels', requireAuth, levelController.save);
// levels
router.get('/api/v1/evaluation-types', requireAuth, evaluationTypeController.fetchAll);
router.post('/api/v1/evaluation-types', requireAuth, evaluationTypeController.save);
// sexs
router.get('/api/v1/sexs', requireAuth, sexController.fetchAll);
router.post('/api/v1/sexs', requireAuth, sexController.save);
// addresses
router.get('/api/v1/persons/:personId/addresses', requireAuth, addressesController.fetchAll);
router.post('/api/v1/persons/:personId/addresses', requireAuth, addressesController.save);
// phones
router.get('/api/v1/persons/:personId/phones', requireAuth, phonesController.fetchAll);
router.post('/api/v1/persons/:personId/phones', requireAuth, phonesController.save);
// workers
router.get('/api/v1/workers', requireAuth, workersController.fetchAll);
router.post('/api/v1/workers', requireAuth, workersController.create);
router.get('/api/v1/workers/:personId', requireAuth, workersController.fetchByPerson);
router.put('/api/v1/workers/:id', requireAuth, workersController.update);
router.delete('/api/v1/workers/:id', requireAuth, workersController.deleteR);
router.put('/api/v1/workers/:id/associate-user', requireAuth, workersController.asociateUser);
router.put('/api/v1/workers/:id/remove-user', requireAuth, workersController.removeUser);
// students
router.get('/api/v1/students', requireAuth, studentsController.fetchAll);
router.post('/api/v1/students', requireAuth, studentsController.create);
router.get('/api/v1/students/:personId', requireAuth, studentsController.fetchByPerson);
router.put('/api/v1/students/:id', requireAuth, studentsController.update);
router.delete('/api/v1/students/:id', requireAuth, studentsController.deleteR);
router.put('/api/v1/students/:id/associate-user', requireAuth, studentsController.asociateUser);
router.put('/api/v1/students/:id/remove-user', requireAuth, studentsController.removeUser);
// representatives
router.get('/api/v1/representatives', requireAuth, representativesController.fetchAll);
router.post('/api/v1/representatives', requireAuth, representativesController.create);
router.get('/api/v1/representatives/:personId', requireAuth, representativesController.fetchByPerson);
router.put('/api/v1/representatives/:id', requireAuth, representativesController.update);
router.delete('/api/v1/representatives/:id', requireAuth, representativesController.deleteR);
router.put('/api/v1/representatives/:id/associate-user', requireAuth, representativesController.asociateUser);
router.put('/api/v1/representatives/:id/remove-user', requireAuth, representativesController.removeUser);
// representatives students roles
router.get('/api/v1/representatives-students-roles', requireAuth, representativesStudentsRolesController.fetchAll);
router.put('/api/v1/representatives-students-roles/:studentId', requireAuth, representativesStudentsRolesController.save);

export default router;
