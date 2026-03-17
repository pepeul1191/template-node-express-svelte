// management/services/sections_students_service.js

import { Sequelize, Op } from 'sequelize';
import Section from '../models/sections.js';
import SectionStudent from '../models/sections_students.js';
import sequelize from '../../configs/database.js';
import Student from '../models/students.js';
import Person from '../models/persons.js';
import DocumentType from '../models/document_type.js';
import Sex from '../models/sex.js';
import Course from '../models/courses.js';
import Level from '../models/level.js';

/**
 * Construye las condiciones de búsqueda para los filtros opcionales
 */
const buildSearchConditions = (searchParams = {}) => {
  const { full_name, document_number, code } = searchParams;

  console.log('1 ++++++++++++++++++++++++++++++++++++++++++++');
  console.log(searchParams);
  console.log('2 ++++++++++++++++++++++++++++++++++++++++++++');
  const conditions = [];

  if (full_name) {
    conditions.push(
      Sequelize.where(
        Sequelize.fn('CONCAT',
          Sequelize.col('person.last_names'),
          ', ',
          Sequelize.col('person.names')
        ),
        { [Op.like]: `%${full_name}%` }
      )
    );
  }

  if (document_number) {
    conditions.push({
      '$person.document_number$': { [Op.like]: `%${document_number}%` }
    });
  }

  if (code) {
    conditions.push({
      code: { [Op.like]: `%${code}%` }
    });
  }

  return conditions.length > 0 ? { [Op.and]: conditions } : null;
};

/**
 * Formatea los datos del estudiante (solo estudiantes)
 */
const formatStudentOnlyData = (student) => {
  const person = student.person;

  return {
    student: {
      id: student.id,
      code: student.code,
      person: {
        full_name: person ? `${person.last_names}, ${person.names}` : null,
        birth_date: person?.birth_date,
        image_url: person?.image_url,
        sex_id: person?.sex_id,
        sex: person?.sex ? { name: person.sex.name } : null,
        document: person?.document_type && person?.document_number
          ? { type: person.document_type.name, number: person.document_number }
          : null,
      }
    }
  };
};

/**
 * Formatea los datos del estudiante con información de sección
 */
const formatStudentWithSectionData = (student, section = null) => {
  const person = student.person;

  return {
    student: {
      id: student.id,
      code: student.code,
      person: {
        full_name: person ? `${person.last_names}, ${person.names}` : null,
        birth_date: person?.birth_date,
        image_url: person?.image_url,
        sex_id: person?.sex_id,
        sex: person?.sex ? { name: person.sex.name } : null,
        document: person?.document_type && person?.document_number
          ? { type: person.document_type.name, number: person.document_number }
          : null,
      }
    },
    section: section ? {
      id: section.id,
      name: section.name
    } : null
  };
};

/**
 * Formatea los datos de la sección
 */
const formatSectionData = (section) => {
  const course = section.course;
  const level = course?.level;

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
    }
  };
};

/**
 * Obtener estudiantes asignados a una sección (SOLO los relacionados)
 * Ordenado por last_names
 */
export const fetchOnlyRelatedBySectionId = async (sectionId, limit = 9, searchParams = {}) => {
  const searchConditions = buildSearchConditions(searchParams);

  const students = await Student.findAll({
    attributes: ['id', 'code'],
    include: [
      {
        model: Person,
        as: 'person',
        required: true,
        attributes: ['last_names', 'names', 'birth_date', 'image_url', 'sex_id', 'document_number'],
        include: [
          { 
            model: DocumentType, 
            as: 'document_type', 
            attributes: ['name'] 
          },
          { 
            model: Sex, 
            as: 'sex', 
            attributes: ['name'] 
          },
        ],
      },
      {
        model: SectionStudent,
        as: 'section_assignments',
        required: true,
        where: { section_id: sectionId },
        attributes: []
      }
    ],
    where: searchConditions || undefined,
    order: [
      [{ model: Person, as: 'person' }, 'last_names', 'ASC'],
      [{ model: Person, as: 'person' }, 'names', 'ASC']
    ],
    limit,
    subQuery: false,
    distinct: true
  });

  return students.map(student => formatStudentOnlyData(student));
};

/**
 * Obtener todos los estudiantes con estado de relación con la sección
 * Ordenado por last_names
 */
