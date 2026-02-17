// management/controllers/provinces_controller.js

import * as service from '../services/province_service.js';

/**
 * Obtener provincias por departamento
 */
export const fetchAll = async (req, res) => {
  try {
    const { departmentId } = req.params;

    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: 'ID de departamento inválido',
        data: null,
        error: '',
      });
    }

    const provinces = await service.fetchAll(departmentId);

    return res.status(200).json({
      success: true,
      message: 'Lista de provincias',
      data: {
        list: provinces
      },
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


/**
 * Crear / actualizar / eliminar provincias
 */
export const save = async (req, res) => {
  try {
    const { departmentId } = req.params;

    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: 'ID de departamento inválido',
        data: null,
        error: '',
      });
    }

    const response = await service.saveMany(
      departmentId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: 'Provincias guardadas correctamente',
      data: response,
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
