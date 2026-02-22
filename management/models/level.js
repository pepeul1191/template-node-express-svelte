// management/models/representative_role.js

import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const Level = sequelize.define('Level', {
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
  tableName: 'levels',
  timestamps: false
});

export default Level;