export const fetchAllWithRelationStatusBySection = async (sectionId, limit = 9, searchParams = {}) => {
  const searchConditions = buildSearchConditions(searchParams);

  const students = await Student.findAll({
    attributes: ['id', 'code'],
    include: [
      {
        model: Person,
        as: 'person',
        required: true,
        attributes: ['last_names', 'names', 'birth_date', 'image_url', 'sex_id', 'document_number'],
        include: [
          { 
            model: DocumentType, 
            as: 'document_type', 
            attributes: ['name'] 
          },
          { 
            model: Sex, 
            as: 'sex', 
            attributes: ['name'] 
          },
        ],
      },
      {
        model: SectionStudent,
        as: 'section_assignments',
        required: false,
        where: { section_id: sectionId },
        include: [
          {
            model: Section,
            as: 'section',
            attributes: ['id', 'name']
          }
        ]
      }
    ],
    where: searchConditions || undefined,
    order: [
      [{ model: Person, as: 'person' }, 'last_names', 'ASC'],
      [{ model: Person, as: 'person' }, 'names', 'ASC']
    ],
    limit,
    subQuery: false,
    distinct: true
  });

  return students.map(student => {
    const studentJson = student.toJSON();
    const sectionAssignment = studentJson.section_assignments?.[0];
    const section = sectionAssignment?.section || null;
    return formatStudentWithSectionData(studentJson, section);
  });
};

/**
 * Obtener estudiantes NO asignados a una sección
 * Ordenado por last_names
 */
export const fetchOnlyNotRelatedBySectionId = async (sectionId, limit = 9, searchParams = {}) => {
  const searchConditions = buildSearchConditions(searchParams);

  const students = await Student.findAll({
    attributes: ['id', 'code'],
    include: [
      {
        model: Person,
        as: 'person',
        required: true,
        attributes: ['last_names', 'names', 'birth_date', 'image_url', 'sex_id', 'document_number'],
        include: [
          { 
            model: DocumentType, 
            as: 'document_type', 
            attributes: ['name'] 
          },
          { 
            model: Sex, 
            as: 'sex', 
            attributes: ['name'] 
          },
        ],
      },
      {
        model: SectionStudent,
        as: 'section_assignments',
        required: false,
        where: { section_id: sectionId },
        attributes: []
      }
    ],
    where: {
      ...(searchConditions || {}),
      '$section_assignments.id$': null
    },
    order: [
      [{ model: Person, as: 'person' }, 'last_names', 'ASC'],
      [{ model: Person, as: 'person' }, 'names', 'ASC']
    ],
    limit,
    subQuery: false,
    distinct: true
  });

  return students.map(student => formatStudentOnlyData(student));
};

/**
 * Obtener todas las secciones con estudiantes (versión paginada)
 */
export const fetchAllWithStudents = async (limit = 42, offset = 0) => {
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
        model: Student,
        as: 'students',
        through: { attributes: [] },
        attributes: ['id', 'code'],
        include: [
          {
            model: Person,
            as: 'person',
            attributes: ['last_names', 'names', 'image_url'],
          }
        ]
      }
    ],
    order: [['id', 'ASC']],
    limit,
    offset,
    subQuery: false,
    distinct: true,
  });

  return sections;
};

/**
 * Asignar estudiantes a una sección (reemplaza todas las asignaciones)
 */
export const assignStudentsToSection = async (sectionId, studentIds) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Eliminar asignaciones existentes
    await SectionStudent.destroy({
      where: { section_id: sectionId },
      transaction
    });

    // Crear nuevas asignaciones
    if (studentIds && studentIds.length > 0) {
      const assignments = studentIds.map(studentId => ({
        section_id: sectionId,
        student_id: studentId
      }));

      await SectionStudent.bulkCreate(assignments, { transaction });
    }

    await transaction.commit();
    return true;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Agregar estudiantes a una sección (sin eliminar existentes)
 */
export const addStudentsToSection = async (sectionId, studentIds) => {
  const transaction = await sequelize.transaction();
  
  try {
    if (studentIds && studentIds.length > 0) {
      const assignments = studentIds.map(studentId => ({
        section_id: sectionId,
        student_id: studentId
      }));

      await SectionStudent.bulkCreate(assignments, { 
        transaction,
        ignoreDuplicates: true 
      });
    }

    await transaction.commit();
    return true;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Eliminar estudiantes de una sección
 */
export const removeStudentsFromSection = async (sectionId, studentIds) => {
  const transaction = await sequelize.transaction();
  
  try {
    await SectionStudent.destroy({
      where: {
        section_id: sectionId,
        student_id: { [Op.in]: studentIds }
      },
      transaction
    });

    await transaction.commit();
    return true;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Verificar si un estudiante está en una sección
 */
export const isStudentInSection = async (sectionId, studentId) => {
  const count = await SectionStudent.count({
    where: {
      section_id: sectionId,
      student_id: studentId
    }
  });

  return count > 0;
};

/**
 * Obtener secciones de un estudiante
 */
export const fetchSectionsByStudentId = async (studentId, limit = 42) => {
  const studentSections = await SectionStudent.findAll({
    where: { student_id: studentId },
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
      }
    ],
    order: [['id', 'ASC']],
    limit,
    subQuery: false,
  });

  return studentSections.map(item => formatSectionData(item.section));
};

/**
 * Contar estudiantes por sección
 */
export const countStudentsBySection = async (sectionId) => {
  return await SectionStudent.count({
    where: { section_id: sectionId }
  });
};

// Mantener compatibilidad con nombres anteriores
export const fetchStudentsBySectionId = fetchOnlyRelatedBySectionId;