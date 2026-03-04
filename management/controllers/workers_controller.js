// management/controllers/workers_controller.js

import * as workerService from '../services/worker_service.js';
import * as personService from '../services/person_service.js';

export const fetchAll = async (req, res) => {
  try {
    const { name, document_number, code, email, step = 10, page = 1 } = req.query;

    const [workers, counts] = await Promise.all([
      workerService.fetchWorkers({ name, document_number, code, email, step, page }),
      workerService.countTotalPages({ name, document_number, code, email, step }),
    ]);

    if (!workers || workers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recurso no encontrado',
        data: null,
        error: 'Error 404',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Lista de trabajadores',
      data: {
        list: workers,
        pages: counts.totalPages,
        total: counts.totalRecords,
        offset: (Number(page) - 1) * Number(step),
      },
      error: '',
    });

  } catch (error) {
    console.log(error)

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
    const { person_id, code, bio } = req.body;

    if (!person_id) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos obligatorios',
        data: null,
        error: 'person_id es requerido',
      });
    }

    const worker = await workerService.createFromPerson(person_id, { code, bio });

    return res.status(201).json({
      success: true,
      message: 'Trabajador creado correctamente',
      data: {
        id: worker.id,
        created: worker.created || null,
        updated: worker.updated || null,
      },
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

    const worker = await workerService.findByPerson(personId);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Trabajador no encontrado',
        data: null,
        error: 'Error 404',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Trabajador obtenido correctamente',
      data: worker,
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
    const { code, bio, person } = req.body;

    if (code === undefined && bio === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Debe enviar al menos un campo a actualizar',
        data: null,
        error: 'Campos faltantes',
      });
    }

    const worker = await workerService.updateWorker(id, { code, bio });
    await personService.updatePerson(id, person);

    return res.status(200).json({
      success: true,
      message: 'Trabajador actualizado correctamente',
      data: { updated: worker.updated || null },
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
        message: 'ID de trabajador requerido',
        data: null,
        error: 'ID faltante',
      });
    }

    await workerService.deleteWorker(id);

    return res.status(200).json({
      success: true,
      message: 'Trabajador eliminado correctamente',
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
    const { user_id, email } = req.body;    

    if (!id || !email) {
      return res.status(400).json({
        success: false,
        message: 'ID y correo de trabajador requerido',
        data: null,
        error: 'ID faltante',
      });
    }

    if (!user_id) {
      user_id = null;
    }

    await workerService.updateWorkerEmailUser(id, email, user_id);

    return res.status(200).json({
      success: true,
      message: 'Trabajador actualizado correctamente',
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
        message: 'ID  de trabajador requerido',
        data: null,
        error: 'ID faltante',
      });
    }

    await workerService.removeUser(id);

    return res.status(200).json({
      success: true,
      message: 'Trabajador actualizado correctamente',
      data: null,
      error: '',
    });

  } catch (error) {
    console.log(error)
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error interno del servidor',
      data: null,
      error: error.error || error.message,
    });
  }
};