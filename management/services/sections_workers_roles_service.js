// management/services/sections_workers_roles_service.js

import { Sequelize, Op } from 'sequelize';
import Section from '../models/sections.js';
import SectionWorkerRole from '../models/sections_workers_roles.js';
import sequelize from '../../configs/database.js';
import Worker from '../models/workers.js';
import Person from '../models/persons.js';
import WorkerRole from '../models/worker_role.js';
import DocumentType from '../models/document_type.js';
import Sex from '../models/sex.js';
import Course from '../models/courses.js';
import Level from '../models/level.js';

/**
 * Construye las condiciones de búsqueda para los filtros opcionales
 */
const buildSearchConditions = (searchParams = {}) => {
  const { full_name, document_number, worker_code } = searchParams;
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

  if (worker_code) {
    conditions.push({
      code: { [Op.like]: `%${worker_code}%` }
    });
  }

  return conditions.length > 0 ? { [Op.and]: conditions } : null;
};

/**
 * Formatea los datos del trabajador
 */
const formatWorkerData = (worker, sectionRole = null) => {
  const person = worker.person;
  const role = sectionRole?.role || null;

  return {
    worker: {
      id: worker.id,
      code: worker.code, // <-- Agregar código del trabajador
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
 * Formatea los datos de la sección
 */
const formatSectionData = (section, sectionRole = null) => {
  const course = section.course;
  const level = course?.level;
  const role = sectionRole?.role || null;

  return {
    section: {
      id: section.id,
      name: section.name,
      order: section.order,
      course: course ? {
        id: course.id,
        name: course.name,
        level: level ? {
          id: level.id,
          name: level.name
        } : null
      } : null
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
 * Solo los trabajadores que tienen relación con la sección
 */
export const fetchOnlyRelatedBySectionId = async (sectionId, limit = 9, searchParams = {}) => {
  const searchConditions = buildSearchConditions(searchParams);

  const sectionsWorkersRoles = await SectionWorkerRole.findAll({
    where: { section_id: sectionId },
    include: [
      {
        model: Worker,
        as: 'worker',
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
        model: WorkerRole,
        as: 'role',
        attributes: ['id', 'name'],
      },
    ],
    order: [['id', 'ASC']],
    limit,
    subQuery: false,
  });

  return sectionsWorkersRoles.map(item => formatWorkerData(item.worker, item));
};

/**
 * Todos los trabajadores, incluyendo los que tienen y no tienen relación con la sección
 */
export const fetchAllWithRelationStatusBySection = async (sectionId, limit = 9, searchParams = {}) => {
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

  const workers = await Worker.findAll({
    attributes: ['id', 'code'], // <-- Asegurar que se incluya el código
    include: [
      personInclude,
      {
        model: SectionWorkerRole,
        as: 'section_roles',
        required: false,
        where: { section_id: sectionId },
        include: [{ model: WorkerRole, as: 'role', attributes: ['id', 'name'] }],
      },
    ],
    order: [['id', 'ASC']],
    limit,
    subQuery: false,
    distinct: true,
  });

  return workers.map(worker => {
    const workerJson = worker.toJSON();
    const sectionRole = workerJson.section_roles?.[0] || null;
    return formatWorkerData(workerJson, sectionRole);
  });
};

/**
 * Solo los trabajadores que NO tienen relación con la sección
 */
export const fetchOnlyNotRelatedBySectionId = async (sectionId, limit = 9, searchParams = {}) => {
  const relatedIdsRaw = await SectionWorkerRole.findAll({
    where: { section_id: sectionId },
    attributes: ['worker_id'],
    raw: true,
  });

  const relatedIds = relatedIdsRaw.map(r => r.worker_id);
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

  const workers = await Worker.findAll({
    where: {
      id: { [Op.notIn]: relatedIds.length > 0 ? relatedIds : [0] },
    },
    include: [personInclude],
    order: [['id', 'ASC']],
    limit,
    subQuery: false,
    distinct: true,
  });

  return workers.map(worker => formatWorkerData(worker.toJSON(), null));
};

/**
 * Versión alternativa usando LEFT JOIN y condición WHERE ... IS NULL para trabajadores no relacionados
 */
export const fetchOnlyNotRelatedBySectionIdAlternative = async (sectionId, limit = 9, searchParams = {}) => {
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

  const workers = await Worker.findAll({
    include: [
      personInclude,
      {
        model: SectionWorkerRole,
        as: 'section_roles',
        required: false,
        where: { section_id: sectionId },
        attributes: [],
      },
    ],
    where: { '$section_roles.id$': null },
    order: [['id', 'ASC']],
    limit,
    subQuery: false,
    distinct: true,
  });

  return workers.map(worker => formatWorkerData(worker.toJSON(), null));
};

/**
 * Guardar múltiples relaciones trabajador-rol para una sección
 */
export const saveManyBySection = async (sectionId, payload) => {
  const transaction = await sequelize.transaction();
  try {
    const { workers = [] } = payload;

    for (const item of workers) {
      const { worker_id, rol_id } = item;

      // 1. Eliminar cualquier registro existente
      await SectionWorkerRole.destroy({
        where: {
          section_id: sectionId,
          worker_id: worker_id
        },
        transaction
      });

      // 2. Si tiene rol, crear uno nuevo
      if (rol_id !== null) {
        await SectionWorkerRole.create(
          {
            section_id: sectionId,
            worker_id: worker_id,
            worker_role_id: rol_id
          },
          { transaction }
        );
      }
    }

    await transaction.commit();
    return true;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// ============= MÉTODOS PARA TRABAJADOR (VISTA INVERSA) =============

/**
 * Solo las secciones que tienen relación con el trabajador
 */
export const fetchOnlyRelatedByWorkerId = async (workerId, limit = 9, searchParams = {}) => {
  const sectionsWorkersRoles = await SectionWorkerRole.findAll({
    where: { worker_id: workerId },
    include: [
      {
        model: Section,
        as: 'section',
        required: true,
        include: [
          {
            model: Course,
            as: 'course',
            required: true,
            include: [
              {
                model: Level,
                as: 'level',
                attributes: ['id', 'name']
              }
            ]
          }
        ]
      },
      {
        model: WorkerRole,
        as: 'role',
        attributes: ['id', 'name'],
      },
    ],
    order: [['id', 'ASC']],
    limit,
    subQuery: false,
  });

  return sectionsWorkersRoles.map(item => formatSectionData(item.section, item));
};

/**
 * Todas las secciones, incluyendo las que tienen y no tienen relación con el trabajador
 */
export const fetchAllWithRelationStatusByWorker = async (workerId, limit = 9, searchParams = {}) => {
  const sections = await Section.findAll({
    include: [
      {
        model: Course,
        as: 'course',
        required: true,
        include: [
          {
            model: Level,
            as: 'level',
            attributes: ['id', 'name']
          }
        ]
      },
      {
        model: SectionWorkerRole,
        as: 'worker_roles',
        required: false,
        where: { worker_id: workerId },
        include: [{ model: WorkerRole, as: 'role', attributes: ['id', 'name'] }],
      },
    ],
    order: [['id', 'ASC']],
    limit,
    subQuery: false,
    distinct: true,
  });

  return sections.map(section => {
    const sectionJson = section.toJSON();
    const sectionRole = sectionJson.worker_roles?.[0] || null;
    return formatSectionData(sectionJson, sectionRole);
  });
};

/**
 * Solo las secciones que NO tienen relación con el trabajador
 */
export const fetchOnlyNotRelatedByWorkerId = async (workerId, limit = 9, searchParams = {}) => {
  const relatedIdsRaw = await SectionWorkerRole.findAll({
    where: { worker_id: workerId },
    attributes: ['section_id'],
    raw: true,
  });

  const relatedIds = relatedIdsRaw.map(r => r.section_id);

  const sections = await Section.findAll({
    where: {
      id: { [Op.notIn]: relatedIds.length > 0 ? relatedIds : [0] },
    },
    include: [
      {
        model: Course,
        as: 'course',
        required: true,
        include: [
          {
            model: Level,
            as: 'level',
            attributes: ['id', 'name']
          }
        ]
      }
    ],
    order: [['id', 'ASC']],
    limit,
    subQuery: false,
    distinct: true,
  });

  return sections.map(section => formatSectionData(section.toJSON(), null));
};

/**
 * Versión alternativa usando LEFT JOIN para secciones no relacionadas
 */
export const fetchOnlyNotRelatedByWorkerIdAlternative = async (workerId, limit = 9, searchParams = {}) => {
  const sections = await Section.findAll({
    include: [
      {
        model: Course,
        as: 'course',
        required: true,
        include: [
          {
            model: Level,
            as: 'level',
            attributes: ['id', 'name']
          }
        ]
      },
      {
        model: SectionWorkerRole,
        as: 'worker_roles',
        required: false,
        where: { worker_id: workerId },
        attributes: [],
      },
    ],
    where: { '$worker_roles.id$': null },
    order: [['id', 'ASC']],
    limit,
    subQuery: false,
    distinct: true,
  });

  return sections.map(section => formatSectionData(section.toJSON(), null));
};

/**
 * Guardar múltiples relaciones sección-rol para un trabajador
 */
export const saveManyByWorker = async (workerId, payload) => {
  const transaction = await sequelize.transaction();
  try {
    const { sections = [] } = payload;

    for (const item of sections) {
      const { section_id, rol_id } = item;

      // 1. Eliminar cualquier registro existente
      await SectionWorkerRole.destroy({
        where: {
          worker_id: workerId,
          section_id: section_id
        },
        transaction
      });

      // 2. Si tiene rol, crear uno nuevo
      if (rol_id !== null) {
        await SectionWorkerRole.create(
          {
            worker_id: workerId,
            section_id: section_id,
            worker_role_id: rol_id
          },
          { transaction }
        );
      }
    }

    await transaction.commit();
    return true;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};