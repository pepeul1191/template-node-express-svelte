// configs/bootstrap.js
import path from 'path';
import morgan from 'morgan';
import express from 'express';
import session from 'express-session';
import { fileURLToPath } from 'url';
import engine from 'ejs-mate';
import dotenv from 'dotenv';
import flash from 'connect-flash';
import FileStore from 'session-file-store';

import webRoutes from '../web/routes.js';
import managementRoutes from '../management/configs/routes.js';

import { notFoundHandler, errorHandler, viewFlash, viewEnv, viewSession, viewHelpers, } from './middlewares.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FileStoreSession = FileStore(session);

dotenv.config();

export default function bootstrap(app) {
  // Logs
  app.use(morgan('dev'));

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Configuración de sesiones (ESTO ES IMPORTANTE)
  app.use(session({
    store: new FileStoreSession({
      path: path.join(__dirname, '../../sessions'),
      retries: 0,
      ttl: 60 * 60 * 24 // 1 día
    }),
    secret: process.env.SESSION_SECRET || 'secreto-super-seguro-cambiar-en-produccion',
    resave: false,
    saveUninitialized: false,
    cookie: {
      //secure: process.env.NODE_ENV === 'production',
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true
    }
  }));
  app.use(flash());

  // Middleware para pasar flash messages a las vistas
  app.use(viewFlash);
  // Middleware para pasar .env a las vistas
  app.use(viewEnv);
  // Middleware para pasar session a las vistas
  app.use(viewSession);
  // Middleware para pasar helpers a las vistas
  app.use(viewHelpers);

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
  app.use('/', managementRoutes);

  // Middleware 404 - Solo se ejecuta si no coincidió ninguna ruta anterior
  app.use(notFoundHandler);

  // Middleware de manejo de errores global
  //app.use(errorHandler);
}
