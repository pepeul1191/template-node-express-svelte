// web/services.js
import axios from 'axios';

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

const http = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

/* ================= Helpers ================= */

const buildResponse = ({ success = true, data = null, message = '' }) => ({
  success,
  data,
  message
});

const handleError = (message, details = null) => ({
  success: false,
  message,
  error: details
});

/* ================= Public ================= */

export const loginByUsername = async (username, password) => {
  if (!username || !password) {
    return handleError('username and password are required');
  }

  const accessApiResponse = await makeAuthAccessRequest(username, password);
  if (!accessApiResponse.success) return accessApiResponse;

  const filesApiResponse = await makeAuthFilesRequest(
    accessApiResponse.data.user, accessApiResponse.data.roles
  );

  console.log(filesApiResponse)
  if (!filesApiResponse.success){
    return {
      success: accessApiResponse.success,
      message: accessApiResponse.message,
      data: {
        user: accessApiResponse.data.user,
        roles: accessApiResponse.data.roles,
        tokens: {
          access: accessApiResponse.data.jwt,
          file: null,
        }
      }
    }
  }else{
    return {
      success: accessApiResponse.success,
      message: accessApiResponse.message,
      data:{
        user: accessApiResponse.data.user,
        roles: accessApiResponse.data.roles,
        tokens: {
          access: accessApiResponse.data.jwt,
          file: filesApiResponse.data
        }
      }
    }
  } 
};

/* ================= Private ================= */

const makeAuthFilesRequest = async (user, roles) => {
  const url = process.env.URL_FILES_SERVICE;
  const xAuthHeader = process.env.X_AUTH_FILES_SERVICE;

  if (!url || !xAuthHeader) {
    return handleError('files service is not available (missing configuration)');
  }

  try {
    const response = await http.post(
      `${url}/api/v1/sign-in`,
      {user,roles},
      {
        headers: {
          'X-Auth-Trigger': xAuthHeader
        }
      }
    );

    console.log('Files service response:', response.data);

    return response.data;

  } catch (error) {
    if (error.response) {
      if (error.response.status === 403) {
        return {
          success: false,
          message: error.response.data?.message,
          error: 'FORBIDDEN'
        };
      }

      return handleError(
        error.response.data?.message || 'Files service error',
        error.response.data
      );
    }

    return handleError('could not connect to the files service', error.message);
  }
};

const makeAuthAccessRequest = async (username, password) => {
  const url = process.env.URL_ACCESS_SERVICE;
  const xAuthHeader = process.env.X_AUTH_ACCESS_SERVICE;
  const systemIdStr = process.env.SYSTEM_ID;

  if (!url || !xAuthHeader || !systemIdStr) {
    return handleError('authentication service is not available (missing configuration)');
  }

  const systemId = Number(systemIdStr);
  if (Number.isNaN(systemId)) {
    return handleError('invalid system configuration');
  }

  try {
    const response = await http.post(
      `${url}/api/v1/users/sign-in/by-username`,
      {
        username,
        password,
        system_id: systemId
      },
      {
        headers: {
          'X-Auth-Trigger': xAuthHeader
        }
      }
    );

    console.log('Authentication service response:', response.data);

    return response.data;

  } catch (error) {
    console.error('Error during authentication:', error.message);

    if (error.response) {
      const msg =
        error.response.data?.message ||
        `Error in authentication service (Code: ${error.response.status})`;

      return handleError(msg, error.response.data);
    }

    return handleError('could not connect to the authentication service', error.message);
  }
};

/* ================= Health ================= */

export const healthCheck = async () => {
  const url = process.env.URL_ACCESS_SERVICE;

  if (!url) {
    return handleError('Authentication service URL not configured');
  }

  try {
    const response = await http.get(`${url}/health`, { timeout: 5000 });

    if (response.status === 200) {
      return buildResponse({ message: 'Authentication service available' });
    }

    return handleError('Authentication service not available');

  } catch (error) {
    return handleError('Error checking authentication service', error.message);
  }
};

