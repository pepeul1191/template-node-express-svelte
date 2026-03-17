// management/controllers/sections_students_controller.js

import * as sectionsStudentsService from '../services/sections_students_service.js';

/**
 * Obtener estudiantes de una sección con filtro de relación
 */
export const fetchStudentsBySection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { name, document_number, code, relation_filter, limit, offset } = req.query;

    if (!sectionId) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro sectionId es obligatorio',
        data: null,
        error: 'sectionId required'
      });
    }

    const sectionIdInt = parseInt(sectionId);
    const queryLimit = limit ? parseInt(limit) : 20;
    const queryOffset = offset ? parseInt(offset) : 0;
    
    // Construir parámetros de búsqueda
    const searchParams = {};
    if (name) searchParams.full_name = name;
    if (document_number) searchParams.document_number = document_number;
    if (code) searchParams.code = code;

    let students = [];

    // Llamar al método correspondiente según el filtro de relación
    if (relation_filter === 'related') {
      students = await sectionsStudentsService.fetchOnlyRelatedBySectionId(
        sectionIdInt,
        queryLimit,
        searchParams
      );
    } else if (relation_filter === 'not_related') {
      students = await sectionsStudentsService.fetchOnlyNotRelatedBySectionId(
        sectionIdInt,
        queryLimit,
        searchParams
      );
    } else {
      // null o cualquier otro valor - todos (relacionados y no relacionados)
      students = await sectionsStudentsService.fetchAllWithRelationStatusBySection(
        sectionIdInt,
        queryLimit,
        searchParams
      );
    }

    // Aplicar offset manualmente
    if (queryOffset > 0) {
      students = students.slice(queryOffset);
    }

    // Obtener total de estudiantes en la sección (solo para relacionados)
    let total = students.length;
    if (relation_filter === 'related') {
      total = await sectionsStudentsService.countStudentsBySection(sectionIdInt);
    }

    return res.status(200).json({
      success: true,
      message: 'Lista de estudiantes de la sección',
      data: {
        list: students,
        pagination: {
          limit: queryLimit,
          offset: queryOffset,
          returned: students.length,
          total: total
        }
      },
      error: ''
    });

  } catch (error) {
    console.error('Error en fetchStudentsBySection:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      data: null,
      error: error.message
    });
  }
};

/**
 * Obtener todas las secciones con sus estudiantes
 */
export const fetchAllSectionsWithStudents = async (req, res) => {
  try {
    const { limit, offset } = req.query;
    
    const queryLimit = limit ? parseInt(limit) : 42;
    const queryOffset = offset ? parseInt(offset) : 0;

    const sections = await sectionsStudentsService.fetchAllWithStudents(queryLimit, queryOffset);

    return res.status(200).json({
      success: true,
      message: 'Lista de secciones con estudiantes',
      data: {
        list: sections,
        pagination: {
          limit: queryLimit,
          offset: queryOffset,
          returned: sections.length
        }
      },
      error: ''
    });

  } catch (error) {
    console.error('Error en fetchAllSectionsWithStudents:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      data: null,
      error: error.message
    });
  }
};

/**
 * Asignar estudiantes a una sección
 */
export const assignStudents = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { studentIds } = req.body;

    if (!sectionId) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro sectionId es obligatorio',
        data: null,
        error: 'sectionId required'
      });
    }

    if (!studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({
        success: false,
        message: 'El campo studentIds debe ser un array',
        data: null,
        error: 'studentIds must be an array'
      });
    }

    await sectionsStudentsService.assignStudentsToSection(parseInt(sectionId), studentIds);

    return res.status(200).json({
      success: true,
      message: 'Estudiantes asignados correctamente',
      data: { assigned: studentIds.length },
      error: ''
    });

  } catch (error) {
    console.error('Error en assignStudents:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      data: null,
      error: error.message
    });
  }
};

/**
 * Agregar estudiantes a una sección (sin eliminar existentes)
 */
export const addStudents = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { studentIds } = req.body;

    if (!sectionId) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro sectionId es obligatorio',
        data: null,
        error: 'sectionId required'
      });
    }

    if (!studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({
        success: false,
        message: 'El campo studentIds debe ser un array',
        data: null,
        error: 'studentIds must be an array'
      });
    }

    await sectionsStudentsService.addStudentsToSection(parseInt(sectionId), studentIds);

    return res.status(200).json({
      success: true,
      message: 'Estudiantes agregados correctamente',
      data: { added: studentIds.length },
      error: ''
    });

  } catch (error) {
    console.error('Error en addStudents:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      data: null,
      error: error.message
    });
  }
};

/**
 * Eliminar estudiantes de una sección
 */
export const removeStudents = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { studentIds } = req.body;

    if (!sectionId) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro sectionId es obligatorio',
        data: null,
        error: 'sectionId required'
      });
    }

    if (!studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({
        success: false,
        message: 'El campo studentIds debe ser un array',
        data: null,
        error: 'studentIds must be an array'
      });
    }

    await sectionsStudentsService.removeStudentsFromSection(parseInt(sectionId), studentIds);

    return res.status(200).json({
      success: true,
      message: 'Estudiantes eliminados de la sección correctamente',
      data: { removed: studentIds.length },
      error: ''
    });

  } catch (error) {
    console.error('Error en removeStudents:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      data: null,
      error: error.message
    });
  }
};

/**
 * Verificar si un estudiante está en una sección
 */
export const checkStudentInSection = async (req, res) => {
  try {
    const { sectionId, studentId } = req.params;

    const isInSection = await sectionsStudentsService.isStudentInSection(
      parseInt(sectionId),
      parseInt(studentId)
    );

    return res.status(200).json({
      success: true,
      message: isInSection ? 'El estudiante está en la sección' : 'El estudiante no está en la sección',
      data: { isInSection },
      error: ''
    });

  } catch (error) {
    console.error('Error en checkStudentInSection:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      data: null,
      error: error.message
    });
  }
};

/**
 * Obtener secciones de un estudiante
 */
export const fetchSectionsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { limit } = req.query;

    const queryLimit = limit ? parseInt(limit) : 42;

    const sections = await sectionsStudentsService.fetchSectionsByStudentId(
      parseInt(studentId),
      queryLimit
    );

    return res.status(200).json({
      success: true,
      message: 'Lista de secciones del estudiante',
      data: {
        list: sections,
        pagination: {
          limit: queryLimit,
          returned: sections.length
        }
      },
      error: ''
    });

  } catch (error) {
    console.error('Error en fetchSectionsByStudent:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      data: null,
      error: error.message
    });
  }
};