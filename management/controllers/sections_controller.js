// management/controllers/sections_controller.js

import * as service from '../services/section_service.js';

/**
 * Obtener secciones por curso
 */
export const fetchAll = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'ID de curso inválido',
        data: null,
        error: '',
      });
    }

    const sections = await service.fetchAll(courseId);

    return res.status(200).json({
      success: true,
      message: 'Lista de secciones',
      data: {
        list: sections
      },
      error: '',
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      data: null,
      error: error.message,
    });
  }
};

/**
 * Obtener una sección específica por ID
 */
export const fetchById = async (req, res) => {
  try {
    const { courseId, sectionId } = req.params;

    if (!courseId || !sectionId) {
      return res.status(400).json({
        success: false,
        message: 'ID de curso o sección inválido',
        data: null,
        error: '',
      });
    }

    const section = await service.fetchById(sectionId, courseId);

    return res.status(200).json({
      success: true,
      message: 'Sección encontrada',
      data: section,
      error: '',
    });

  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error interno del servidor',
      data: null,
      error: error.details || error.message,
    });
  }
};

/**
 * Crear una nueva sección
 */
export const create = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'ID de curso inválido',
        data: null,
        error: '',
      });
    }

    const { name, description, image_url, code } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la sección es requerido',
        data: null,
        error: '',
      });
    }

    const section = await service.create(courseId, {
      name,
      description,
      image_url,
      code
    });

    return res.status(201).json({
      success: true,
      message: 'Sección creada correctamente',
      data: section,
      error: '',
    });

  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error interno del servidor',
      data: null,
      error: error.details || error.message,
    });
  }
};

/**
 * Actualizar una sección existente
 */
export const update = async (req, res) => {
  try {
    const { courseId, sectionId } = req.params;

    if (!courseId || !sectionId) {
      return res.status(400).json({
        success: false,
        message: 'ID de curso o sección inválido',
        data: null,
        error: '',
      });
    }

    const { name, description, image_url, code } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la sección es requerido',
        data: null,
        error: '',
      });
    }

    const section = await service.update(sectionId, courseId, {
      name,
      description,
      image_url,
      code
    });

    return res.status(200).json({
      success: true,
      message: 'Sección actualizada correctamente',
      data: section,
      error: '',
    });

  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error interno del servidor',
      data: null,
      error: error.details || error.message,
    });
  }
};

/**
 * Eliminar una sección
 */
export const remove = async (req, res) => {
  try {
    const { courseId, sectionId } = req.params;

    if (!courseId || !sectionId) {
      return res.status(400).json({
        success: false,
        message: 'ID de curso o sección inválido',
        data: null,
        error: '',
      });
    }

    const result = await service.remove(sectionId, courseId);

    return res.status(200).json({
      success: true,
      message: result.message || 'Sección eliminada correctamente',
      data: null,
      error: '',
    });

  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error interno del servidor',
      data: null,
      error: error.details || error.message,
    });
  }
};

/**
 * Reordenar secciones (opcional)
 */
export const reorder = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { sectionOrder } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'ID de curso inválido',
        data: null,
        error: '',
      });
    }

    if (!Array.isArray(sectionOrder)) {
      return res.status(400).json({
        success: false,
        message: 'El orden de secciones debe ser un array',
        data: null,
        error: '',
      });
    }

    const result = await service.reorder(courseId, sectionOrder);

    return res.status(200).json({
      success: true,
      message: result.message || 'Secciones reordenadas correctamente',
      data: null,
      error: '',
    });

  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error interno del servidor',
      data: null,
      error: error.details || error.message,
    });
  }
};