import sequelize from '../../configs/database.js';
import Phone from '../models/phones.js';

/**
 * Obtener teléfonos por persona
 */
export const fetchAll = async (personId) => {
  const phones = await Phone.findAll({
    where: { person_id: personId }
  });

  return phones.map(phone => phone.toJSON());
};


/**
 * Crear / actualizar / eliminar teléfonos
 */
export const saveMany = async (personId, payload) => {
  const transaction = await sequelize.transaction();

  try {
    const response = [];
    const { news = [], edits = [], deletes = [] } = payload;

    // 1️⃣ Crear nuevos teléfonos
    for (const incoming of news) {
      const phone = await Phone.create(
        {
          person_id: personId,
          description: incoming.description,
          phone: incoming.phone
        },
        { transaction }
      );

      response.push({
        tmp: incoming.id,
        id: phone.id.toString(),
      });
    }

    // 2️⃣ Actualizar teléfonos existentes
    for (const incoming of edits) {
      const phone = await Phone.findOne({
        where: {
          id: incoming.id,
          person_id: personId
        },
        transaction
      });

      if (!phone) {
        throw {
          status: 404,
          message: 'Teléfono no encontrado',
          error: `ID ${incoming.id}`,
        };
      }

      await phone.update(
        {
          description: incoming.description,
          phone: incoming.phone,
        },
        { transaction }
      );
    }

    // 3️⃣ Eliminar teléfonos
    for (const idToDelete of deletes) {
      const phone = await Phone.findOne({
        where: {
          id: idToDelete,
          person_id: personId
        },
        transaction
      });

      if (!phone) {
        throw {
          status: 404,
          message: 'Teléfono no encontrado',
          error: `ID ${idToDelete}`,
        };
      }

      await phone.destroy({ transaction });
    }

    await transaction.commit();
    return response;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};