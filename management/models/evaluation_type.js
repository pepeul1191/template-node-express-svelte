// management/models/evaluation_type.js

import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const EvaluationType = sequelize.define('EvaluationType', {
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
  tableName: 'evaluation_types',
  timestamps: false
});

export default EvaluationType;
