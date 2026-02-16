// management/models/department.js

import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  named: {
    type: DataTypes.STRING(40),
    allowNull: false
  }
}, {
  tableName: 'departments',
  timestamps: false // No hay created_at / updated_at en tu tabla
});

export default Department;
