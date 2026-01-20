// web/services.js
import * as webModel from './models.js';

export function getHomeData() {
  return {
    title: 'Hola Mundo Express',
    message: '¡Bienvenido a mi primera aplicación con Express y EJS!',
    features: webModel.getFeatures(),
    currentDate: new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };
}
