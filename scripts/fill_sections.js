// scripts/fill_sections.js
import fs from 'fs';

// Configuración
const courseStartId = 1;
const courseEndId = 118; // Total de cursos
const imageUrl = 'section.png'; // Misma imagen para todas

let text = '-- migrate:up\n\n';

let sectionsValues = [];
let sectionId = 1;

// Títulos y descripciones por tipo de curso
const sectionTemplates = {
  // Para cursos de inicial (más lúdico)
  inicial: [
    { name: 'Explorando y Aprendiendo', desc: 'Actividades lúdicas para descubrimiento guiado' },
    { name: 'Jugando Crecemos', desc: 'Aprendizaje a través del juego y la diversión' },
    { name: 'Descubriendo el Mundo', desc: 'Exploración del entorno cercano' }
  ],
  // Para comunicación/lenguaje
  comunicacion: [
    { name: 'Comprensión Lectora', desc: 'Desarrollo de habilidades de comprensión de textos' },
    { name: 'Producción de Textos', desc: 'Creación y redacción de diferentes tipos de textos' },
    { name: 'Expresión Oral', desc: 'Técnicas para mejorar la comunicación verbal' }
  ],
  // Para matemática
  matematica: [
    { name: 'Razonamiento Matemático', desc: 'Desarrollo del pensamiento lógico matemático' },
    { name: 'Resolución de Problemas', desc: 'Estrategias para resolver problemas matemáticos' },
    { name: 'Operaciones Básicas', desc: 'Práctica de operaciones fundamentales' }
  ],
  // Para ciencia
  ciencia: [
    { name: 'Experimentación', desc: 'Prácticas de laboratorio y experimentos' },
    { name: 'Investigación Científica', desc: 'Métodos y técnicas de investigación' },
    { name: 'Naturaleza y Ambiente', desc: 'Estudio del entorno natural' }
  ],
  // Para historia/personal social
  sociales: [
    { name: 'Análisis Histórico', desc: 'Interpretación de eventos históricos' },
    { name: 'Geografía y Espacio', desc: 'Estudio del territorio y sus características' },
    { name: 'Formación Ciudadana', desc: 'Desarrollo de valores cívicos y ciudadanos' }
  ],
  // Para arte
  arte: [
    { name: 'Técnicas Artísticas', desc: 'Práctica de diferentes técnicas de arte' },
    { name: 'Apreciación Artística', desc: 'Análisis y valoración de obras de arte' },
    { name: 'Creación y Expresión', desc: 'Desarrollo de la creatividad artística' }
  ],
  // Para educación física
  educacionFisica: [
    { name: 'Coordinación Motriz', desc: 'Ejercicios para mejorar la coordinación' },
    { name: 'Deportes y Juegos', desc: 'Práctica de diferentes disciplinas deportivas' },
    { name: 'Salud y Bienestar', desc: 'Hábitos saludables y cuidado del cuerpo' }
  ],
  // Para inglés
  ingles: [
    { name: 'Vocabulary', desc: 'Ampliación de vocabulario en inglés' },
    { name: 'Grammar', desc: 'Estructuras gramaticales del inglés' },
    { name: 'Conversation', desc: 'Práctica de conversación en inglés' }
  ],
  // Para religión/tutoría
  formacion: [
    { name: 'Reflexión y Valores', desc: 'Desarrollo espiritual y ético' },
    { name: 'Orientación Personal', desc: 'Apoyo en el desarrollo personal' },
    { name: 'Proyecto de Vida', desc: 'Planificación de metas personales' }
  ],
  // Para talleres
  taller: [
    { name: 'Nivel Básico', desc: 'Introducción y fundamentos del taller' },
    { name: 'Nivel Intermedio', desc: 'Profundización de técnicas y habilidades' },
    { name: 'Nivel Avanzado', desc: 'Perfeccionamiento y proyectos especiales' }
  ]
};

