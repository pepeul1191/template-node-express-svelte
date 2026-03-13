// management/models/courses.js

import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const Course = sequelize.define('Course', {
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
  code: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sylabus_url: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  level_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  worker_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  }
}, {
  tableName: 'courses',
  timestamps: false
});

export default Course;