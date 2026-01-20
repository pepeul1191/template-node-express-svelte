// configs/bootstrap.js
import path from 'path';
import morgan from 'morgan';
import express from 'express';
import { fileURLToPath } from 'url';
import engine from 'ejs-mate';
import dotenv from 'dotenv';

import webRoutes from '../web/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

export default function bootstrap(app) {
  // Logs
  app.use(morgan('dev'));

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Vistas
  app.engine('ejs', engine);
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '../views'));

  // Archivos estáticos
  app.use(express.static(path.join(__dirname, '../public')));

  // Variables globales
  app.locals.siteTitle = process.env.SITE_TITLE || 'Mi sitio web';
  app.locals.adminEmail = process.env.ADMIN_EMAIL || 'admin@ejemplo.com';

  // Rutas Web
  app.use('/', webRoutes);

  // 404
  app.use((req, res) => {
    res.status(404).render('404', {
      title: 'Página no encontrada',
      message: 'La página que buscas no existe.'
    });
  });
}
