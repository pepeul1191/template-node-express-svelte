// models/folder.js
import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const Folder = sequelize.define('Folder', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  parent_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    references: {
      model: 'folders',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'folders',
  timestamps: false, // Porque usamos campos created/updated personalizados
  indexes: [
    {
      name: 'idx_folders_parent_id',
      fields: ['parent_id']
    }
  ]
});

export default Folder;