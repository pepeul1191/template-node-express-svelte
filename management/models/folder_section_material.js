// models/folder_seccion_material.js
import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const FolderSeccionMaterial = sequelize.define('FolderSeccionMaterial', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    allowNull: false,
    references: {
      model: 'folders',
      key: 'id'
    }
  },
  section_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'sections',
      key: 'id'
    }
  }
}, {
  tableName: 'folder_seccion_materials',
  timestamps: false,
  indexes: [
    {
      name: 'idx_fsm_section_id',
      fields: ['section_id']
    }
  ]
});

export default FolderSeccionMaterial;