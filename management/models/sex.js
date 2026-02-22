// management/models/sex.js

import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const Sex = sequelize.define('Sex', {
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
  tableName: 'sexs',
  timestamps: false
});

export default Sex;
