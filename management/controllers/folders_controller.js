// management/controllers/folders_controller.js
import * as service from '../services/folder_service.js';

export const fetchContents = async (req, res) => {
  try {
    const { folderId } = req.params;
    
    const documents = await service.getFolderContents(folderId);

    return res.status(200).json({
      success: true,
      message: 'Contenido de la carpeta',
      data: {
        documents
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

export const fetchRootFolderId = async (req, res) => {
  try {
    const { courseId } = req.params;

    const id = await service.getRootFolderId(courseId);
    
    return res.status(200).json({
      success: true,
      message: 'Contenido de la carpeta',
      data: {
        id
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

export const create = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, rootFolderId } = req.body;

    console.log('1 +++++++++++++++++++++++++')
    console.log(rootFolderId)
    console.log('2 +++++++++++++++++++++++++')

    const folder = await service.createFolder({
      courseId,
      title,
      description,
      parent_id: rootFolderId
    });

    return res.status(201).json({
      success: true,
      message: 'Carpeta creada correctamente',
      data: folder,
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

export const remove = async (req, res) => {
  try {
    const { folderId } = req.params;

    await service.deleteFolder(folderId);

    return res.status(200).json({
      success: true,
      message: 'Carpeta eliminada correctamente',
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
