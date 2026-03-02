// management/services/worker_service.js

import { Op } from 'sequelize';
import sequelize from '../../configs/database.js';
import Person from '../models/persons.js';
import Worker from '../models/workers.js';
import Sex from '../models/sex.js';
import DocumentType from '../models/document_type.js';

// buildWhere only handles criteria that live on the Person model
const buildWhere = ({ name, documentNumber }) => {
  const wherePerson = {};

  if (name) {
    wherePerson[Op.or] = [
      { names: { [Op.like]: `%${name}%` } },
      { lastNames: { [Op.like]: `%${name}%` } },
    ];
  }

  if (documentNumber) {
    wherePerson.documentNumber = { [Op.like]: `%${documentNumber}%` };
  }

  return wherePerson;
};

/**
 * Obtener workers con datos de persona (paginado)
 */
export const fetchWorkers = async ({ name, documentNumber, code, step = 10, page = 1 }) => {
  const wherePerson = buildWhere({ name, documentNumber });
  // filters that apply directly to the Worker table
  const whereWorker = {};
  if (code) {
    whereWorker.code = { [Op.like]: `%${code}%` };
  }

  const limit = Number(step);
  const offset = (Number(page) - 1) * limit;

  const workers = await Worker.findAll({
    where: whereWorker,
    include: [
      {
        model: Person,
        as: 'person', // 👈 obligatorio
        where: wherePerson,
        required: true,
        attributes: [
          ['id', 'id'],
          ['names', 'names'],
          ['lastNames', 'last_names'],        // 👈 alias aquí
          ['documentNumber', 'document_number'],
          ['imageUrl', 'image_url'],
          ['birthDate', 'birth_date'],
          ['created', 'created'],
          ['updated', 'updated'],
        ],
        include: [
          {
            model: Sex,
            as: 'sex',
            attributes: ['id', 'name'],
          },
          {
            model: DocumentType,
            as: 'document_type',
            attributes: ['id', 'name'],
          },
        ],
      },
    ],
    limit,
    offset,
    order: [['id', 'ASC']],
  });

  return workers.map(w => {
    const data = w.toJSON();
    return {
        id: data.id,
        code: data.code,
        bio: data.bio,
        person: data.person,
    };
  });
};

export const countTotalPages = async ({ name, documentNumber, code, step = 10 }) => {
  const wherePerson = buildWhere({ name, documentNumber });
  const whereWorker = {};
  if (code) {
    whereWorker.code = { [Op.like]: `%${code}%` };
  }

  const totalRecords = await Worker.count({
    where: whereWorker,
    include: [
      {
        model: Person,
        as: 'person',
        where: wherePerson,
        required: true
      }
    ],
    distinct: true,
  });

  const totalPages = Math.ceil(totalRecords / Number(step));
  return { totalPages, totalRecords };
};

/**
 * Crear un worker a partir de una persona
 * @param {number|string} personId
 * @param {object} payload - { code, bio }
 * @returns {object} worker
 */
export const createFromPerson = async (personId, payload = {}) => {
  const transaction = await sequelize.transaction();

  try {
    const person = await Person.findByPk(personId, { transaction });

    if (!person) {
      throw {
        status: 404,
        message: 'Persona no encontrada',
        error: `ID ${personId}`,
      };
    }

    // Verificar que la persona no sea ya un worker
    const existing = await Worker.findOne({ where: { person_id: personId }, transaction });

    if (existing) {
      throw {
        status: 400,
        message: 'La persona ya está registrada como trabajador',
        error: `Person ID ${personId}`,
      };
    }

    const worker = await Worker.create(
      {
        person_id: personId,
        code: payload.code ?? null,
        bio: payload.bio ?? null,
      },
      { transaction }
    );

    await transaction.commit();

    return worker.toJSON();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const findByPerson = async (personId) => {
  const worker = await Worker.findOne({ where: { person_id: personId }, include: [{ model: Person, as: 'person' }] });

  if (!worker) return null;
  return worker.toJSON();
};

export const updateWorker = async (id, payload = {}) => {
  const transaction = await sequelize.transaction();

  try {
    const worker = await Worker.findByPk(id, { transaction });

    if (!worker) {
      throw {
        status: 404,
        message: 'Worker no encontrado',
        error: `ID ${id}`,
      };
    }

    const { code, bio } = payload;

    await worker.update({ code: code ?? worker.code, bio: bio ?? worker.bio }, { transaction });

    await transaction.commit();

    return worker.toJSON();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const deleteWorker = async (id) => {
  const transaction = await sequelize.transaction();

  try {
    const worker = await Worker.findByPk(id, { transaction });

    if (!worker) {
      throw {
        status: 404,
        message: 'Worker no encontrado',
        error: `ID ${id}`,
      };
    }

    await worker.destroy({ transaction });

    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

