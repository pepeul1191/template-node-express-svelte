// management/locations/controllers.js

import * as departmentService from '../services/department_service.js';

export async function index(req, res) {
  try {
    const departments = await departmentService.fetchAll();

    // ⚡ Solo leer los flash messages
    const error_messages = req.flash('error');
    const success_messages = req.flash('success');
    const hasFlashMessages = success_messages.length > 0 || error_messages.length > 0;

    res.render('management/locations/index', {
      title: 'Gestión de Locaciones',
      departments,
      provinces: undefined,
      districts: undefined,
    });

  } catch (error) {
    console.error(error.stack);

    req.flash('error', `Error al listar los departamentos - ${error.message}`);
     // ⚡ Solo leer los flash messages
    const error_messages = req.flash('error');
    const success_messages = req.flash('success');
    const hasFlashMessages = success_messages.length > 0 || error_messages.length > 0;

    res.render('management/locations/index', {
      title: 'Gestión de Locaciones',
      departments: undefined,
      provinces: undefined,
      districts: undefined,
      error_messages,
      success_messages,
      hasFlashMessages
    });
  }
}

