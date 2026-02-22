// management/controllers/document_types_controller.js

import * as service from '../services/document_type_service.js';

export const fetchAll = async (req, res) => {
  try {
    const types = await service.fetchAll();

    return res.status(200).json({
      success: true,
      message: 'Lista de Tippos de Documentos de Entidad',
      data: {
        list: types
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
