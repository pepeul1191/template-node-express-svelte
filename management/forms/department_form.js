// management/forms/departments_form.js

export default class DepartmentForm {
  constructor(data = {}) {
    this.data = data;
    this.errors = {};
    this.cleanedData = {};
  }

  isValid() {
    const { name } = this.data;

    // Validar name
    if (!name || name.trim() === '') {
      this.errors.name = 'El nombre es obligatorio';
    } else if (name.length > 40) {
      this.errors.name = 'Máximo 40 caracteres';
    } else {
      this.cleanedData.name = name.trim();
    }

    return Object.keys(this.errors).length === 0;
  }
}
