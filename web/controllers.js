// web/controllers.js
import * as webService from './services.js';

export function home(req, res) {
  const data = webService.getHomeData();
  res.render('web/index', {
    title: 'Innova ULima',
  });
}

export function signIn(req, res) {
  console.log('Flash error set:', req.flash('error'));

  res.render('web/sign-in', {
    title: 'Iniciar Sesión',
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
    title: 'Crear cuenta',
    description:
      'Esta es una aplicación de ejemplo creada con Node.js, Express y EJS.'
  });
}

// controllers/authController.js
export async function login(req, res) {
  const { user, password } = req.body;
  const validUser = process.env.DEFAULT_USER || 'admin';
  const validPassword = process.env.DEFAULT_PASSWORD || '123';

  const genericResponse = await webService.loginByUsername(user, password);

  if (genericResponse.success) {
    req.session.user = genericResponse.data.user;
    req.session.roles = genericResponse.data.roles;
    req.session.tokens = genericResponse.data.tokens;

    req.flash('success', '¡Bienvenido! Has iniciado sesión correctamente.');
    
    return req.session.save(() => {
      res.redirect('/');
    });
  }

  // ❌ credenciales incorrectas
  req.flash('error', 'Credenciales incorrectas');
  
  // ✅ Extraer flash messages manualmente antes de renderizar
  const success_messages = req.flash('success');
  const error_messages = req.flash('error');
  const warning_messages = req.flash('warning');
  const info_messages = req.flash('info');
  
  const hasFlashMessages = 
    success_messages.length > 0 ||
    error_messages.length > 0 ||
    warning_messages.length > 0 ||
    info_messages.length > 0;

  res.render('web/sign-in', {
    title: 'Iniciar Sesión',
    user: user, // Mantener el usuario en el formulario
    
    // ✅ Pasar explícitamente los flash messages
    success_messages,
    error_messages,
    warning_messages,
    info_messages,
    hasFlashMessages
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
