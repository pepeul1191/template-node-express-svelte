// management/services/student_service.js

import { Op } from 'sequelize';
import sequelize from '../../configs/database.js';
import Person from '../models/persons.js';
import Student from '../models/students.js';
import Sex from '../models/sex.js';
import DocumentType from '../models/document_type.js';

// filtros para Person
const buildWhere = ({ name, document_number }) => {
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
 * Obtener students con datos de persona (paginado)
 */
export const fetchStudents = async ({ name, document_number, code, email, step = 10, page = 1 }) => {
  const wherePerson = buildWhere({ name, document_number });

  const whereStudent = {};
  if (code) {
    whereStudent.code = { [Op.like]: `%${code}%` };
  }
  if (email) {
    whereStudent.email = { [Op.like]: `%${email}%` };
  }

  const limit = Number(step);
  const offset = (Number(page) - 1) * limit;

  const students = await Student.findAll({
    where: whereStudent,
    include: [
      {
        model: Person,
        as: 'person',
        where: wherePerson,
        required: true,
        attributes: [
          ['id', 'id'],
          ['names', 'names'],
          ['last_names', 'last_names'],
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

  return students.map(s => {
    const data = s.toJSON();
    return {
      id: data.id,
      code: data.code,
      email: data.email,
      user_id: data.user_id,
      person: data.person,
    };
  });
};

export const countTotalPages = async ({ name, document_number, code, email, step = 10 }) => {
  const wherePerson = buildWhere({ name, document_number });

  const whereStudent = {};
  if (code) {
    whereStudent.code = { [Op.like]: `%${code}%` };
  }
  if (email) {
    whereStudent.email = { [Op.like]: `%${email}%` };
  }

  const totalRecords = await Student.count({
    where: whereStudent,
    include: [
      {
        model: Person,
        as: 'person',
        where: wherePerson,
        required: true,
      },
    ],
    distinct: true,
  });

  const totalPages = Math.ceil(totalRecords / Number(step));
  return { totalPages, totalRecords };
};

/**
 * Crear student desde persona
 */
export const createFromPerson = async (person, code = null) => {
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

    const student = await Student.create(
      {
        person_id: newPerson.id,
        code: code ?? null,
        email: null,
        user_id: null,
      },
      { transaction }
    );

    await transaction.commit();

    return {
      ...student.toJSON(),
      person: newPerson.toJSON(),
    };

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const findByPerson = async (personId) => {
  const student = await Student.findOne({
    where: { person_id: personId },
    include: [{ model: Person, as: 'person' }],
  });

  if (!student) return null;
  return student.toJSON();
};

export const updateStudent = async (id, payload = {}) => {
  const transaction = await sequelize.transaction();

  try {
    const student = await Student.findByPk(id, { transaction });

    if (!student) {
      throw {
        status: 404,
        message: 'Student no encontrado',
        error: `ID ${id}`,
      };
    }

    const { code } = payload;

    await student.update(
      { code: code ?? student.code },
      { transaction }
    );

    await transaction.commit();

    return student.toJSON();

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const deleteStudent = async (id) => {
  const transaction = await sequelize.transaction();

  try {
    const student = await Student.findByPk(id, { transaction });

    if (!student) {
      throw {
        status: 404,
        message: 'Student no encontrado',
        error: `ID ${id}`,
      };
    }

    await student.destroy({ transaction });

    await transaction.commit();
    return true;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const updateStudentEmailUser = async (id, email, user_id) => {
  const transaction = await sequelize.transaction();

  try {
    const student = await Student.findByPk(id, { transaction });

    if (!student) {
      throw {
        status: 404,
        message: 'Student no encontrado',
        error: `ID ${id}`,
      };
    }

    const updateData = {};

    if (email !== undefined) {
      updateData.email = email;
    }

    if (user_id !== undefined) {
      updateData.user_id = user_id;
      updateData.email = email;
    }

    await student.update(updateData, { transaction });

    await transaction.commit();

    return student.toJSON();

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const removeUser = async (id) => {
  const transaction = await sequelize.transaction();

  try {
    const student = await Student.findByPk(id, { transaction });

    if (!student) {
      throw {
        status: 404,
        message: 'Student no encontrado',
        error: `ID ${id}`,
      };
    }

    await student.update(
      { user_id: null },
      { transaction }
    );

    await transaction.commit();

    return student.toJSON();

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};