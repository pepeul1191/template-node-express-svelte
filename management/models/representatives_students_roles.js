// management/models/representatives_students_roles.js
import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const RepresentativeStudentRole = sequelize.define('RepresentativeStudentRole', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  representative_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  student_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  },
  representative_role_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  }
}, {
  tableName: 'representatives_students_roles',
  timestamps: false
});

export default RepresentativeStudentRole;