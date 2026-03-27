// management/services/course_service.js
import { Op, Sequelize } from 'sequelize';
import sequelize from '../../configs/database.js';
import Course from '../models/courses.js';
import Level from '../models/level.js';
import Worker from '../models/workers.js';
import Person from '../models/persons.js';
import Folder from '../models/folder.js';
import FolderCommonMaterial from '../models/folder_common_material.js';
import File from '../models/file.js';

const buildWhere = ({ name, code, level_id }) => {
  const where = {};

  if (name) {
    where.name = { [Op.like]: `%${name}%` };
  }

  if (code) {
    where.code = { [Op.like]: `%${code}%` };
  }

  if (level_id) {
    where.level_id = level_id;
  }

  return where;
};

/**
 * Obtener cursos con nivel y docente
 */
export const fetchCourses = async ({ name, code, level_id = null, step = 10, page = 1 }) => {
  const where = buildWhere({ name, code, level_id });

  const limit = Number(step);
  const offset = (Number(page) - 1) * limit;

  const courses = await Course.findAll({
    where,
    include: [
      {
        model: Level,
        as: 'level',
        attributes: ['id', 'name']
      },
      {
        model: Worker,
        as: 'worker',
        attributes: ['id', 'code', 'email'],
        include: [
          {
            model: Person,
            as: 'person',
            attributes: [
              'id',
              'names',
              'last_names',
              [
                Sequelize.literal("CONCAT(last_names, ', ', names)"),
                'full_name'
              ]
            ]
          }
        ]
      }
    ],
    limit,
    offset,
    order: [['id', 'ASC']]
  });

  return courses.map(c => c.toJSON());
};

export const countTotalPages = async ({ name, code, level_id = null, step = 10 }) => {
  const where = buildWhere({ name, code, level_id });

  const totalRecords = await Course.count({ where });

  const totalPages = Math.ceil(totalRecords / Number(step));

  return { totalPages, totalRecords };
};

/**
 * Crear curso
 */
export const createCourse = async (payload = {}) => {
  const transaction = await sequelize.transaction();

  try {
    const { name, code, description, sylabus_url, level_id, worker_id } = payload;

    const course = await Course.create(
      { name, code, description, sylabus_url, level_id, worker_id },
      { transaction }
    );

    await transaction.commit();

    return course.toJSON();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Buscar por ID
 */
export const findCourseById = async (id) => {
  const course = await Course.findByPk(id, {
    include: [
      {
        model: Level,
        as: 'level',
        attributes: ['id', 'name']
      },
      {
        model: Worker,
        as: 'worker',
        attributes: ['id', 'code', 'email']
      }
    ]
  });

  return course ? course.toJSON() : null;
};

/**
 * Actualizar curso
 */
export const updateCourse = async (id, payload = {}) => {
  const transaction = await sequelize.transaction();

  try {
    const course = await Course.findByPk(id, { transaction });

    if (!course) {
      throw { status: 404, message: 'Course no encontrado', error: `ID ${id}` };
    }

    await course.update(
      {
        name: payload.name ?? course.name,
        code: payload.code ?? course.code,
        description: payload.description ?? course.description,
        sylabus_url: payload.sylabus_url ?? course.sylabus_url,
        level_id: payload.level_id ?? course.level_id,
        worker_id: payload.worker_id ?? course.worker_id
      },
      { transaction }
    );

    await transaction.commit();

    return course.toJSON();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Eliminar curso
 */
export const deleteCourse = async (id) => {
  const transaction = await sequelize.transaction();

  try {
    const course = await Course.findByPk(id, { transaction });

    if (!course) {
      throw { status: 404, message: 'Course no encontrado', error: `ID ${id}` };
    }

    await course.destroy({ transaction });

    await transaction.commit();

    return true;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getCourseMaterials = async (courseId, folderId) => {
  try {
    // Obtener carpetas del curso
    const folders = await Folder.findAll({
      include: [{
        model: FolderCommonMaterial,
        as: 'commonMaterial',
        where: { course_id: courseId },
        required: true
      }]
    });

    // Obtener documentos en la raíz del curso (folder_id = null)
    const files = await File.findAll({
      where: {
        folder_id: folderId
      }
    });

    return {
      folders: folders.map(f => ({
        id: f.id,
        title: f.title,
        description: f.description,
        parent_id: f.parent_id,
        created: f.created
      })),
      files: files.map(d => ({
        id: d.id,
        name: d.name,
        url: d.url,
        created: d.created,
        autogenerated_name: d.autogenerated_name
      }))
    };

  } catch (error) {
    throw {
      status: 500,
      message: 'Error al obtener el material del curso',
      error: error.message
    };
  }
};