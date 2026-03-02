// management/models/phones.js

import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const Phone = sequelize.define('Phone', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  person_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(40),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  }
}, {
  tableName: 'phones',
  timestamps: false
});

export default Phone;