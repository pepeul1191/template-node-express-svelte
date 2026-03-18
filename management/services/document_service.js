// management/services/document_service.js
import sequelize from '../../configs/database.js';
import Document from '../models/document.js';

export const deleteDocument = async (documentId) => {
  const transaction = await sequelize.transaction();

  try {
    const document = await Document.findByPk(documentId);

    if (!document) {
      throw {
        status: 404,
        message: 'Documento no encontrado',
        error: `Document ID ${documentId}`
      };
    }

    // Eliminar registro (el archivo físico lo gestiona el servicio de storage)
    await document.destroy({ transaction });

    await transaction.commit();

  } catch (error) {
    await transaction.rollback();
    throw {
      status: error.status || 500,
      message: error.message || 'Error al eliminar el documento',
      error: error.error || error.message
    };
  }
};

export const registerDocument = async ({ folder_id, title, url, uploaded_by }) => {
  const transaction = await sequelize.transaction();

  try {
    // Si folder_id no es null, verificar que la carpeta existe
    if (folder_id) {
      const folder = await Folder.findByPk(folder_id);
      if (!folder) {
        throw {
          status: 404,
          message: 'Carpeta no encontrada',
          error: `Folder ID ${folder_id}`
        };
      }
    }

    const document = await Document.create({
      folder_id,
      title,
      url,
      uploaded_by,
      created: new Date(),
      updated: new Date()
    }, { transaction });

    await transaction.commit();

    return {
      id: document.id,
      title: document.title,
      url: document.url,
      created: document.created
    };

  } catch (error) {
    await transaction.rollback();
    throw {
      status: error.status || 500,
      message: error.message || 'Error al registrar el documento',
      error: error.error || error.message
    };
  }
};