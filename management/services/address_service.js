// management/services/address_service.js

import sequelize from '../../configs/database.js';
import Address from '../models/addresses.js';
import District from '../models/district.js';

/**
 * Obtener direcciones por persona
 */
export const fetchAll = async (personId) => {
  const addresses = await Address.findAll({
    where: { person_id: personId },
    include: [
      {
        model: District,
        as: 'district'
      }
    ]
  });

  return addresses.map(address => address.toJSON());
};


/**
 * Crear / actualizar / eliminar direcciones
 */
export const saveMany = async (personId, payload) => {
  const transaction = await sequelize.transaction();

  try {
    const response = [];
    const { news = [], edits = [], deletes = [] } = payload;

    // 1️⃣ Crear nuevas direcciones
    for (const incoming of news) {

      // validar distrito
      const district = await District.findByPk(incoming.district_id, { transaction });
      if (!district) {
        throw {
          status: 404,
          message: 'Distrito no encontrado',
          error: `ID ${incoming.district_id}`
        };
      }

      const address = await Address.create(
        {
          person_id: personId,
          district_id: incoming.district_id,
          description: incoming.description,
          address: incoming.address
        },
        { transaction }
      );

      response.push({
        tmp: incoming.id,
        id: address.id.toString(),
      });
    }

    // 2️⃣ Actualizar
    for (const incoming of edits) {

      const address = await Address.findOne({
        where: {
          id: incoming.id,
          person_id: personId
        },
        transaction
      });

      if (!address) {
        throw {
          status: 404,
          message: 'Dirección no encontrada',
          error: `ID ${incoming.id}`,
        };
      }

      // validar distrito si viene
      if (incoming.district_id) {
        const district = await District.findByPk(incoming.district_id, { transaction });
        if (!district) {
          throw {
            status: 404,
            message: 'Distrito no encontrado',
            error: `ID ${incoming.district_id}`
          };
        }
      }

      await address.update(
        {
          district_id: incoming.district_id,
          description: incoming.description,
          address: incoming.address,
        },
        { transaction }
      );
    }

    // 3️⃣ Eliminar
    for (const idToDelete of deletes) {

      const address = await Address.findOne({
        where: {
          id: idToDelete,
          person_id: personId
        },
        transaction
      });

      if (!address) {
        throw {
          status: 404,
          message: 'Dirección no encontrada',
          error: `ID ${idToDelete}`,
        };
      }

      await address.destroy({ transaction });
    }

    await transaction.commit();
    return response;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};