// management/models/document_type.js

import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const DocumentType = sequelize.define('DocumentType', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(20),
    allowNull: false
  }
}, {
  tableName: 'document_types',
  timestamps: false
});

export default DocumentType;
