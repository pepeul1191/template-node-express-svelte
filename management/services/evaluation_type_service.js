// management/services/evaluation_type_service.js
import sequelize from '../../configs/database.js';
import EvaluationType from '../models/evaluation_type.js';

/**
 * Obtener sexs de empleado
 */
export const fetchAll = async () => {
  const sexs = await EvaluationType.findAll();

  return sexs.map(sex => sex.toJSON());
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
      const sex = await EvaluationType.create(
        {
          name: incoming.name,
        },
        { transaction }
      );

      response.push({
        tmp: incoming.id,
        id: sex.id.toString(),
      });
    }

    // 2. Actualizar sexs existentes
    for (const incoming of edits) {
      const sex = await EvaluationType.findByPk(incoming.id, { transaction });

      if (!sex) {
        throw {
          status: 404,
          message: 'Tipo de evaluación no encontrada',
          error: `ID ${incoming.id}`,
        };
      }

      await sex.update(
        {
          name: incoming.name,
        },
        { transaction }
      );
    }

    // 3. Eliminar sexs
    for (const idToDelete of deletes) {
      const sex = await EvaluationType.findByPk(idToDelete, { transaction });

      if (!sex) {
        throw {
          status: 404,
          message: 'Tipo de Evaluación no encontrada',
          error: `ID ${idToDelete}`,
        };
      }

      await sex.destroy({ transaction });
    }

    await transaction.commit();
    return response;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
