// configs/models.js
import Department from '../management/models/department.js';
import Province from '../management/models/province.js';
import District from '../management/models/district.js';
import VWLocations from '../management/models/vw_locations.js';
import Person from '../management/models/persons.js';
import Worker from '../management/models/workers.js';
import Sex from '../management/models/sex.js';
import DocumentType from '../management/models/document_type.js';
import Phone from '../management/models/phones.js';
import Address from '../management/models/addresses.js';

Department.hasMany(Province, {
  foreignKey: 'department_id',
  as: 'provinces'
});

Province.belongsTo(Department, {
  foreignKey: 'department_id',
  as: 'department'
});

Province.hasMany(District, {
  foreignKey: 'province_id',
  as: 'districts'
});

District.belongsTo(Province, {
  foreignKey: 'province_id',
  as: 'province'
});

Person.hasOne(Worker, {
  foreignKey: 'person_id',
  as: 'worker'
});

Worker.belongsTo(Person, {
  foreignKey: 'person_id',
  as: 'person'
});

// Sex -> Person (1:N) - Person has a sex
Sex.hasMany(Person, {
  foreignKey: 'sex_id',
  as: 'sexs'
});

Person.belongsTo(Sex, {
  foreignKey: 'sex_id',
  as: 'sex'
});

// DocumentType -> Person (1:N) - Person has a sex
DocumentType.hasMany(Person, {
  foreignKey: 'document_type_id',
  as: 'document_type'
});

Person.belongsTo(DocumentType, {
  foreignKey: 'document_type_id',
  as: 'document_type'
});

// Person -> Phone (1:N) - Person has many phones
Person.hasMany(Phone, {
  foreignKey: 'person_id',
  as: 'phones'
});

Phone.belongsTo(Person, {
  foreignKey: 'person_id',
  as: 'person'
});

// Person -> Address (1:N) - Person has many addresses
Person.hasMany(Address, {
  foreignKey: 'person_id',
  as: 'addresses'
});

Address.belongsTo(Person, {
  foreignKey: 'person_id',
  as: 'person'
});

// District -> Address (1:N) - District has many addresses
VWLocations.hasMany(Address, {
  foreignKey: 'district_id',
  as: 'addresses'
});

Address.belongsTo(VWLocations, {
  foreignKey: 'district_id',
  as: 'district'
});

export {
  Department,
  Province,
  District,
  Person,
  Worker,
  Sex,
  DocumentType,
  Phone,
  Address,
  VWLocations,
};