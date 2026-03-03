// management/models/persons.js

import { DataTypes } from 'sequelize';
import sequelize from '../../configs/database.js';

const Person = sequelize.define('Person', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  names: {
    type: DataTypes.STRING(45),
    allowNull: false
  },
  last_names: {
    type: DataTypes.STRING(45),
    allowNull: false
  },
  document_number: {
    type: DataTypes.STRING(12),
    allowNull: true
  },
  image_url: {
    type: DataTypes.STRING(70),
    allowNull: true
  },
  birth_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  created: {
    type: DataTypes.DATE,
    allowNull: true
  },
  updated: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sex_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true
  },
  document_type_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true
  }
}, {
  tableName: 'persons',
  timestamps: false
});

export default Person;