// Función para determinar el template según el nombre del curso
function getTemplateForCourse(courseId, courseName) {
  const nameLower = courseName.toLowerCase();
  
  // Determinar si es inicial por el rango de IDs
  if (courseId <= 12) {
    return sectionTemplates.inicial;
  }
  
  // Por materia
  if (nameLower.includes('comunicación') || nameLower.includes('lectoescritura') || nameLower.includes('pre-escritura')) {
    return sectionTemplates.comunicacion;
  }
  if (nameLower.includes('matemática') || nameLower.includes('razonamiento')) {
    return sectionTemplates.matematica;
  }
  if (nameLower.includes('ciencia') || nameLower.includes('tecnología') || nameLower.includes('biología') || nameLower.includes('química') || nameLower.includes('física')) {
    return sectionTemplates.ciencia;
  }
  if (nameLower.includes('historia') || nameLower.includes('geografía') || nameLower.includes('personal social') || nameLower.includes('formación ciudadana')) {
    return sectionTemplates.sociales;
  }
  if (nameLower.includes('arte') || nameLower.includes('pintura') || nameLower.includes('teatro') || nameLower.includes('música')) {
    return sectionTemplates.arte;
  }
  if (nameLower.includes('educación física') || nameLower.includes('deporte') || nameLower.includes('fútbol') || nameLower.includes('básquetbol') || nameLower.includes('natación')) {
    return sectionTemplates.educacionFisica;
  }
  if (nameLower.includes('inglés')) {
    return sectionTemplates.ingles;
  }
  if (nameLower.includes('religión') || nameLower.includes('tutoría')) {
    return sectionTemplates.formacion;
  }
  if (nameLower.includes('taller') || nameLower.includes('círculo')) {
    return sectionTemplates.taller;
  }
  
  // Default
  return [
    { name: 'Teoría y Conceptos', desc: 'Fundamentos teóricos de la materia' },
    { name: 'Práctica y Ejercicios', desc: 'Aplicación práctica de los conceptos' },
    { name: 'Evaluación y Proyectos', desc: 'Trabajos integradores y evaluaciones' }
  ];
}

// Función para determinar cuántas secciones por curso (1-3)
function getSectionsCount(courseId) {
  // Talleres (110-118) tienen 3 secciones
  if (courseId >= 110 && courseId <= 118) {
    return 3;
  }
  // Inicial 5 años (9-12) tienen 3 secciones
  if (courseId >= 9 && courseId <= 12) {
    return 3;
  }
  // Cursos de secundaria (55-109) tienen 2-3 aleatorio
  if (courseId >= 55 && courseId <= 109) {
    return Math.random() < 0.7 ? 2 : 3; // 70% 2 secciones, 30% 3
  }
  // Primaria (13-54) tienen 2 secciones
  if (courseId >= 13 && courseId <= 54) {
    return 2;
  }
  // Inicial 3-4 años (1-8) tienen 2 secciones
  if (courseId >= 1 && courseId <= 8) {
    return 2;
  }
  
  return 2; // Default
}

// Nombres de cursos (simulados - en un caso real podrías leerlos de un archivo o BD)
// Aquí necesitarías los nombres reales de los cursos
// Por simplicidad, generamos nombres basados en el ID
function getCourseName(courseId) {
  const courseNames = {
    1: 'Psicomotricidad',
    2: 'Comunicación Integral',
    3: 'Matemática Lúdica',
    4: 'Arte y Creatividad',
    5: 'Psicomotricidad II',
    6: 'Comunicación II',
    7: 'Matemática II',
    8: 'Ciencia y Ambiente',
    9: 'Pre-escritura',
    10: 'Lectoescritura',
    11: 'Matemática III',
    12: 'Personal Social',
    13: 'Comunicación 1°',
    14: 'Matemática 1°',
    15: 'Ciencia y Tecnología 1°',
    16: 'Personal Social 1°',
    17: 'Arte y Cultura 1°',
    18: 'Educación Física 1°',
    19: 'Inglés 1°',
    20: 'Comunicación 2°',
    21: 'Matemática 2°',
    22: 'Ciencia y Tecnología 2°',
    23: 'Personal Social 2°',
    24: 'Arte y Cultura 2°',
    25: 'Educación Física 2°',
    26: 'Inglés 2°',
    27: 'Comunicación 3°',
    28: 'Matemática 3°',
    29: 'Ciencia y Tecnología 3°',
    30: 'Personal Social 3°',
    31: 'Arte y Cultura 3°',
    32: 'Educación Física 3°',
    33: 'Inglés 3°',
    34: 'Comunicación 4°',
    35: 'Matemática 4°',
    36: 'Ciencia y Tecnología 4°',
    37: 'Personal Social 4°',
    38: 'Arte y Cultura 4°',
    39: 'Educación Física 4°',
    40: 'Inglés 4°',
    41: 'Comunicación 5°',
    42: 'Matemática 5°',
    43: 'Ciencia y Tecnología 5°',
    44: 'Personal Social 5°',
    45: 'Arte y Cultura 5°',
    46: 'Educación Física 5°',
    47: 'Inglés 5°',
    48: 'Comunicación 6°',
    49: 'Matemática 6°',
    50: 'Ciencia y Tecnología 6°',
    51: 'Personal Social 6°',
    52: 'Arte y Cultura 6°',
    53: 'Educación Física 6°',
    54: 'Inglés 6°',
    55: 'Comunicación 1° Sec',
    56: 'Matemática 1° Sec',
    57: 'Ciencia y Tecnología 1° Sec',
    58: 'Historia 1° Sec',
    59: 'Geografía 1° Sec',
    60: 'Formación Ciudadana 1° Sec',
    61: 'Inglés 1° Sec',
    62: 'Arte 1° Sec',
    63: 'Educación Física 1° Sec',
    64: 'Religión 1° Sec',
    65: 'Tutoría 1° Sec',
    66: 'Comunicación 2° Sec',
    67: 'Matemática 2° Sec',
    68: 'Ciencia y Tecnología 2° Sec',
    69: 'Historia 2° Sec',
    70: 'Geografía 2° Sec',
    71: 'Formación Ciudadana 2° Sec',
    72: 'Inglés 2° Sec',
    73: 'Arte 2° Sec',
    74: 'Educación Física 2° Sec',
    75: 'Religión 2° Sec',
    76: 'Tutoría 2° Sec',
    77: 'Comunicación 3° Sec',
    78: 'Matemática 3° Sec',
    79: 'Ciencia y Tecnología 3° Sec',
    80: 'Historia 3° Sec',
    81: 'Geografía 3° Sec',
    82: 'Formación Ciudadana 3° Sec',
    83: 'Inglés 3° Sec',
    84: 'Arte 3° Sec',
    85: 'Educación Física 3° Sec',
    86: 'Religión 3° Sec',
    87: 'Tutoría 3° Sec',
    88: 'Comunicación 4° Sec',
    89: 'Matemática 4° Sec',
    90: 'Ciencia y Tecnología 4° Sec',
    91: 'Historia 4° Sec',
    92: 'Geografía 4° Sec',
    93: 'Formación Ciudadana 4° Sec',
    94: 'Inglés 4° Sec',
    95: 'Arte 4° Sec',
    96: 'Educación Física 4° Sec',
    97: 'Religión 4° Sec',
    98: 'Tutoría 4° Sec',
    99: 'Comunicación 5° Sec',
    100: 'Matemática 5° Sec',
    101: 'Ciencia y Tecnología 5° Sec',
    102: 'Historia 5° Sec',
    103: 'Geografía 5° Sec',
    104: 'Formación Ciudadana 5° Sec',
    105: 'Inglés 5° Sec',
    106: 'Arte 5° Sec',
    107: 'Educación Física 5° Sec',
    108: 'Religión 5° Sec',
    109: 'Tutoría 5° Sec',
    110: 'Taller de Pintura',
    111: 'Taller de Teatro',
    112: 'Taller de Música',
    113: 'Taller de Fútbol',
    114: 'Taller de Básquetbol',
    115: 'Taller de Natación',
    116: 'Círculo de Matemática',
    117: 'Círculo de Ciencias',
    118: 'Círculo de Robótica'
  };
  
  return courseNames[courseId] || `Curso ${courseId}`;
}

