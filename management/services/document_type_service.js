// management/services/representative_role_service.js

import sequelize from '../../configs/database.js';
import DocumentType from '../models/document_type.js';

/**
 * Obtener types de representante
 */
export const fetchAll = async () => {
  const types = await DocumentType.findAll();

  return types.map(role => role.toJSON());
};

