// management/models/province.js

import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';
import Province from './province.js';

const District = sequelize.define('District', {
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
  province_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'provinces', // nombre de la tabla
      key: 'id'
    }
  }
}, {
  tableName: 'districts',
  timestamps: false
});

District.belongsTo(Province, {
  foreignKey: 'province_id'
});

export default District;
