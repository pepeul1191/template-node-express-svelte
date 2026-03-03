import * as service from '../services/phone_service.js';

/**
 * Obtener teléfonos por persona
 */
export const fetchAll = async (req, res) => {
  try {
    const { personId } = req.params;

    if (!personId) {
      return res.status(400).json({
        success: false,
        message: 'ID de persona inválido',
        data: null,
        error: '',
      });
    }

    const phones = await service.fetchAll(personId);

    return res.status(200).json({
      success: true,
      message: 'Lista de teléfonos',
      data: {
        list: phones
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
 * Crear / actualizar / eliminar teléfonos
 */
export const save = async (req, res) => {
  try {
    const { personId } = req.params;

    if (!personId) {
      return res.status(400).json({
        success: false,
        message: 'ID de persona inválido',
        data: null,
        error: '',
      });
    }

    const response = await service.saveMany(
      personId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: 'Teléfonos guardados correctamente',
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