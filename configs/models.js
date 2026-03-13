// configs/models.js
import Department from '../management/models/department.js';
import Province from '../management/models/province.js';
import District from '../management/models/district.js';
import VWLocations from '../management/models/vw_locations.js';
import Person from '../management/models/persons.js';
import Representative from '../management/models/representatives.js';
import Worker from '../management/models/workers.js';
import Student from '../management/models/students.js';
import Sex from '../management/models/sex.js';
import DocumentType from '../management/models/document_type.js';
import Phone from '../management/models/phones.js';
import Address from '../management/models/addresses.js';
import RepresentativeRole from '../management/models/representative_role.js';
import RepresentativeStudentRole from '../management/models/representatives_students_roles.js';
import Course from '../management/models/courses.js';
import Level from '../management/models/level.js';

// locations

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

// Person -> Worker (1:1) - Worker is a Person

Person.hasOne(Worker, {
  foreignKey: 'person_id',
  as: 'worker'
});

Worker.belongsTo(Person, {
  foreignKey: 'person_id',
  as: 'person'
});

// Person -> Representative (1:1) - Representative is a Person

Person.hasOne(Representative, {
  foreignKey: 'person_id',
  as: 'representative'
});

Representative.belongsTo(Person, {
  foreignKey: 'person_id',
  as: 'person'
});

// Person -> Student (1:1) - Student is a Person

Person.hasOne(Student, {
  foreignKey: 'person_id',
  as: 'student'
});

Student.belongsTo(Person, {
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
  as: 'persons' // plural makes more sense
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

// Representative -> RepresentativeStudentRole (1:N)

Representative.hasMany(RepresentativeStudentRole, {
  foreignKey: 'representative_id',
  as: 'student_roles'
});

RepresentativeStudentRole.belongsTo(Representative, {
  foreignKey: 'representative_id',
  as: 'representative'
});


// Student -> RepresentativeStudentRole (1:N)

Student.hasMany(RepresentativeStudentRole, {
  foreignKey: 'student_id',
  as: 'representative_roles'
});

RepresentativeStudentRole.belongsTo(Student, {
  foreignKey: 'student_id',
  as: 'student'
});


// RepresentativeRole -> RepresentativeStudentRole (1:N)

RepresentativeRole.hasMany(RepresentativeStudentRole, {
  foreignKey: 'representative_role_id',
  as: 'representatives_students'
});

RepresentativeStudentRole.belongsTo(RepresentativeRole, {
  foreignKey: 'representative_role_id',
  as: 'role'
});

// Courses - Workers and levels

Level.hasMany(Course, {
  foreignKey: 'level_id',
  as: 'courses'
});

Course.belongsTo(Level, {
  foreignKey: 'level_id',
  as: 'level'
});

Worker.hasMany(Course, {
  foreignKey: 'worker_id',
  as: 'courses'
});

Course.belongsTo(Worker, {
  foreignKey: 'worker_id',
  as: 'worker'
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
  Representative,
  RepresentativeRole,
  RepresentativeStudentRole,
  Course,
};