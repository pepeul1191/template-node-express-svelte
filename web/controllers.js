// web/controllers.js
import * as webService from './services.js';

export function home(req, res) {
  const data = webService.getHomeData();
  res.render('web/index', data);
}

export function signIn(req, res) {
  res.render('web/sign-in', {
    title: 'Iniciar Sesión',
    error: req.query.error || null,
    success: req.query.success || null,
    oldUser: req.query.user || ''
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

export function login(req, res) {
  const { user, password } = req.body;
  
  // Credenciales desde .env
  const validUser = process.env.DEFAULT_USER || 'admin';
  const validPassword = process.env.DEFAULT_PASSWORD || '123';
  
  // Validar credenciales
  if (user === validUser && password === validPassword) {
    // Crear sesión
    req.session.user = {
      id: 1,
      username: user,
      email: `${user}@ejemplo.com`,
      role: 'admin'
    };
    
    // Redirigir al home
    return res.redirect('/');
  }
  
  // Si las credenciales son incorrectas, mostrar error
  res.render('web/sign-in', {
    title: 'Iniciar Sesión',
    error: 'Usuario o contraseña incorrectos',
    oldUser: user,
    success: null
  });
}

export function logout(req, res) {
  req.session.destroy(err => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.redirect('/');
    }

    // Limpia la cookie de sesión (opcional pero recomendado)
    res.clearCookie('connect.sid');

    // Redirige al login
    res.redirect('/sign-in');
  });
}
