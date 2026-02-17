// management/services/province_service.js

import sequelize from '../../configs/database.js';
import Province from '../models/province.js';

/**
 * Obtener provincias por departamento
 */
export const fetchAll = async (departmentId) => {
  const provinces = await Province.findAll({
    where: { department_id: departmentId }
  });

  return provinces.map(province => province.toJSON());
};

/**
 * Crear / actualizar / eliminar provincias
 * @param {number} departmentId
 * @param {object} payload
 */
export const saveMany = async (departmentId, payload) => {
  const transaction = await sequelize.transaction();

  try {
    const response = [];
    const { news = [], edits = [], deletes = [] } = payload;

    // 1️⃣ Crear nuevas provincias
    for (const incoming of news) {
      const province = await Province.create(
        {
          name: incoming.name,
          department_id: departmentId
        },
        { transaction }
      );

      response.push({
        tmp: incoming.id,
        id: province.id.toString(),
      });
    }

    // 2️⃣ Actualizar provincias existentes
    for (const incoming of edits) {
      const province = await Province.findOne({
        where: {
          id: incoming.id,
          department_id: departmentId
        },
        transaction
      });

      if (!province) {
        throw {
          status: 404,
          message: 'Provincia no encontrada',
          error: `ID ${incoming.id}`,
        };
      }

      await province.update(
        {
          name: incoming.name,
        },
        { transaction }
      );
    }

    // 3️⃣ Eliminar provincias
    for (const idToDelete of deletes) {
      const province = await Province.findOne({
        where: {
          id: idToDelete,
          department_id: departmentId
        },
        transaction
      });

      if (!province) {
        throw {
          status: 404,
          message: 'Provincia no encontrada',
          error: `ID ${idToDelete}`,
        };
      }

      await province.destroy({ transaction });
    }

    await transaction.commit();
    return response;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
