// management/controllers/deparments_controller.js

import * as service from '../services/department_service.js';
import DepartmentForm from '../forms/department_form.js';

export async function add(req, res) {
  const errorMessage = req.flash('error');
  const successMessage = req.flash('success');
  console.log('1 ++++++++++++++++++++++++++++++++++++')
  console.log(errorMessage)
  console.log(successMessage)
  console.log('2 ++++++++++++++++++++++++++++++++++++')
  // response
  res.render('management/locations/departments', {
    title: 'Agregar Deparamento',
    form: undefined,
    editing: false,
    errors: undefined,
    successMessage,
    errorMessage,
  });
}

export async function create(req, res) {
  try {
    const form = new DepartmentForm(req.body);

    if (!form.isValid()) {
      //console.log(form);
      // flash
      req.flash('error', `Error al crear departamento - Formulario no válido`);
      req.flash('form', form.erros);
      return res.redirect('/management/locations/departments');
    }

    // ✅ Si pasa validación
    await service.create(form.cleanedData);

    req.flash('success', 'Departamento creado correctamente');
    const successMessage = req.flash('success');


    return res.redirect('/management/locations');

  } catch (error) {
    console.error(error.stack);
    // flash
    req.flash('error', `Error al crear departamento - ${error.message}`);
    req.flash('form', {});

    return res.redirect('/management/locations/departments');
  }
}
