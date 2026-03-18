// models/folder_common_material.js
import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const FolderCommonMaterial = sequelize.define('FolderCommonMaterial', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    allowNull: false,
    references: {
      model: 'folders',
      key: 'id'
    }
  },
  course_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  }
}, {
  tableName: 'folder_common_materials',
  timestamps: false,
  indexes: [
    {
      name: 'idx_fcm_course_id',
      fields: ['course_id']
    }
  ]
});

export default FolderCommonMaterial;