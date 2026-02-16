# Hola Mundo con Express y EJS

Una aplicación web simple que muestra "Hola Mundo" utilizando Express, EJS como motor de plantillas y una carpeta pública para archivos estáticos.

## Características

- Servidor Express configurado
- Motor de plantillas EJS para vistas dinámicas
- Archivos estáticos servidos desde la carpeta `public`
- Diseño responsivo y moderno
- Páginas adicionales (Acerca de, 404)
- Navegación entre páginas
- Estilos CSS personalizados

## Estructura del proyecto

    SITE_TITLE=Mi sitio web
    ADMIN_EMAIL=admin@ejemplo.com
    DEFAULT_USER=admin
    DEFAULT_PASSWORD=123
    BASE_URL=http://localhost:3000/
    STATIC_URL=http://localhost:3000/
    # DBMATE
    DATABASE_URL=mysql://root:123@localhost:3306/classroom
    # SEQUELIZE
    DB_NAME=classroom
    DB_USER=root
    DB_PASS=123
    # ACCESS SERVICE
    SYSTEM_ID=2
    X_AUTH_ACCESS_SERVICE=dXNlci1zdGlja3lfc2VjcmV0XzEyMzQ1Njc
    URL_ACCESS_SERVICE=http://localhost:5000
    # FILES SERVICE
    URL_FILES_SERVICE=http://localhost:5010
    X_AUTH_FILES_SERVICE=dXNlci1zdGlja3lfc2VjcmV0XzEyMzQ1Njc
    # PATHS
    ACCESS_PATH=/home/pepe/Documentos/node/access
    FILES_PATH=/home/pepe/Documentos/node/files

## Dump y Restore de la DB

