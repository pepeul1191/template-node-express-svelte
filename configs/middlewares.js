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

export const flashSession = (req, res, next) => {
  // 1. Asegurar que session.flash existe
  if (!req.session.flash) {
    req.session.flash = {};
  }
  
  // 2. Método req.flash() para guardar mensajes
  req.flash = (type, message) => {
    // Si es array, unir con los existentes
    if (Array.isArray(message)) {
      if (!req.session.flash[type]) {
        req.session.flash[type] = [];
      }
      req.session.flash[type].push(...message);
    } 
    // Si es string, guardarlo
    else if (typeof message === 'string') {
      if (!req.session.flash[type]) {
        req.session.flash[type] = [];
      }
      req.session.flash[type].push(message);
    }
    // Si no hay mensaje, obtener y limpiar
    else if (message === undefined) {
      const messages = req.session.flash[type] || [];
      req.session.flash[type] = []; // Limpiar inmediatamente
      return messages;
    }
    
    return req.session.flash[type];
  };
  
  // 3. Preparar flash para las vistas ANTES de cada request
  // Esto es clave: copiar los mensajes actuales a res.locals
  const currentFlash = {};
  
  // Copiar todos los mensajes de session a currentFlash
  Object.keys(req.session.flash).forEach(type => {
    if (req.session.flash[type] && req.session.flash[type].length > 0) {
      currentFlash[type] = [...req.session.flash[type]];
    }
  });
  
  // 4. Asignar a res.locals para acceso en vistas
  res.locals.flash = currentFlash;
  
  // 5. Limpiar session.flash después de copiar
  // Los mensajes ya están en res.locals, así que limpiamos session
  Object.keys(req.session.flash).forEach(type => {
    req.session.flash[type] = [];
  });
  
  next();
};

export function cleanFlash(req, res, next) {
  res.on('finish', () => {
    try {
      // Verificar que req y session aún existen
      if (req && req.session) {
        if (req.session.flashForRemoval) {
          req.session.flash = {};
          delete req.session.flashForRemoval;
        }
      }
    } catch (error) {
      // Silenciar el error en producción, log en desarrollo
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error limpiando flash:', error.message);
      }
    }
  });
  next();
}

export function viewFlash(req, res, next) {
  res.locals.success_messages = req.flash('success');
  res.locals.error_messages = req.flash('error');
  res.locals.warning_messages = req.flash('warning');
  res.locals.info_messages = req.flash('info');
  
  // Variable global para saber si hay mensajes
  res.locals.hasFlashMessages = 
    res.locals.success_messages.length > 0 ||
    res.locals.error_messages.length > 0 ||
    res.locals.warning_messages.length > 0 ||
    res.locals.info_messages.length > 0;
    
  next();
}

export function viewEnv(req, res, next) {
  res.locals.BASE_URL = process.env.BASE_URL || '/';
  res.locals.STATIC_URL = process.env.STATIC_URL || '/';
    
  next();
}