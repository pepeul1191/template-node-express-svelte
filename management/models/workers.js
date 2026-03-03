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
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'workers',
  timestamps: false
});

export default Worker;
