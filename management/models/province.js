// management/models/province.js

import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const Province = sequelize.define('Province', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(45),
    allowNull: false
  },
  department_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'departments', // nombre de la tabla
      key: 'id'
    }
  }
}, {
  tableName: 'provinces',
  timestamps: false
});

export default Province;
