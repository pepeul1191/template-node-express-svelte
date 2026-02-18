// management/models/employee_role.js

import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const EmployeeRole = sequelize.define('EmployeeRole', {
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
  tableName: 'employee_roles',
  timestamps: false
});

export default EmployeeRole;
