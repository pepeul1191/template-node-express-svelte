// management/services/worker_service.js

import { Op } from 'sequelize';
import sequelize from '../../configs/database.js';
import Person from '../models/persons.js';
import Worker from '../models/workers.js';
import Sex from '../models/sex.js';
import DocumentType from '../models/document_type.js';

// buildWhere only handles criteria that live on the Person model
const buildWhere = ({ name, document_number, email }) => {
  const wherePerson = {};

  if (name) {
    wherePerson[Op.or] = [
      { names: { [Op.like]: `%${name}%` } },
      { last_names: { [Op.like]: `%${name}%` } },
    ];
  }

  if (document_number) {
    wherePerson.document_number = { [Op.like]: `%${document_number}%` };
  }

  return wherePerson;
};

/**
 * Obtener workers con datos de persona (paginado)
 */
export const fetchWorkers = async ({ name, document_number, code, email, step = 10, page = 1 }) => {
  const wherePerson = buildWhere({ name, document_number, email });
  // filters that apply directly to the Worker table
  const whereWorker = {};
  if (code) {
    whereWorker.code = { [Op.like]: `%${code}%` };
  }
  if (email) {
    whereWorker.email = { [Op.like]: `%${email}%` };
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
          ['last_names', 'last_names'],        // 👈 alias aquí
          ['document_number', 'document_number'],
          ['image_url', 'image_url'],
          ['birth_date', 'birth_date'],
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
        email: data.email,
        user_id: data.user_id,
        person: data.person,
    };
  });
};

export const countTotalPages = async ({ name, document_number, code, email, step = 10 }) => {
  const wherePerson = buildWhere({ name, document_number, email });
  const whereWorker = {};
  if (code) {
    whereWorker.code = { [Op.like]: `%${code}%` };
  }
  if (email) {
    whereWorker.email = { [Op.like]: `%${email}%` };
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

export const createFromPerson = async (person, code = null, bio = null) => {
  const transaction = await sequelize.transaction();

  try {
    if (!person) {
      throw {
        status: 400,
        message: 'Datos de persona requeridos',
      };
    }

    const {
      names,
      last_names,
      document_number,
      birth_date,
      image_url,
      sex_id,
      document_type_id,
    } = person;

    // Crear persona
    const newPerson = await Person.create(
      {
        names,
        last_names,
        document_number: document_number ?? null,
        birth_date: birth_date || null,
        image_url: image_url ?? null,
        sex_id: sex_id ?? null,
        document_type_id: document_type_id ?? null,
        created: new Date(),
        updated: new Date(),
      },
      { transaction }
    );

    // Crear worker asociado
    const worker = await Worker.create(
      {
        person_id: newPerson.id,
        code: parseInt(code) ?? null, // OJO, el codigo en un INT
        bio: bio ?? null,
        email: null,      // cadena vacía como pediste
        user_id: null,  // explícitamente nulo
      },
      { transaction }
    );

    await transaction.commit();

    return {
      ...worker.toJSON(),
      person: newPerson.toJSON(),
    };

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

    const { code, bio, } = payload;

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

export const updateWorkerEmailUser = async (id, email, user_id) => {
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

    const updateData = {};

    if (email !== undefined) {
      updateData.email = email;
    }

    // user_id puede ser null, por eso verificamos !== undefined
    if (user_id !== undefined) {
      updateData.user_id = user_id;
      updateData.email = email;
    }

    await worker.update(updateData, { transaction });

    await transaction.commit();

    return worker.toJSON();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const removeUser = async (id) => {
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

    const updateData = {};

    updateData.user_id = null;

    await worker.update(updateData, { transaction });

    await transaction.commit();

    return worker.toJSON();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};