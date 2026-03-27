// management/controllers/courses_controller.js
import * as courseService from '../services/course_service.js';

export const fetchAll = async (req, res) => {
  try {
    const { name, code, level_id, step = 10, page = 1 } = req.query;

    const [courses, counts] = await Promise.all([
      courseService.fetchCourses({ name, code, level_id, step, page }),
      courseService.countTotalPages({ name, code, level_id, step })
    ]);

    if (!courses || courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recurso no encontrado',
        data: null,
        error: 'Error 404'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Lista de cursos',
      data: {
        list: courses,
        pages: counts.totalPages,
        total: counts.totalRecords,
        offset: (page - 1) * step
      },
      error: ''
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      data: null,
      error: error.message
    });
  }
};


export const create = async (req, res) => {
  try {
    const { name, code, description, sylabus_url, level_id, worker_id } = req.body;

    const course = await courseService.createCourse({
      name,
      code,
      description,
      sylabus_url,
      level_id,
      worker_id
    });

    return res.status(201).json({
      success: true,
      message: 'Course creado correctamente',
      data: { id: course.id },
      error: ''
    });

  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error interno',
      data: null,
      error: error.error || error.message
    });
  }
};


export const fetchById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID requerido',
        data: null,
        error: 'ID faltante'
      });
    }

    const course = await courseService.findCourseById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course no encontrado',
        data: null,
        error: 'Error 404'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Course obtenido correctamente',
      data: course,
      error: ''
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error interno',
      data: null,
      error: error.message
    });
  }
};


export const update = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await courseService.updateCourse(id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Course actualizado correctamente',
      data: { updated: true },
      error: ''
    });

  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error interno',
      data: null,
      error: error.error || error.message
    });
  }
};


export const deleteC = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID requerido',
        data: null,
        error: 'ID faltante'
      });
    }

    await courseService.deleteCourse(id);

    return res.status(200).json({
      success: true,
      message: 'Course eliminado correctamente',
      data: null,
      error: ''
    });

  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error interno',
      data: null,
      error: error.error || error.message
    });
  }
};

/**
 * Obtener el material de un curso (carpetas y documentos en raíz)
 */
export const fetchMaterials = async (req, res) => {
  try {
    const { courseId } = req.params;
    const folderId = req.query.folder_id;

    const materials = await courseService.getCourseMaterials(courseId, folderId);

    return res.status(200).json({
      success: true,
      message: 'Material del curso obtenido correctamente',
      data: materials,
      error: '',
    });

  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error interno del servidor',
      data: null,
      error: error.error || error.message,
    });
  }
};