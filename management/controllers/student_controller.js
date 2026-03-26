// management/controllers/student_controller.js

import * as studentService from '../services/student_service.js';
import * as personService from '../services/person_service.js';

export const fetchAll = async (req, res) => {
  try {
    const { name, document_number, code, email, step = 10, page = 1 } = req.query;

    const [students, counts] = await Promise.all([
      studentService.fetchStudents({ name, document_number, code, email, step, page }),
      studentService.countTotalPages({ name, document_number, code, email, step }),
    ]);

    if (!students || students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recurso no encontrado',
        data: null,
        error: 'Error 404',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Lista de estudiantes',
      data: {
        list: students,
        pages: counts.totalPages,
        total: counts.totalRecords,
        offset: (Number(page) - 1) * Number(step),
      },
      error: '',
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      data: null,
      error: error.message,
    });
  }
};

export const create = async (req, res) => {
  try {
    const { person, code } = req.body;

    const student = await studentService.createFromPerson(person, code);

    return res.status(201).json({
      success: true,
      message: 'Estudiante creado correctamente',
      data: {
        id: student.id,
        person_id: student.person.id,
        created: student.created || null,
        updated: student.updated || null,
      },
      error: '',
    });

  } catch (error) {
    console.log(error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error interno del servidor',
      data: null,
      error: error.error || error.message,
    });
  }
};

export const fetchByPerson = async (req, res) => {
  try {
    const { personId } = req.params;

    if (!personId) {
      return res.status(400).json({
        success: false,
        message: 'personId es requerido',
        data: null,
        error: 'personId faltante',
      });
    }

    const student = await studentService.findByPerson(personId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado',
        data: null,
        error: 'Error 404',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Estudiante obtenido correctamente',
      data: student,
      error: '',
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      data: null,
      error: error.message,
    });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, person } = req.body;

    if (code === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Debe enviar al menos un campo a actualizar',
        data: null,
        error: 'Campos faltantes',
      });
    }

    const student = await studentService.updateStudent(id, { code });
    await personService.updatePerson(person.id, person);

    return res.status(200).json({
      success: true,
      message: 'Estudiante actualizado correctamente',
      data: { updated: student.updated || null },
      error: '',
    });

  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error interno del servidor',
      data: null,
      error: error.error || error.message,
    });
  }
};

export const deleteR = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID de estudiante requerido',
        data: null,
        error: 'ID faltante',
      });
    }

    await studentService.deleteStudent(id);

    return res.status(200).json({
      success: true,
      message: 'Estudiante eliminado correctamente',
      data: null,
      error: '',
    });

  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error interno del servidor',
      data: null,
      error: error.error || error.message,
    });
  }
};

export const asociateUser = async (req, res) => {
  try { 
    const { id } = req.params;
    let { user_id, email } = req.body;

    if (!id || !email) {
      return res.status(400).json({
        success: false,
        message: 'ID y correo de estudiante requerido',
        data: null,
        error: 'Datos faltantes',
      });
    }

    if (!user_id) {
      user_id = null;
    }

    await studentService.updateStudentEmailUser(id, email, user_id);

    return res.status(200).json({
      success: true,
      message: 'Estudiante actualizado correctamente',
      data: null,
      error: '',
    });

  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error interno del servidor',
      data: null,
      error: error.error || error.message,
    });
  }
};

export const removeUser = async (req, res) => {
  try { 
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID de estudiante requerido',
        data: null,
        error: 'ID faltante',
      });
    }

    await studentService.removeUser(id);

    return res.status(200).json({
      success: true,
      message: 'Estudiante actualizado correctamente',
      data: null,
      error: '',
    });

  } catch (error) {
    console.log(error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error interno del servidor',
      data: null,
      error: error.error || error.message,
    });
  }
};