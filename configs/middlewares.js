// configs/middlewares.js
// configs/middlewares.js

/**
 * Middleware para manejar errores 404
 * Si es una petición API (empieza con /api) devuelve JSON
 * Si es una petición web normal devuelve la vista 404
 */
export function notFoundHandler(req, res) {
  // Verificar si es una petición a la API
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: 'Recurso no encontrado',
      data: null,
      error: 'Error 404'
    });
  }
  
  // Para peticiones no-API (y solo GET) renderizar vista 404
  if (req.method === 'GET') {
    return res.status(404).render('404', {
      title: 'Página no encontrada',
      message: 'La página que buscas no existe.'
    });
  }
  
  // Para otros métodos HTTP en rutas no-API
  return res.status(404).json({
    success: false,
    message: 'Recurso no encontrado',
    data: null,
    error: 'Error 404'
  });
}

/**
 * Middleware para manejo de errores generales
 * (Opcional - puedes expandirlo según necesites)
 */
export function errorHandler(err, req, res, next) {
  console.error('Error:', err.stack || err);
  
  // Determinar si es una petición API
  const isApiRequest = req.path.startsWith('/api/');
  
  const statusCode = err.statusCode || 500;
  
  if (isApiRequest) {
    return res.status(statusCode).json({
      success: false,
      message: err.message || 'Error interno del servidor',
      data: null,
      error: `Error ${statusCode}`
    });
  }
  
  // Para peticiones web
  res.status(statusCode).render('error', {
    title: 'Error',
    message: err.message || 'Ha ocurrido un error inesperado.',
    statusCode: statusCode
  });
}

export function requireAuth(req, res, next) {
  // Verificar si es una petición API
  const isApiRequest = req.path.startsWith('/api/');
  
  // Verificar si el usuario tiene sesión activa
  const isAuthenticated = req.session && req.session.user && req.session.user.id;
  
  if (isAuthenticated) {
    // Si está autenticado, continuar
    return next();
  }
  
  // Si NO está autenticado y es la ruta raíz '/'
  if (req.path === '/') {
    // Redireccionar a sign-in
    return res.redirect('/sign-in');
  }
  
  // Si NO está autenticado
  if (isApiRequest || req.method !== 'GET') {
    // Para APIs o métodos no-GET, devolver JSON
    return res.status(401).json({
      success: false,
      message: 'Acceso no autorizado',
      data: null,
      error: 'Error 401: No autenticado'
    });
  }
  
  // Para peticiones GET no-API, mostrar vista 401
  return res.status(401).render('401', {
    title: 'Acceso no autorizado',
    message: 'Debes iniciar sesión para acceder a esta página.',
    statusCode: 401
  });
}

// configs/middlewares.js
/**
 * Middleware para redirigir a usuarios autenticados
 * Si el usuario ya tiene sesión activa, lo redirige a la página principal
 */
export function redirectIfAuthenticated(req, res, next) {
  // Verificar si el usuario tiene sesión activa
  const isAuthenticated = req.session && req.session.user && req.session.user.id;
  
  // Si está autenticado Y está intentando acceder a rutas de autenticación
  const isAuthRoute = [
    '/sign-in',
    '/sign-up',
    '/login',
    '/register',
    '/reset-password'
  ].some(route => req.path === route);
  
  if (isAuthenticated && isAuthRoute) {
    // Redirigir al home si ya está logueado y quiere acceder a rutas de auth
    return res.redirect('/');
  }
  
  // Si no está autenticado o no es una ruta de auth, continuar
  next();
}