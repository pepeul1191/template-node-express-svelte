// management/services/representative_role_service.js

import sequelize from '../../configs/database.js';
import RepresentativeRole from '../models/representative_role.js';

/**
 * Obtener roles de representante
 */
export const fetchAll = async () => {
  const roles = await RepresentativeRole.findAll();

  return roles.map(role => role.toJSON());
};

/**
 * Crear, actualizar y eliminar múltiples roles
 */
export const saveMany = async (payload) => {
  const transaction = await sequelize.transaction();

  try {
    const response = [];

    const { news = [], edits = [], deletes = [] } = payload;

    // 1. Crear nuevos roles
    for (const incoming of news) {
      const role = await RepresentativeRole.create(
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

    // 2. Actualizar roles existentes
    for (const incoming of edits) {
      const role = await RepresentativeRole.findByPk(incoming.id, { transaction });

      if (!role) {
        throw {
          status: 404,
          message: 'Rol de representante no encontrado',
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

    // 3. Eliminar roles
    for (const idToDelete of deletes) {
      const role = await RepresentativeRole.findByPk(idToDelete, { transaction });

      if (!role) {
        throw {
          status: 404,
          message: 'Rol de representante no encontrado',
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
