// management/models/vw_locations.js

import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const VwLocations = sequelize.define(
  'VwLocations',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: 'vw_locations',
    timestamps: false,
  }
);

export default VwLocations;
