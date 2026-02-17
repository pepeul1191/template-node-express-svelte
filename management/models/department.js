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
  name: {
    type: DataTypes.STRING(40),
    allowNull: false
  }
}, {
  tableName: 'departments',
  timestamps: false
});

export default Department;
