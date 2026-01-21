// configs/bootstrap.js
import path from 'path';
import morgan from 'morgan';
import express from 'express';
import { fileURLToPath } from 'url';
import engine from 'ejs-mate';
import dotenv from 'dotenv';

import webRoutes from '../web/routes.js';
import { notFoundHandler, errorHandler } from './middlewares.js';

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

  // Middleware 404 - Solo se ejecuta si no coincidió ninguna ruta anterior
  app.use(notFoundHandler);

  // Middleware de manejo de errores global
  app.use(errorHandler);
}
