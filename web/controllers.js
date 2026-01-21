// web/controllers.js
import * as webService from './services.js';

export function home(req, res) {
  const data = webService.getHomeData();
  res.render('web/index', data);
}

export function signIn(req, res) {
  res.render('web/sign-in', {
    title: 'Bienvenido',
    description:
      'Esta es una aplicación de ejemplo creada con Node.js, Express y EJS.'
  });
}

export function resetPassword(req, res) {
  res.render('web/reset-password', {
    title: 'Recuperar contraseña',
    description:
      'Esta es una aplicación de ejemplo creada con Node.js, Express y EJS.'
  });
}

export function signUp(req, res) {
  res.render('web/sign-up', {
    title: 'Recuperar contraseña',
    description:
      'Esta es una aplicación de ejemplo creada con Node.js, Express y EJS.'
  });
}
