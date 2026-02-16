import Department from '../models/department.js';

/**
 * Obtener departamentos
 */
export const fetchAll = async () => {
  const departments = await Department.findAll();

  return departments.map(department => department.toJSON());
};

export async function create(data) {
  return await Department.create({
    name: data.name
  });
}