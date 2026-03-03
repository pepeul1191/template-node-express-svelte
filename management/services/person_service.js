// management/services/person_service.js

import { Op } from 'sequelize';
import sequelize from '../../configs/database.js';
import Person from '../models/persons.js';
import Worker from '../models/workers.js';

/**
 * Crear una nueva persona
 */
export const createPerson = async (payload) => {
  const transaction = await sequelize.transaction();

  try {
    // Validar campos requeridos
    if (!payload.names || !payload.last_names) {
      throw {
        status: 400,
        message: 'Los nombres y apellidos son obligatorios',
      };
    }

    // Validar documento único si se proporciona
    if (payload.document_number) {
      const existingPerson = await Person.findOne({
        where: { document_number: payload.document_number },
        transaction,
      });

      if (existingPerson) {
        throw {
          status: 400,
          message: 'Ya existe una persona con ese número de documento',
          error: `Documento ${payload.document_number}`,
        };
      }
    }

    const person = await Person.create(
      {
        names: payload.names,
        last_names: payload.last_names,
        document_number: payload.document_number || null,
        image_url: payload.image_url || null,
        birth_date: payload.birth_date || null,
        created: new Date(),
        updated: new Date(),
        sex_id: payload.sex_id || null,
        document_type_id: payload.document_type_id || null,
      },
      { transaction }
    );

    await transaction.commit();

    return person.toJSON();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Actualizar una persona existente
 */
export const updatePerson = async (id, payload) => {
  const transaction = await sequelize.transaction();

  try {
    const person = await Person.findByPk(id, { transaction });

    if (!person) {
      throw {
        status: 404,
        message: 'Persona no encontrada',
        error: `ID ${id}`,
      };
    }

    // Validar documento único si se está actualizando
    if (payload.document_number && payload.document_number !== person.document_number) {
      const existingPerson = await Person.findOne({
        where: { 
          document_number: payload.document_number,
          id: { [Op.ne]: id } // Excluir la persona actual
        },
        transaction,
      });

      if (existingPerson) {
        throw {
          status: 400,
          message: 'Ya existe otra persona con ese número de documento',
          error: `Documento ${payload.document_number}`,
        };
      }
    }

    const updateData = {
      names: payload.names ?? person.names,
      last_names: payload.last_names ?? person.last_names,
      document_number: payload.document_number ?? person.document_number,
      image_url: payload.image_url ?? person.image_url,
      birth_date: payload.birth_date ?? person.birth_date,
      updated: new Date(),
      sex_id: payload.sex_id ?? person.sex_id,
      document_type_id: payload.document_type_id ?? person.document_type_id,
    };

    //onsole.log('Updating person with data:', updateData);

    await person.update(updateData, { transaction });
    await transaction.commit();

    // Obtener la persona actualizada con sus relaciones
    return updateData;
  } catch (error) {
    console.log(error)
    await transaction.rollback();
    throw error;
  }
};

/**
 * Eliminar una persona (solo si no está asociada a un worker)
 */
export const deletePerson = async (id) => {
  const transaction = await sequelize.transaction();

  try {
    const person = await Person.findByPk(id, { transaction });

    if (!person) {
      throw {
        status: 404,
        message: 'Persona no encontrada',
        error: `ID ${id}`,
      };
    }

    // Verificar si la persona está asociada a un worker
    const worker = await Worker.findOne({ 
      where: { person_id: id }, 
      transaction 
    });

    if (worker) {
      throw {
        status: 400,
        message: 'No se puede eliminar la persona porque está registrada como trabajador',
        error: `Person ID ${id} está asociada al worker ID ${worker.id}`,
      };
    }

    await person.destroy({ transaction });
    await transaction.commit();

    return true;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
