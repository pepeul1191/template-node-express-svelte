// management/controllers/districts_controller.js

import * as service from '../services/district_service.js';

/**
 * Obtener distritos por provincia
 */
export const fetchAll = async (req, res) => {
  try {
    const { provinceId } = req.params;

    if (!provinceId) {
      return res.status(400).json({
        success: false,
        message: 'ID de provincia inválido',
        data: null,
        error: '',
      });
    }

    const districts = await service.fetchAll(provinceId);

    return res.status(200).json({
      success: true,
      message: 'Lista de distritos',
      data: {
        list: districts
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
 * Crear / actualizar / eliminar distritos
 */
export const save = async (req, res) => {
  try {
    const { provinceId } = req.params;

    if (!provinceId) {
      return res.status(400).json({
        success: false,
        message: 'ID de provincia inválido',
        data: null,
        error: '',
      });
    }

    const response = await service.saveMany(
      provinceId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: 'distritos guardadas correctamente',
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
