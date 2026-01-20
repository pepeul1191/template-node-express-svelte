// server.js
import express from 'express';
import path from 'path';
import morgan from 'morgan';
import { fileURLToPath } from 'url';

// Reemplazo de __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware de logs
app.use(morgan('dev'));

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal
app.get('/', (req, res) => {
  const data = {
    title: 'Hola Mundo Express',
    message: '¡Bienvenido a mi primera aplicación con Express y EJS!',
    features: [
      'Servidor Express',
      'Motor de plantillas EJS',
      'Archivos estáticos en carpeta public',
      'Diseño responsivo'
    ],
    currentDate: new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };

  res.render('web/index', data);
});

// Ruta adicional
app.get('/about', (req, res) => {
  res.render('web/about', {
    title: 'Acerca de',
    description:
      'Esta es una aplicación de ejemplo creada con Node.js, Express y EJS.'
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).render('web/404', {
    title: 'Página no encontrada',
    message: 'La página que buscas no existe.'
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