// Generar secciones para cada curso
for (let courseId = courseStartId; courseId <= courseEndId; courseId++) {
  const courseName = getCourseName(courseId);
  const template = getTemplateForCourse(courseId, courseName);
  const sectionsCount = getSectionsCount(courseId);
  
  // Seleccionar aleatoriamente del template según la cantidad necesaria
  const selectedSections = [];
  const availableTemplates = [...template];
  
  for (let i = 0; i < sectionsCount; i++) {
    if (availableTemplates.length === 0) break;
    
    // Seleccionar un índice aleatorio
    const randomIndex = Math.floor(Math.random() * availableTemplates.length);
    const section = availableTemplates[randomIndex];
    
    // Remover para no repetir (opcional - si quieres permitir repeticiones, comenta esta línea)
    availableTemplates.splice(randomIndex, 1);
    
    // Agregar con un número para diferenciar si hay duplicados
    let sectionName = section.name;
    if (selectedSections.some(s => s.name === sectionName)) {
      sectionName = `${sectionName} ${i + 1}`;
    }
    
    selectedSections.push({
      name: sectionName,
      description: section.desc
    });
  }
  
  // Si no se seleccionaron suficientes, completar con genéricos
  while (selectedSections.length < sectionsCount) {
    selectedSections.push({
      name: `Módulo ${selectedSections.length + 1}`,
      description: `Contenido del módulo ${selectedSections.length + 1}`
    });
  }
  
  // Agregar a la lista de valores
  for (const section of selectedSections) {
    const name = section.name.replace(/'/g, "''");
    const description = section.description.replace(/'/g, "''");
    
    sectionsValues.push(
      `(${sectionId}, '${name}', '${description}', '${imageUrl}', ${courseId})`
    );
    sectionId++;
  }
}

// INSERT sections
text += `INSERT INTO sections 
(id, name, description, image_url, course_id)
VALUES
${sectionsValues.join(',\n')};

\n`;

// migrate:down
text += '-- migrate:down\n\n';
text += `DELETE FROM sections WHERE id <= ${sectionId - 1};\n`;
text += `ALTER TABLE sections AUTO_INCREMENT = 1;\n`;

// Escribir archivo
fs.writeFileSync('inserts_sections.sql', text, { encoding: 'utf-8' });

console.log(`✅ Archivo generado con ${sectionsValues.length} secciones para ${courseEndId - courseStartId + 1} cursos.`);
console.log(`📁 IDs de secciones: 1 - ${sectionId - 1}`);