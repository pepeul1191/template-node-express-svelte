// management/services/representative_service.js
import { Op } from 'sequelize';
import sequelize from '../../configs/database.js';
import Person from '../models/persons.js';
import Representative from '../models/representatives.js';
import Sex from '../models/sex.js';
import DocumentType from '../models/document_type.js';

// buildWhere solo maneja filtros de la persona
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
 * Obtener representatives con datos de persona (paginado)
 */
export const fetchRepresentatives = async ({ name, document_number, email, step = 10, page = 1 }) => {
  const wherePerson = buildWhere({ name, document_number, email });
  const whereRep = {};
  if (email) {
    whereRep.email = { [Op.like]: `%${email}%` };
  }

  const limit = Number(step);
  const offset = (Number(page) - 1) * limit;

  const reps = await Representative.findAll({
    where: whereRep,
    include: [
      {
        model: Person,
        as: 'person',
        where: wherePerson,
        required: true,
        attributes: [
          'id', 'names', 'last_names', 'document_number', 'birth_date', 'image_url'
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
      }
    ],
    limit,
    offset,
    order: [['id', 'ASC']],
  });

  return reps.map(r => ({ ...r.toJSON(), person: r.person }));
};

export const countTotalPages = async ({ name, document_number, email, step = 10 }) => {
  const wherePerson = buildWhere({ name, document_number, email });
  const whereRep = {};
  if (email) {
    whereRep.email = { [Op.like]: `%${email}%` };
  }

  const totalRecords = await Representative.count({
    where: whereRep,
    include: [{ model: Person, as: 'person', where: wherePerson, required: true }],
    distinct: true,
  });

  const totalPages = Math.ceil(totalRecords / Number(step));
  return { totalPages, totalRecords };
};

export const createFromPerson = async (person, email = null) => {
  const transaction = await sequelize.transaction();

  try {
    if (!person) {
      throw { status: 400, message: 'Datos de persona requeridos' };
    }

    const { names, last_names, document_number, birth_date, image_url, sex_id, document_type_id } = person;

    // Crear persona
    const newPerson = await Person.create(
      { names, last_names, document_number, birth_date, image_url, sex_id, document_type_id, created: new Date(), updated: new Date() },
      { transaction }
    );

    // Crear representative asociado
    const rep = await Representative.create(
      { person_id: newPerson.id, email: email ?? null, user_id: null },
      { transaction }
    );

    await transaction.commit();

    return { ...rep.toJSON(), person: newPerson.toJSON() };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const findByPerson = async (personId) => {
  const rep = await Representative.findOne({ where: { person_id: personId }, include: [{ model: Person, as: 'person' }] });
  return rep ? rep.toJSON() : null;
};

export const updateRepresentative = async (id, payload = {}) => {
  const transaction = await sequelize.transaction();
  try {
    const rep = await Representative.findByPk(id, { transaction });
    if (!rep) throw { status: 404, message: 'Representative no encontrado', error: `ID ${id}` };

    await rep.update({ email: payload.email ?? rep.email }, { transaction });

    await transaction.commit();
    return rep.toJSON();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const deleteRepresentative = async (id) => {
  const transaction = await sequelize.transaction();
  try {
    const rep = await Representative.findByPk(id, { transaction });
    if (!rep) throw { status: 404, message: 'Representative no encontrado', error: `ID ${id}` };

    await rep.destroy({ transaction });
    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const updateRepEmailUser = async (id, email, user_id) => {
  const transaction = await sequelize.transaction();
  try {
    const rep = await Representative.findByPk(id, { transaction });
    if (!rep) throw { status: 404, message: 'Representative no encontrado', error: `ID ${id}` };

    await rep.update({ email, user_id }, { transaction });
    await transaction.commit();
    return rep.toJSON();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const removeUser = async (id) => {
  const transaction = await sequelize.transaction();
  try {
    const rep = await Representative.findByPk(id, { transaction });
    if (!rep) throw { status: 404, message: 'Representative no encontrado', error: `ID ${id}` };

    await rep.update({ user_id: null }, { transaction });
    await transaction.commit();
    return rep.toJSON();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};