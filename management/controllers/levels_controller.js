// management/controllers/levels_controller.js

import * as service from '../services/level_service.js';

export const fetchAll = async (req, res) => {
  try {
    const roles = await service.fetchAll();

    return res.status(200).json({
      success: true,
      message: 'Lista de niveles acaémicos',
      data: {
        list: roles
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

export const save = async (req, res) => {
  try {
    const response = await service.saveMany(req.body);

    return res.status(200).json({
      success: true,
      message: 'Nivels académicos guardados correctamente',
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
