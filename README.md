# RecurseroDigital
📘 Recursero Digital – Matemática Interactiva para Primaria

Recursero Digital es una plataforma tipo campus virtual que reúne en un único entorno diversas actividades interactivas de matemática, diseñadas para escuelas primarias.

Actualmente, muchos recursos digitales se encuentran dispersos en plataformas como Genially, Wordwall o Matific, dificultando su acceso y limitando la posibilidad de articularlos pedagógicamente. Este proyecto busca centralizar esas propuestas y organizar actividades alineadas con el Diseño Curricular vigente, inicialmente orientadas a 3° grado

---
## 🎯 Objetivos

Facilitar el acceso de estudiantes y docentes a actividades matemáticas interactivas en un mismo espacio.

Organizar las actividades según secuencias de enseñanza, favoreciendo la ejercitación, la exploración y el desafío cognitivo.

Incorporar un sistema de seguimiento individual que registre avances, dificultades y tiempos de resolución.

Ofrecer a las y los docentes reportes detallados sobre el desempeño del grupo y de cada estudiante, permitiendo ajustar la enseñanza en función de la información recolectada.

---
## 🚀 Tecnologías utilizadas

- **Backend**
  - 🟢 Typescript  
  - ⚡ Express.js  
  - 🔒 Seguridad: bcrypt.js y JWT  
  - 🗄️ Base de datos: PostgreSql  

- **Frontend**
  - ⚛️ React.js  
  - 🧭 React Router DOM (gestión de rutas)  
  - 🔗 Axios (peticiones HTTP)  

- **Containerización**
  - 🐳 Docker & Docker Compose
  - 📦 Servicios separados (Backend y Frontend)
  - 🌐 Red personalizada para comunicación entre servicios

---
## 🐳 Instalación con Docker (Recomendado)

### Requisitos
- Docker Desktop instalado
- Docker Compose

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd RecurseroDigital
   ```
   
2. **Instalar dependencias**
   ```bash
   cd backend
   npm install
   cd ..
   cd front-end/recursero-digital
   npm install
   cd ..
   ```
   
3. **build del proyecto**
   ```bash
   npm run build
   ```
   
4. **Buildear y Ejecutar con Docker Compose**
   ```bash
   docker-compose up --build
   ```

5. **Acceder a la aplicación**
   - **Frontend**: http://localhost:5173
   - **Backend**: http://localhost:3000

### Comandos útiles de Docker

```bash
# Ejecutar en segundo plano
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Reconstruir un servicio específico
docker-compose up --build backend
```

Para más detalles sobre la configuración de Docker, consulta el archivo [DOCKER.md](./DOCKER.md).

---

## 🚀 Despliegue en Producción

### Usar Docker Compose para Producción en un Servidor

El proyecto incluye un archivo `docker-compose.prod.yml` configurado específicamente para entornos de producción. Este archivo está optimizado para despliegues en servidores.

#### Configuración Inicial

1. **Crear archivo de variables de entorno**:

```bash
# En la raíz del proyecto, crear un archivo .env.prod
cat > .env.prod << EOF
NODE_ENV=production
PORT=3000
DB_HOST=postgres
DB_PORT=5432
DB_NAME=recurseroDigitalDB
DB_USER=tu_usuario_db_seguro
DB_PASSWORD=tu_password_super_seguro
JWT_SECRET=tu-jwt-secret-muy-seguro-para-produccion
GEMINI_API_KEY=tu-api-key-de-gemini
GEMINI_MODEL=gemini-2.5-flash
POSTGRES_DB=recurseroDigitalDB
POSTGRES_USER=tu_usuario_db_seguro
POSTGRES_PASSWORD=tu_password_super_seguro
POSTGRES_ROOT_PASSWORD=password_root_seguro
EOF
```

2. **Asegurar permisos del archivo**:

```bash
chmod 600 .env.prod
```

#### Despliegue en el Servidor

1. **Clonar el repositorio en el servidor**:

```bash
git clone <url-del-repositorio>
cd RecurseroDigital
```

2. **Levantar los servicios con docker-compose-prod.yml**:

```bash
# Construir y levantar todos los servicios en producción
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# Ver logs en tiempo real
docker-compose -f docker-compose.prod.yml logs -f

# Ver estado de los contenedores
docker-compose -f docker-compose.prod.yml ps
```

#### Comandos Útiles para Producción

```bash
# Detener todos los servicios
docker-compose -f docker-compose.prod.yml down

# Detener y eliminar volúmenes (¡CUIDADO! Esto elimina los datos)
docker-compose -f docker-compose.prod.yml down -v

# Reiniciar un servicio específico
docker-compose -f docker-compose.prod.yml restart backend

# Ver logs de un servicio específico
docker-compose -f docker-compose.prod.yml logs -f backend

# Reconstruir solo un servicio después de cambios
docker-compose -f docker-compose.prod.yml up -d --build backend
```

#### Consideraciones de Seguridad para Producción

1. **Variables de entorno**: Nunca commitees el archivo `.env.prod` al repositorio. Úsalo solo en el servidor.

2. **JWT Secret**: Usa un secret JWT fuerte y único para producción. Genera uno con:
   ```bash
   openssl rand -base64 32
   ```

3. **Contraseñas de base de datos**: Usa contraseñas fuertes y diferentes para producción.

4. **GEMINI_API_KEY**: Mantén la API key de Gemini segura y no la expongas públicamente.

5. **SSL/TLS**: En producción, considera usar un reverse proxy (nginx, traefik) con certificados SSL para HTTPS.

6. **Backups**: Configura backups regulares de la base de datos PostgreSQL:
   ```bash
   # Ejemplo de backup manual
   docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U tu_usuario_db_seguro recurseroDigitalDB > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

7. **Firewall**: Asegúrate de que solo los puertos necesarios estén expuestos. En producción, considera exponer solo:
   - Puerto del frontend (5174)
   - Puerto del backend (3000) solo si es necesario, o mejor aún, úsalo solo internamente

8. **Monitoreo**: Considera implementar herramientas de monitoreo y logging para producción (ej: Prometheus, Grafana, ELK Stack).

#### Actualización de la Aplicación

Para actualizar la aplicación en producción:

```bash
# 1. Hacer pull de los últimos cambios
git pull origin main

# 2. Reconstruir y reiniciar los servicios
docker-compose -f docker-compose.prod.yml up -d --build

# 3. Verificar que todo esté funcionando
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f backend
```

Las migraciones de base de datos se ejecutarán automáticamente al iniciar el backend.

---

