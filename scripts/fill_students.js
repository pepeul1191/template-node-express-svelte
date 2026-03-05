import fs from 'fs';
import { faker } from '@faker-js/faker';

faker.locale = 'es';

const personStartId = 31;
const total = 500;
const studentCodeStart = 20260001;
const userId = 1;

let text = '-- migrate:up\n\n';

let personsValues = [];
let studentsValues = [];

for (let i = 0; i < total; i++) {

  const personId = personStartId + i;
  const studentCode = studentCodeStart + i;

  const names = faker.person.firstName().replace(/'/g, "''");
  const lastNames = faker.person.lastName().replace(/'/g, "''");
  const documentNumber = faker.string.numeric(8);
  const sexId = faker.number.int({ min: 1, max: 2 });
  const documentTypeId = 1;

  const birthDate = faker.date.birthdate({
    min: 5,
    max: 18,
    mode: 'age'
  }).toISOString().split('T')[0];

  const email = faker.internet.email({
    firstName: names,
    lastName: lastNames
  }).replace(/'/g, "''");

  personsValues.push(
    `(${personId}, '${names}', '${lastNames}', '${documentNumber}', ${sexId}, ${documentTypeId}, '${birthDate}')`
  );

  studentsValues.push(
    `(${studentCode}, '${email}', ${personId}, NULL)`
  );
}

// INSERT persons
text += `INSERT INTO persons 
(id, names, last_names, document_number, sex_id, document_type_id, birth_date)
VALUES
${personsValues.join(',\n')};

\n`;

// INSERT students (id AUTO_INCREMENT empieza en 1)
text += `INSERT INTO students
(code, email, person_id, user_id)
VALUES
${studentsValues.join(',\n')};

\n`;

text += '-- migrate:down\n\n';
text += 'DELETE FROM students WHERE person_id >= 31;\n';
text += 'DELETE FROM persons WHERE id >= 31;\n';
text += 'ALTER TABLE persons AUTO_INCREMENT = 31;\n';
text += 'ALTER TABLE students AUTO_INCREMENT = 1;\n';

fs.writeFileSync('inserts_persons_students.sql', text, { encoding: 'utf-8' });

console.log('✅ Archivo generado con inserts en bloque.');