// management/controllers/files_controller.js
import * as service from '../services/file_service.js';

export const remove = async (req, res) => {
  try {
    const { documentId } = req.params;

    await service.deleteDocument(documentId);

    return res.status(200).json({
      success: true,
      message: 'Documento eliminado correctamente',
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

// Endpoint para registrar un documento subido directamente desde el frontend al storage
export const register = async (req, res) => {
  try {
    const { folder_id, name, url, uploaded_by } = req.body;

    const document = await service.registerFile({
      folder_id: folder_id || null, // Si es null, va a la raíz
      name,
      url,
      uploaded_by
    });

    return res.status(201).json({
      success: true,
      message: 'Documento registrado correctamente',
      data: document,
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