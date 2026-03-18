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
import WorkerRole from '../management/models/worker_role.js';
import Address from '../management/models/addresses.js';
import RepresentativeRole from '../management/models/representative_role.js';
import RepresentativeStudentRole from '../management/models/representatives_students_roles.js';
import Course from '../management/models/courses.js';
import Level from '../management/models/level.js';
import Section from '../management/models/sections.js';
import SectionWorkerRole from '../management/models/sections_workers_roles.js';
import SectionStudent from '../management/models/sections_students.js';
import Folder from '../management/models/folder.js';
import FolderCommonMaterial from '../management/models/folder_common_material.js';
import FolderSeccionMaterial from '../management/models/folder_section_material.js';
import Document from '../management/models/document.js';

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

// Course -> Section (1:N) - Un curso tiene muchas secciones
Course.hasMany(Section, {
  foreignKey: 'course_id',
  as: 'sections'
});

Section.belongsTo(Course, {
  foreignKey: 'course_id',
  as: 'course'
});

// Section <-> Worker (a través de SectionWorkerRole)
Section.belongsToMany(Worker, {
  through: SectionWorkerRole,
  foreignKey: 'section_id',
  otherKey: 'worker_id',
  as: 'workers'
});

Worker.belongsToMany(Section, {
  through: SectionWorkerRole,
  foreignKey: 'worker_id',
  otherKey: 'section_id',
  as: 'sections'
});

// Relaciones directas con SectionWorkerRole
Section.hasMany(SectionWorkerRole, {
  foreignKey: 'section_id',
  as: 'worker_roles'
});

SectionWorkerRole.belongsTo(Section, {
  foreignKey: 'section_id',
  as: 'section'
});

Worker.hasMany(SectionWorkerRole, {
  foreignKey: 'worker_id',
  as: 'section_roles'
});

SectionWorkerRole.belongsTo(Worker, {
  foreignKey: 'worker_id',
  as: 'worker'
});

WorkerRole.hasMany(SectionWorkerRole, {
  foreignKey: 'worker_role_id',
  as: 'section_workers'
});

SectionWorkerRole.belongsTo(WorkerRole, {
  foreignKey: 'worker_role_id',
  as: 'role'
});

// ============================================
// También podrías querer agregar una relación adicional:
// Worker tiene muchos WorkerRoles a través de SectionWorkerRole
// ============================================

Worker.belongsToMany(WorkerRole, {
  through: SectionWorkerRole,
  foreignKey: 'worker_id',
  otherKey: 'worker_role_id',
  as: 'roles_in_sections'
});

WorkerRole.belongsToMany(Worker, {
  through: SectionWorkerRole,
  foreignKey: 'worker_role_id',
  otherKey: 'worker_id',
  as: 'workers_in_sections'
});

// Section <-> Student (a través de SectionStudent)
Section.belongsToMany(Student, {
  through: SectionStudent,
  foreignKey: 'section_id',
  otherKey: 'student_id',
  as: 'students'
});

Student.belongsToMany(Section, {
  through: SectionStudent,
  foreignKey: 'student_id',
  otherKey: 'section_id',
  as: 'sections'
});

// Relaciones directas con SectionStudent
Section.hasMany(SectionStudent, {
  foreignKey: 'section_id',
  as: 'student_assignments'
});

SectionStudent.belongsTo(Section, {
  foreignKey: 'section_id',
  as: 'section'
});

Student.hasMany(SectionStudent, {
  foreignKey: 'student_id',
  as: 'section_assignments'
});

SectionStudent.belongsTo(Student, {
  foreignKey: 'student_id',
  as: 'student'
});

// ============================================
// ASOCIACIONES DE CARPETAS Y DOCUMENTOS
// ============================================

// Auto-referencia para estructura jerárquica de carpetas
Folder.belongsTo(Folder, {
  as: 'parent',
  foreignKey: 'parent_id',
  onDelete: 'CASCADE'
});

Folder.hasMany(Folder, {
  as: 'children',
  foreignKey: 'parent_id',
  onDelete: 'CASCADE'
});

// Relaciones polimórficas: Folder puede ser material común o de sección
Folder.hasOne(FolderCommonMaterial, {
  foreignKey: 'id',
  as: 'commonMaterial',
  onDelete: 'CASCADE'
});

FolderCommonMaterial.belongsTo(Folder, {
  foreignKey: 'id',
  as: 'folder'
});

Folder.hasOne(FolderSeccionMaterial, {
  foreignKey: 'id',
  as: 'sectionMaterial',
  onDelete: 'CASCADE'
});

FolderSeccionMaterial.belongsTo(Folder, {
  foreignKey: 'id',
  as: 'folder'
});

// Relaciones con Course y Section
FolderCommonMaterial.belongsTo(Course, {
  foreignKey: 'course_id',
  as: 'course'
});

Course.hasMany(FolderCommonMaterial, {
  foreignKey: 'course_id',
  as: 'commonMaterialFolders'
});

FolderSeccionMaterial.belongsTo(Section, {
  foreignKey: 'section_id',
  as: 'section'
});

Section.hasMany(FolderSeccionMaterial, {
  foreignKey: 'section_id',
  as: 'sectionMaterialFolders'
});

// Relaciones de Documentos
Folder.hasMany(Document, {
  foreignKey: 'folder_id',
  as: 'documents',
  onDelete: 'CASCADE'
});

Document.belongsTo(Folder, {
  foreignKey: 'folder_id',
  as: 'folder'
});

Document.belongsTo(Worker, {
  foreignKey: 'uploaded_by',
  as: 'uploader'
});

Worker.hasMany(Document, {
  foreignKey: 'uploaded_by',
  as: 'uploadedDocuments'
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
  Section,
  WorkerRole,
  SectionWorkerRole,
  SectionStudent, 
  Folder,
  FolderCommonMaterial,
  FolderSeccionMaterial,
  Document,
};