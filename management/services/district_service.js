// management/services/province_service.js

import { Op } from 'sequelize';
import sequelize from '../../configs/database.js';
import District from '../models/district.js';
import VwLocations from '../models/vw_locations.js';

/**
 * Obtener provincias por departamento
 */
export const fetchAll = async (provinceId) => {
  const provinces = await District.findAll({
    where: { province_id: provinceId }
  });

  return provinces.map(province => province.toJSON());
};

/**
 * Crear / actualizar / eliminar provincias
 * @param {number} provinceId
 * @param {object} payload
 */
export const saveMany = async (provinceId, payload) => {
  const transaction = await sequelize.transaction();

  try {
    const response = [];
    const { news = [], edits = [], deletes = [] } = payload;

    // 1️⃣ Crear nuevas provincias
    for (const incoming of news) {
      const province = await District.create(
        {
          name: incoming.name,
          province_id: provinceId
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
      const province = await District.findOne({
        where: {
          id: incoming.id,
          province_id: provinceId
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
      const province = await District.findOne({
        where: {
          id: idToDelete,
          province_id: provinceId
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

/**
 * Buscar ubicaciones por nombre (district_id + full_name)
 * @param {string} searchTerm - término de búsqueda
 * @param {number} limit - máximo de resultados (default: 10)
 * @returns {array} lista de ubicaciones coincidentes
 */
export const searchLocations = async (searchTerm = '', limit = 10) => {
  if (!searchTerm || typeof searchTerm !== 'string') {
    return [];
  }
  console.log('+++++++++++++++++++++++')
  console.log(searchTerm)
  const locations = await VwLocations.findAll({
    where: {
      full_name: {
        [Op.like]: `%${searchTerm}%`
      }
    },
    limit: Number(limit) || 10,
    order: [['full_name', 'ASC']],
    raw: true
  });

  return locations;
};
