// management/services/folder_service.js
import sequelize from '../../configs/database.js';
import Folder from '../models/folder.js';
import FolderCommonMaterial from '../models/folder_common_material.js';
import Document from '../models/document.js';

export const getFolderContents = async (folderId) => {
  const folder = await Folder.findByPk(folderId, {
    include: [{
      model: Document,
      as: 'documents',
      required: false
    }]
  });

  if (!folder) {
    throw {
      status: 404,
      message: 'Carpeta no encontrada',
      error: `Folder ID ${folderId}`
    };
  }

  return folder.documents || [];
};

export const createFolder = async ({ courseId, title, description }) => {
  const transaction = await sequelize.transaction();

  try {
    // Verificar si ya existe una carpeta con el mismo título en el curso
    const existingFolder = await Folder.findOne({
      include: [{
        model: FolderCommonMaterial,
        as: 'commonMaterial',
        where: { course_id: courseId }
      }],
      where: { title }
    });

    if (existingFolder) {
      throw {
        status: 400,
        message: 'Ya existe una carpeta con ese título en este curso',
        error: 'Duplicate folder title'
      };
    }

    // Crear la carpeta
    const folder = await Folder.create({
      title,
      description,
      parent_id: null, // Solo un nivel, siempre null
      created: new Date(),
      updated: new Date()
    }, { transaction });

    // Asociar la carpeta al curso como material común
    await FolderCommonMaterial.create({
      id: folder.id,
      course_id: courseId
    }, { transaction });

    await transaction.commit();
    
    return {
      id: folder.id,
      title: folder.title,
      description: folder.description,
      created: folder.created
    };

  } catch (error) {
    await transaction.rollback();
    throw {
      status: error.status || 500,
      message: error.message || 'Error al crear la carpeta',
      error: error.error || error.message
    };
  }
};

export const deleteFolder = async (folderId) => {
  const transaction = await sequelize.transaction();

  try {
    const folder = await Folder.findByPk(folderId);

    if (!folder) {
      throw {
        status: 404,
        message: 'Carpeta no encontrada',
        error: `Folder ID ${folderId}`
      };
    }

    // Eliminar la carpeta (CASCADE eliminará documentos y asociaciones)
    await folder.destroy({ transaction });

    await transaction.commit();

  } catch (error) {
    await transaction.rollback();
    throw {
      status: error.status || 500,
      message: error.message || 'Error al eliminar la carpeta',
      error: error.error || error.message
    };
  }
};