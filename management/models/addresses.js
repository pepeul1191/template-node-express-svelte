// management/models/addresses.js

import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const Address = sequelize.define('Address', {
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
  address: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'addresses',
  timestamps: false
});

export default Address;