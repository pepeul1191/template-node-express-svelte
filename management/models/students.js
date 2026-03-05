// management/models/workers.js

import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true
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
  tableName: 'students',
  timestamps: false
});

export default Student;
