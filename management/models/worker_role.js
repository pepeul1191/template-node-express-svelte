// management/models/worker_role.js

import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const WorkerRole = sequelize.define('WorkerRole', {
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
  tableName: 'worker_roles',
  timestamps: false
});

export default WorkerRole;
