// management/services/sex_service.js
import sequelize from '../../configs/database.js';
import Sex from '../models/sex.js';

/**
 * Obtener sexs de empleado
 */
export const fetchAll = async () => {
  const sexs = await Sex.findAll();

  return sexs.map(role => role.toJSON());
};

/**
 * Crear, actualizar y eliminar múltiples sexs
 */
export const saveMany = async (payload) => {
  const transaction = await sequelize.transaction();

  try {
    const response = [];

    const { news = [], edits = [], deletes = [] } = payload;

    // 1. Crear nuevos sexs
    for (const incoming of news) {
      const role = await Sex.create(
        {
          name: incoming.name,
        },
        { transaction }
      );

      response.push({
        tmp: incoming.id,
        id: role.id.toString(),
      });
    }

    // 2. Actualizar sexs existentes
    for (const incoming of edits) {
      const role = await Sex.findByPk(incoming.id, { transaction });

      if (!role) {
        throw {
          status: 404,
          message: 'Sexo no encontrado',
          error: `ID ${incoming.id}`,
        };
      }

      await role.update(
        {
          name: incoming.name,
        },
        { transaction }
      );
    }

    // 3. Eliminar sexs
    for (const idToDelete of deletes) {
      const role = await Sex.findByPk(idToDelete, { transaction });

      if (!role) {
        throw {
          status: 404,
          message: 'Sexo no encontrado',
          error: `ID ${idToDelete}`,
        };
      }

      await role.destroy({ transaction });
    }

    await transaction.commit();
    return response;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
