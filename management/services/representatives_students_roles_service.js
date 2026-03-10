// management/services/representatives_students_roles_service.js

import { Sequelize, Op } from 'sequelize';
import Representative from '../models/representatives.js';
import RepresentativeStudentRole from '../models/representatives_students_roles.js';
import Person from '../models/persons.js';
import RepresentativeRole from '../models/representative_role.js';
import Sex from '../models/sex.js';
import DocumentType from '../models/document_type.js';

/**
 * Construye las condiciones de búsqueda para los filtros opcionales
 */
const buildSearchConditions = (searchParams = {}) => {
  const { full_name, document_number } = searchParams;
  const conditions = [];

  if (full_name) {
    conditions.push({
      [Op.or]: [
        { names: { [Op.like]: `%${full_name}%` } },
        { last_names: { [Op.like]: `%${full_name}%` } }
      ]
    });
  }

  if (document_number) {
    conditions.push({
      document_number: { [Op.like]: `%${document_number}%` }
    });
  }

  return conditions.length > 0 ? { [Op.and]: conditions } : null;
};

/**
 * Formatea el resultado para que coincida con la estructura de las consultas SQL
 */
const formatRepresentativeData = (representative, studentRole = null) => {
  const person = representative.person;
  const role = studentRole?.role || null;

  return {
    representative: {
      id: representative.id,
      person: person
        ? {
            full_name: `${person.last_names}, ${person.names}`,
            birth_date: person.birth_date,
            image_url: person.image_url,
            sex_id: person.sex_id,
            sex: person.sex ? { name: person.sex.name } : null,
            document: person.document_type
              ? { type: person.document_type.name, number: person.document_number }
              : null,
          }
        : null,
    },
    role: role
      ? {
          id: role.id,
          name: role.name,
        }
      : null,
  };
};

/**
 * Solo los representantes que tienen relación con el estudiante
 */
export const fetchOnlyRelatedByStudentId = async (studentId, limit = 9, searchParams = {}) => {
  const searchConditions = buildSearchConditions(searchParams);

  const representativesRoles = await RepresentativeStudentRole.findAll({
    where: { student_id: studentId },
    include: [
      {
        model: Representative,
        as: 'representative',
        required: true,
        include: [
          {
            model: Person,
            as: 'person',
            required: true,
            where: searchConditions || undefined,
            include: [
              { model: DocumentType, as: 'document_type', attributes: ['name'] },
              { model: Sex, as: 'sex', attributes: ['name'] },
            ],
          },
        ],
      },
      {
        model: RepresentativeRole,
        as: 'role',
        attributes: ['id', 'name'],
      },
    ],
    order: [['id', 'ASC']],
    limit,
    subQuery: false,
  });

  return representativesRoles.map(item => formatRepresentativeData(item.representative, item));
};

/**
 * Todos los representantes, incluyendo los que tienen y no tienen relación con el estudiante
 */
export const fetchAllWithRelationStatus = async (studentId, limit = 9, searchParams = {}) => {
  const searchConditions = buildSearchConditions(searchParams);

  const personInclude = {
    model: Person,
    as: 'person',
    required: true,
    include: [
      { model: DocumentType, as: 'document_type', attributes: ['name'] },
      { model: Sex, as: 'sex', attributes: ['name'] },
    ],
  };

  if (searchConditions) personInclude.where = searchConditions;

  const representatives = await Representative.findAll({
    include: [
      personInclude,
      {
        model: RepresentativeStudentRole,
        as: 'student_roles',
        required: false,
        where: { student_id: studentId },
        include: [{ model: RepresentativeRole, as: 'role', attributes: ['id', 'name'] }],
      },
    ],
    order: [['id', 'ASC']],
    limit,
    subQuery: false,
    distinct: true,
  });

  return representatives.map(rep => {
    const repJson = rep.toJSON();
    const studentRole = repJson.student_roles?.[0] || null;
    return formatRepresentativeData(repJson, studentRole);
  });
};

/**
 * Solo los representantes que NO tienen relación con el estudiante
 */
export const fetchOnlyNotRelatedByStudentId = async (studentId, limit = 9, searchParams = {}) => {
  const relatedIdsRaw = await RepresentativeStudentRole.findAll({
    where: { student_id: studentId },
    attributes: ['representative_id'],
    raw: true,
  });

  const relatedIds = relatedIdsRaw.map(r => r.representative_id);
  const searchConditions = buildSearchConditions(searchParams);

  const personInclude = {
    model: Person,
    as: 'person',
    required: true,
    include: [
      { model: DocumentType, as: 'document_type', attributes: ['name'] },
      { model: Sex, as: 'sex', attributes: ['name'] },
    ],
  };
  if (searchConditions) personInclude.where = searchConditions;

  const representatives = await Representative.findAll({
    where: {
      id: { [Op.notIn]: relatedIds.length > 0 ? relatedIds : [0] },
    },
    include: [personInclude],
    order: [['id', 'ASC']],
    limit,
    subQuery: false,
    distinct: true,
  });

  return representatives.map(rep => formatRepresentativeData(rep.toJSON(), null));
};

/**
 * Versión alternativa usando LEFT JOIN y condición en ON
 */
export const fetchAllWithRelationStatusAlternative = fetchAllWithRelationStatus;

/**
 * Versión alternativa para "los que no" usando LEFT JOIN y WHERE ... IS NULL
 */
export const fetchOnlyNotRelatedByStudentIdAlternative = async (studentId, limit = 9, searchParams = {}) => {
  const searchConditions = buildSearchConditions(searchParams);

  const personInclude = {
    model: Person,
    as: 'person',
    required: true,
    include: [
      { model: DocumentType, as: 'document_type', attributes: ['name'] },
      { model: Sex, as: 'sex', attributes: ['name'] },
    ],
  };
  if (searchConditions) personInclude.where = searchConditions;

  const representatives = await Representative.findAll({
    include: [
      personInclude,
      {
        model: RepresentativeStudentRole,
        as: 'student_roles',
        required: false,
        where: { student_id: studentId },
        attributes: [],
      },
    ],
    where: { '$student_roles.id$': null },
    order: [['id', 'ASC']],
    limit,
    subQuery: false,
    distinct: true,
  });

  return representatives.map(rep => formatRepresentativeData(rep.toJSON(), null));
};