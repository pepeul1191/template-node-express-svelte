// management/models/sections.js
import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const Section = sequelize.define('Section', {
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
    type: DataTypes.STRING(20),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image_url: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  course_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  }
}, {
  tableName: 'sections',
  timestamps: false
});

export default Section;