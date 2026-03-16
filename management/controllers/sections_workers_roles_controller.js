// management/controllers/sections_workers_roles_controller.js

import * as sectionsWorkersRolesService from '../services/sections_workers_roles_service.js';

/**
 * Obtener trabajadores por sección (con filtros de relación)
 */
// management/controllers/sections_workers_roles_controller.js

export const fetchWorkersBySection = async (req, res) => {
  try {
    const { name, document_number, worker_code, relation_filter, section_id, limit, offset } = req.query;

    // Validar que section_id esté presente
    if (!section_id) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro section_id es obligatorio',
        data: null,
        error: 'section_id required'
      });
    }

    const sectionId = parseInt(section_id);
    const queryLimit = limit ? parseInt(limit) : 20;
    const queryOffset = offset ? parseInt(offset) : 0;
    
    // Construir parámetros de búsqueda
    const searchParams = {};
    if (name) searchParams.full_name = name;
    if (document_number) searchParams.document_number = document_number;
    if (worker_code) searchParams.worker_code = worker_code; // <-- Agregar worker_code

    let workers = [];

    // Llamar al método correspondiente según el filtro de relación
    if (relation_filter === 'related') {
      workers = await sectionsWorkersRolesService.fetchOnlyRelatedBySectionId(
        sectionId, 
        queryLimit, 
        searchParams
      );
    } else if (relation_filter === 'not_related') {
      workers = await sectionsWorkersRolesService.fetchOnlyNotRelatedBySectionId(
        sectionId, 
        queryLimit, 
        searchParams
      );
    } else {
      workers = await sectionsWorkersRolesService.fetchAllWithRelationStatusBySection(
        sectionId, 
        queryLimit, 
        searchParams
      );
    }

    // Aplicar offset manualmente
    if (queryOffset > 0) {
      workers = workers.slice(queryOffset);
    }

    return res.status(200).json({
      success: true,
      message: 'Lista de trabajadores con roles en la sección',
      data: {
        list: workers,
        pagination: {
          limit: queryLimit,
          offset: queryOffset,
          returned: workers.length,
          total: workers.length
        }
      },
      error: ''
    });

  } catch (error) {
    console.error('Error en fetchWorkersBySection:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      data: null,
      error: error.message
    });
  }
};

/**
 * Guardar relaciones trabajador-rol para una sección
 */
export const saveWorkersBySection = async (req, res) => {
  try {
    const { sectionId } = req.params;

    const response = await sectionsWorkersRolesService.saveManyBySection(sectionId, req.body);

    return res.status(200).json({
      success: true,
      message: 'Roles de trabajadores guardados correctamente en la sección',
      data: response,
      error: '',
    });

  } catch (error) {
    console.error('Error en saveWorkersBySection:', error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error interno del servidor',
      data: null,
      error: error.error || error.message,
    });
  }
};

/**
 * Obtener secciones por trabajador (vista inversa)
 */
export const fetchSectionsByWorker = async (req, res) => {
  try {
    const { name, relation_filter, worker_id, limit, offset } = req.query;

    // Validar que worker_id esté presente
    if (!worker_id) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro worker_id es obligatorio',
        data: null,
        error: 'worker_id required'
      });
    }

    const workerId = parseInt(worker_id);
    const queryLimit = limit ? parseInt(limit) : 20;
    const queryOffset = offset ? parseInt(offset) : 0;

    let sections = [];

    // Llamar al método correspondiente según el filtro de relación
    if (relation_filter === 'related') {
      sections = await sectionsWorkersRolesService.fetchOnlyRelatedByWorkerId(
        workerId,
        queryLimit
      );
    } else if (relation_filter === 'not_related') {
      sections = await sectionsWorkersRolesService.fetchOnlyNotRelatedByWorkerId(
        workerId,
        queryLimit
      );
    } else {
      sections = await sectionsWorkersRolesService.fetchAllWithRelationStatusByWorker(
        workerId,
        queryLimit
      );
    }

    // Aplicar offset manual
    if (queryOffset > 0) {
      sections = sections.slice(queryOffset);
    }

    return res.status(200).json({
      success: true,
      message: 'Lista de secciones con roles del trabajador',
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
    console.error('Error en fetchSectionsByWorker:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      data: null,
      error: error.message
    });
  }
};

/**
 * Guardar relaciones sección-rol para un trabajador (vista inversa)
 */
export const saveSectionsByWorker = async (req, res) => {
  try {
    const { workerId } = req.params;

    const response = await sectionsWorkersRolesService.saveManyByWorker(
      workerId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: 'Roles de secciones guardados correctamente para el trabajador',
      data: response,
      error: '',
    });

  } catch (error) {
    console.error('Error en saveSectionsByWorker:', error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error interno del servidor',
      data: null,
      error: error.error || error.message,
    });
  }
};