// web/controllers.js
import * as webService from './services.js';

export function home(req, res) {
  const data = webService.getHomeData();
  res.render('web/index', data);
}

export function about(req, res) {
  res.render('web/about', {
    title: 'Acerca de',
    description:
      'Esta es una aplicación de ejemplo creada con Node.js, Express y EJS.'
  });
}
