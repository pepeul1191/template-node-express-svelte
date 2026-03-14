// management/services/section_service.js

import sequelize from '../../configs/database.js';
import Section from '../models/sections.js';
import Course from '../models/courses.js';

/**
 * Obtener secciones por curso
 */
export const fetchAll = async (courseId) => {
  const sections = await Section.findAll({
    where: { course_id: courseId },
    order: [['id', 'ASC']]
  });

  return sections.map(section => section.toJSON());
};

/**
 * Obtener una sección específica por ID
 */
export const fetchById = async (sectionId, courseId) => {
  const section = await Section.findOne({
    where: { 
      id: sectionId,
      course_id: courseId 
    }
  });

  if (!section) {
    const error = new Error('Sección no encontrada');
    error.status = 404;
    error.details = `ID ${sectionId}`;
    throw error;
  }

  return section.toJSON();
};

/**
 * Crear una nueva sección
 */
export const create = async (courseId, data) => {
  const transaction = await sequelize.transaction();

  try {
    // Verificar que el curso existe
    const course = await Course.findByPk(courseId, { transaction });
    if (!course) {
      const error = new Error('Curso no encontrado');
      error.status = 404;
      error.details = `ID ${courseId}`;
      throw error;
    }

    const section = await Section.create(
      {
        name: data.name,
        description: data.description || null,
        image_url: data.image_url || null,
        course_id: courseId
      },
      { transaction }
    );

    await transaction.commit();
    return section.toJSON();

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Actualizar una sección existente
 */
export const update = async (sectionId, courseId, data) => {
  const transaction = await sequelize.transaction();

  try {
    const section = await Section.findOne({
      where: {
        id: sectionId,
        course_id: courseId
      },
      transaction
    });

    if (!section) {
      const error = new Error('Sección no encontrada');
      error.status = 404;
      error.details = `ID ${sectionId}`;
      throw error;
    }

    await section.update(
      {
        name: data.name,
        description: data.description,
        image_url: data.image_url,
      },
      { transaction }
    );

    await transaction.commit();
    return section.toJSON();

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Eliminar una sección
 */
export const remove = async (sectionId, courseId) => {
  const transaction = await sequelize.transaction();

  try {
    const section = await Section.findOne({
      where: {
        id: sectionId,
        course_id: courseId
      },
      transaction
    });

    if (!section) {
      const error = new Error('Sección no encontrada');
      error.status = 404;
      error.details = `ID ${sectionId}`;
      throw error;
    }

    await section.destroy({ transaction });
    await transaction.commit();

    return { message: 'Sección eliminada correctamente' };

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Reordenar secciones (si se necesita en el futuro)
 */
export const reorder = async (courseId, sectionOrder) => {
  const transaction = await sequelize.transaction();

  try {
    const updates = sectionOrder.map(async (sectionId, index) => {
      const section = await Section.findOne({
        where: {
          id: sectionId,
          course_id: courseId
        },
        transaction
      });

      if (section) {
        // Si tuvieras un campo 'order', lo actualizarías aquí
        // await section.update({ order: index + 1 }, { transaction });
      }
    });

    await Promise.all(updates);
    await transaction.commit();

    return { message: 'Secciones reordenadas correctamente' };

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};