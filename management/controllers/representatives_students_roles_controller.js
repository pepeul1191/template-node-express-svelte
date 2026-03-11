// management/controllers/representatives_students_roles_controller.js

import * as representativesStudentsRolesService from '../services/representatives_students_roles_service.js';

export const fetchRepresentativesByStudent = async (req, res) => {
  try {
    const { name, document_number, relation_filter, student_id, limit, offset } = req.query;

    // Validar que student_id esté presente
    if (!student_id) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro student_id es obligatorio',
        data: null,
        error: 'student_id required'
      });
    }

    const studentId = parseInt(student_id);
    const queryLimit = limit ? parseInt(limit) : 20;
    const queryOffset = offset ? parseInt(offset) : 0;
    
    // Construir parámetros de búsqueda
    const searchParams = {};
    if (name) searchParams.full_name = name;
    if (document_number) searchParams.document_number = document_number;

    let reps = [];

    // Llamar al método correspondiente según el filtro de relación
    if (relation_filter === 'related') {
      // Solo los que tienen relación
      reps = await representativesStudentsRolesService.fetchOnlyRelatedByStudentId(
        studentId, 
        queryLimit, 
        searchParams
      );
    } else if (relation_filter === 'not_related') {
      // Solo los que NO tienen relación
      reps = await representativesStudentsRolesService.fetchOnlyNotRelatedByStudentId(
        studentId, 
        queryLimit, 
        searchParams
      );
    } else {
      // null o cualquier otro valor - todos (relacionados y no relacionados)
      reps = await representativesStudentsRolesService.fetchAllWithRelationStatus(
        studentId, 
        queryLimit, 
        searchParams
      );
    }

    // Aplicar offset manualmente ya que los servicios usan limit pero no offset
    // Esto es necesario porque los servicios actualmente no soportan offset
    if (queryOffset > 0) {
      reps = reps.slice(queryOffset);
    }

    return res.status(200).json({
      success: true,
      message: 'Lista de representantes con roles y estudiantes',
      data: {
        list: reps,
        pagination: {
          limit: queryLimit,
          offset: queryOffset,
          returned: reps.length
        }
      },
      error: ''
    });

  } catch (error) {
    console.error('Error en fetchAll:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      data: null,
      error: error.message
    });
  }
};

export const saveRepresentativesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const response = await representativesStudentsRolesService.saveManyByStudent(studentId, req.body);

    return res.status(200).json({
      success: true,
      message: 'Roles de representantes guardados correctamente',
      data: response,
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

export const fetchStudentsByRepresentative = async (req, res) => {
  try {
    const { name, document_number, relation_filter, representative_id, limit, offset } = req.query;

    // Validar que representative_id esté presente
    if (!representative_id) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro representative_id es obligatorio',
        data: null,
        error: 'representative_id required'
      });
    }

    const representativeId = parseInt(representative_id);
    const queryLimit = limit ? parseInt(limit) : 20;
    const queryOffset = offset ? parseInt(offset) : 0;

    // Construir parámetros de búsqueda
    const searchParams = {};
    if (name) searchParams.full_name = name;
    if (document_number) searchParams.document_number = document_number;

    let students = [];

    // Llamar al método correspondiente según el filtro de relación
    if (relation_filter === 'related') {

      students = await representativesStudentsRolesService.fetchOnlyRelatedByRepresentativeId(
        representativeId,
        queryLimit,
        searchParams
      );

    } else if (relation_filter === 'not_related') {

      students = await representativesStudentsRolesService.fetchOnlyNotRelatedByRepresentativeId(
        representativeId,
        queryLimit,
        searchParams
      );

    } else {

      students = await representativesStudentsRolesService.fetchAllWithRelationStatusByRepresentative(
        representativeId,
        queryLimit,
        searchParams
      );

    }

    // Aplicar offset manual
    if (queryOffset > 0) {
      students = students.slice(queryOffset);
    }

    return res.status(200).json({
      success: true,
      message: 'Lista de estudiantes con roles y apoderado',
      data: {
        list: students,
        pagination: {
          limit: queryLimit,
          offset: queryOffset,
          returned: students.length
        }
      },
      error: ''
    });

  } catch (error) {
    console.error('Error en fetchStudentsByRepresentative:', error);

    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      data: null,
      error: error.message
    });
  }
};

export const saveStudentsByRepresentative = async (req, res) => {
  try {

    const { representativeId } = req.params;

    const response = await representativesStudentsRolesService.saveManyByRepresentative(
      representativeId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: 'Roles de estudiantes guardados correctamente',
      data: response,
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