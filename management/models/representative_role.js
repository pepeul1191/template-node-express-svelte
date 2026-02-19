// management/models/representative_role.js

import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const RepresentativeRole = sequelize.define('RepresentativeRole', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(20),
    allowNull: false
  }
}, {
  tableName: 'representative_roles',
  timestamps: false
});

export default RepresentativeRole;
