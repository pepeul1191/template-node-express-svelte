// management/models/representatives.js

import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const Representative = sequelize.define('Representative', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  person_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  }
}, {
  tableName: 'representatives',
  timestamps: false
});

export default Representative;
