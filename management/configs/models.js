// management/configs/models.js

import Department from '../models/department.js';
import Province from './models/province.js';

// Relaciones
Department.hasMany(Province, {
  foreignKey: 'department_id'
});

Province.belongsTo(Department, {
  foreignKey: 'department_id'
});

export {
  Department,
  Province
};
