// scripts/fill_representatives.js
import fs from 'fs';
import { faker } from '@faker-js/faker';

faker.locale = 'es';

// IDs iniciales
const personStartId = 531; // después de los 500 estudiantes
const total = 100;
const userId = null;

let text = '-- migrate:up\n\n';

let personsValues = [];
let representativesValues = [];

for (let i = 0; i < total; i++) {
  const personId = personStartId + i;

  const names = faker.person.firstName().replace(/'/g, "''");
  const lastNames = faker.person.lastName().replace(/'/g, "''");
  const documentNumber = faker.string.numeric(8);
  const sexId = faker.number.int({ min: 1, max: 2 });
  const documentTypeId = 1;

  const birthDate = faker.date.birthdate({
    min: 25,
    max: 60,
    mode: 'age'
  }).toISOString().split('T')[0];

  const email = faker.internet.email({
    firstName: names,
    lastName: lastNames
  }).replace(/'/g, "''");

  // Insert persons
  personsValues.push(
    `(${personId}, '${names}', '${lastNames}', '${documentNumber}', ${sexId}, ${documentTypeId}, '${birthDate}')`
  );

  // Insert representatives
  representativesValues.push(
    `('${email}', ${personId}, NULL)`
  );
}

// INSERT persons
text += `INSERT INTO persons 
(id, names, last_names, document_number, sex_id, document_type_id, birth_date)
VALUES
${personsValues.join(',\n')};

\n`;

// INSERT representatives (id AUTO_INCREMENT empieza en 1)
text += `INSERT INTO representatives
(email, person_id, user_id)
VALUES
${representativesValues.join(',\n')};

\n`;

// migrate:down
text += '-- migrate:down\n\n';
text += `DELETE FROM representatives WHERE person_id >= ${personStartId};\n`;
text += `DELETE FROM persons WHERE id >= ${personStartId};\n`;
text += `ALTER TABLE persons AUTO_INCREMENT = ${personStartId};\n`;
text += 'ALTER TABLE representatives AUTO_INCREMENT = 1;\n';

fs.writeFileSync('inserts_persons_representatives.sql', text, { encoding: 'utf-8' });

console.log('✅ Archivo generado con inserts en bloque para representatives.');