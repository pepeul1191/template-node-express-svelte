// management/services/department_service.js
import sequelize from '../../configs/database.js';
import Department from '../models/department.js';

/**
 * Obtener departamentos
 */
export const fetchAll = async () => {
  const departments = await Department.findAll();

  return departments.map(department => department.toJSON());
};

export const saveMany = async (payload) => {
  const transaction = await sequelize.transaction();

  try {
    const response = [];

    const { news = [], edits = [], deletes = [] } = payload;

    // 1. Crear nuevos departments
    for (const incoming of news) {
      const department = await Department.create(
        {
          name: incoming.name,
        },
        { transaction }
      );

      response.push({
        tmp: incoming.id,
        id: department.id.toString(),
      });
    }

    // 2. Actualizar departments existentes
    for (const incoming of edits) {
      const department = await Department.findByPk(incoming.id, { transaction });

      if (!department) {
        throw {
          status: 404,
          message: 'Departamento no encontrado',
          error: `ID ${incoming.id}`,
        };
      }

      await department.update(
        {
          name: incoming.name,
        },
        { transaction }
      );
    }

    // 3. Eliminar departments
    for (const idToDelete of deletes) {
      const department = await Department.findByPk(idToDelete, { transaction });

      if (!department) {
        throw {
          status: 404,
          message: 'Departamento no encontrado',
          error: `ID ${idToDelete}`,
        };
      }

      await department.destroy({ transaction });
    }

    await transaction.commit();
    return response;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};