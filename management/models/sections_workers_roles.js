// management/models/sections_workers_roles.js
import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const SectionWorkerRole = sequelize.define('SectionWorkerRole', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  section_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  worker_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  worker_role_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  }
}, {
  tableName: 'sections_workers_roles',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['section_id', 'worker_id', 'worker_role_id'],
      name: 'uq_swr_unique_combination'
    }
  ]
});

export default SectionWorkerRole;