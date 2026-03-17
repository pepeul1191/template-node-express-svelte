// management/models/sections_students.js
import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const SectionStudent = sequelize.define('SectionStudent', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  section_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  student_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  }
}, {
  tableName: 'sections_students',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['section_id', 'student_id'],
      name: 'uq_section_student_unique'
    }
  ]
});

export default SectionStudent;