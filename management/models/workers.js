// management/models/workers.js

import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const Worker = sequelize.define('Worker', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  code: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  person_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false
  }
}, {
  tableName: 'workers',
  timestamps: false
});

export default Worker;
