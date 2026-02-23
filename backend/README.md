# Backend - RecurseroDigital

Backend del proyecto RecurseroDigital desarrollado en TypeScript con Node.js y Express.

## 🤖 Reportes asistidos por IA

El backend incluye un caso de uso que genera reportes pedagógicos usando **Google Gemini**:

1. Crear un API Key en [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Configurar las variables `GEMINI_API_KEY` y (opcionalmente) `GEMINI_MODEL` en el `.env`. o en las variables de entorno en el docker-compose
3. Consumir el endpoint `POST /api/statistics/student/:studentId/report` enviando opcionalmente `{ "recentDays": 7 }`.

Si no hay estadísticas para el estudiante o falta la API key, el endpoint devuelve un mensaje informativo sin invocar la IA.

## 🚀 Tecnologías

- **Node.js** - Runtime de JavaScript
- **TypeScript** - Superset tipado de JavaScript
- **Express** - Framework web para Node.js
- **PostgreSQL** - Base de datos relacional
- **node-pg-migrate** - Sistema de migraciones para PostgreSQL
- **Jest** - Framework de testing

## 📁 Estructura del Proyecto

```
src/
├── config/           # Configuración de la aplicación
│   ├── app.ts       # Configuración de Express
│   └── server.ts    # Punto de entrada del servidor
│
├── core/            # Lógica de negocio
│   ├── models/      # Modelos de datos
│   ├── usecases/    # Casos de uso
│   └── infrastructure/ # Interfaces de infraestructura
│
├── infrastructure/  # Capa de insfra para conectarse con DB, APIS, etc.
│   
└── delivery/        # Capa de presentación
    ├── controllers/ # Controladores
    └── routes/      # Rutas de la API
```

## 🛠️ Comandos Disponibles

### Desarrollo
```bash
# Ejecutar en modo desarrollo (con recarga automática)
npm run dev
```

### Compilación
```bash
# Compilar TypeScript a JavaScript
npm run build
```

### Producción
```bash
# Ejecutar versión compilada
npm start
```

### Testing
```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests con cobertura
npm run test:coverage
```

### Migraciones de Base de Datos
```bash
# Aplicar todas las migraciones pendientes
npm run migrate:up

# Revertir la última migración
npm run migrate:down

# Crear una nueva migración
npm run migrate:create nombre-de-la-migracion

# Ver estado de las migraciones
npm run migrate
```

### Verificación de Tipos
```bash
# Verificar tipos sin compilar
npx tsc --noEmit
```

## 🚦 Flujo de Trabajo

1. **Desarrollo diario:** Usa `npm run dev` para desarrollo con recarga automática
2. **Antes de commit:** Ejecuta `npm run build` para verificar que todo compila
3. **Para producción:** Usa `npm start` (después de hacer `npm run build`)

## 📦 Instalación

```bash
# Instalar dependencias
npm install
```

## 🔧 Configuración

El proyecto está configurado con:
- **TypeScript** con configuración estricta
- **ES2020** como target
- **CommonJS** como sistema de módulos
- **Source maps** habilitados para debugging
- **Paths mapping** configurado (`@/*` apunta a `src/*`)

## 📝 Scripts de Package.json

### Aplicación
- `dev`: Ejecuta la aplicación en modo desarrollo con nodemon
- `build`: Compila TypeScript a JavaScript en la carpeta `dist/`
- `start`: Ejecuta la versión compilada de JavaScript

### Testing
- `test`: Ejecuta los tests con Jest
- `test:coverage`: Ejecuta tests con reporte de cobertura

### Migraciones
- `migrate`: Muestra el estado de las migraciones
- `migrate:up`: Aplica todas las migraciones pendientes
- `migrate:down`: Revierte la última migración
- `migrate:create`: Crea un nuevo archivo de migración

## 🏗️ Arquitectura

El proyecto sigue una arquitectura limpia (Clean Architecture) con separación de responsabilidades:

- **Core**: Contiene la lógica de negocio pura
- **Infrastructure**: Interfaces para servicios externos
- **Delivery**: Capa de presentación (controladores y rutas)
- **Config**: Configuración de la aplicación

## 🗄️ Base de Datos y Migraciones

### Sistema de Migraciones

El proyecto utiliza **node-pg-migrate** para gestionar cambios en la base de datos de forma versionada y controlada.

#### Estructura de Migraciones

```
migrations/
├── 1760231338955_create-users-table.js
├── 1760231339955_create-students-table.js
├── 1760231340955_create-teachers-table.js
├── 1760231341955_create-admins-table.js
├── 1760231342955_create-courses-table.js
├── 1760231343955_add-foreign-keys.js
├── 1760231344955_create-games-tables.js
├── 1760231345955_seed-games.js
├── 1760285490000_create-statistics-table.js
├── 1760669818385_update-games-data.js
├── 1763481836885_seed-admin-user.js
├── 1768124100000_remove-session-columns.js
├── 1768124800000_add-calculos-game.js
├── 1768125400000_add-escala-game.js
├── 1768126500000_update-game-images.js
├── 1768127000000_create-games-levels-table.js
├── 1768127100000_seed-games-levels.js
├── 1768133200000_update-ordenamiento-pedagogical-ranges.js
└── 1768134000000_add-enable-column-students-teachers.js
```

#### Cómo Funciona

1. **Migraciones automáticas al inicio**: Cuando la aplicación se inicia, ejecuta automáticamente todas las migraciones pendientes.

2. **Control de versiones**: Cada migración tiene un timestamp único y se registra en la tabla `pgmigrations` de PostgreSQL.

3. **Rollback seguro**: Todas las migraciones incluyen métodos `up()` y `down()` para aplicar y revertir cambios.

#### Crear una Nueva Migración

```bash
# Generar archivo de migración
npm run migrate:create agregar-columna-edad-a-students

# Esto creará: migrations/[timestamp]_agregar-columna-edad-a-students.js
```

Ejemplo de estructura de migración:

```javascript
/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // Cambios a aplicar
  pgm.addColumn('students', {
    edad: {
      type: 'integer',
      notNull: false,
    },
  });
};

exports.down = (pgm) => {
  // Cambios a revertir
  pgm.dropColumn('students', 'edad');
};
```

#### Mejores Prácticas

1. **Nunca editar migraciones ya ejecutadas**: Crea una nueva migración para cambios adicionales.
2. **Usar transacciones**: node-pg-migrate las maneja automáticamente.
3. **Probar rollbacks**: Siempre verifica que `down()` funcione correctamente.
4. **Nombres descriptivos**: Usa nombres claros para las migraciones.
5. **Una responsabilidad**: Cada migración debe hacer una cosa específica.

#### Esquema de Base de Datos

**Tabla `users`** (Tabla base para autenticación)
- `id` VARCHAR(255) PK
- `username` VARCHAR(255) UNIQUE NOT NULL
- `password_hash` VARCHAR(255) NOT NULL
- `role` VARCHAR(50) NOT NULL (STUDENT, TEACHER, ADMIN)
- `created_at` TIMESTAMP NOT NULL
- `updated_at` TIMESTAMP NOT NULL

**Tabla `students`** (con FK a `users`)
- `id` VARCHAR(255) PK
- `user_id` VARCHAR(255) NOT NULL → FK a `users(id)`
- `name` VARCHAR(255) NOT NULL
- `lastname` VARCHAR(255) NOT NULL
- `dni` VARCHAR(20) UNIQUE NOT NULL
- `course_id` VARCHAR(255) → FK a `courses(id)` (nullable)
- `enable` BOOLEAN NOT NULL DEFAULT true
- `created_at` TIMESTAMP NOT NULL
- `updated_at` TIMESTAMP NOT NULL

**Tabla `teachers`** (con FK a `users`)
- `id` VARCHAR(255) PK
- `user_id` VARCHAR(255) NOT NULL → FK a `users(id)`
- `name` VARCHAR(255) NOT NULL
- `surname` VARCHAR(255) NOT NULL
- `email` VARCHAR(255) UNIQUE NOT NULL
- `enable` BOOLEAN NOT NULL DEFAULT true
- `created_at` TIMESTAMP NOT NULL
- `updated_at` TIMESTAMP NOT NULL

**Tabla `admins`** (con FK a `users`)
- `id` VARCHAR(255) PK
- `user_id` VARCHAR(255) NOT NULL → FK a `users(id)`
- `nivel_acceso` VARCHAR(50)
- `permisos` TEXT
- `created_at` TIMESTAMP NOT NULL
- `updated_at` TIMESTAMP NOT NULL

**Tabla `courses`** (con FK a `teachers`)
- `id` VARCHAR(255) PK
- `name` VARCHAR(255) UNIQUE NOT NULL
- `teacher_id` VARCHAR(255) → FK a `teachers(id)` (nullable)
- `created_at` TIMESTAMP NOT NULL
- `updated_at` TIMESTAMP NOT NULL

**Tabla `games`**
- `id` VARCHAR(255) PK
- `name` VARCHAR(255) UNIQUE NOT NULL
- `description` TEXT
- `image_url` VARCHAR(500)
- `route` VARCHAR(255) NOT NULL
- `difficulty_level` INTEGER DEFAULT 1
- `is_active` BOOLEAN NOT NULL DEFAULT true
- `created_at` TIMESTAMP NOT NULL
- `updated_at` TIMESTAMP NOT NULL

**Tabla `courses_games`** (Tabla de relación muchos a muchos)
- `id` VARCHAR(255) PK
- `course_id` VARCHAR(255) NOT NULL → FK a `courses(id)`
- `game_id` VARCHAR(255) NOT NULL → FK a `games(id)`
- `is_enabled` BOOLEAN NOT NULL DEFAULT true
- `order_index` INTEGER DEFAULT 0
- `created_at` TIMESTAMP NOT NULL
- `updated_at` TIMESTAMP NOT NULL
- UNIQUE(`course_id`, `game_id`)

**Tabla `games_levels`** (Configuración de niveles por juego)
- `id` VARCHAR(255) PK
- `game_id` VARCHAR(255) NOT NULL → FK a `games(id)`
- `level` INTEGER NOT NULL
- `name` VARCHAR(255) NOT NULL
- `description` TEXT
- `difficulty` VARCHAR(50)
- `activities_count` INTEGER NOT NULL DEFAULT 5
- `config` JSONB NOT NULL DEFAULT '{}'
- `is_active` BOOLEAN NOT NULL DEFAULT true
- `created_at` TIMESTAMP NOT NULL
- `updated_at` TIMESTAMP NOT NULL
- UNIQUE(`game_id`, `level`)

**Tabla `student_statistics`** (Estadísticas de juego de estudiantes)
- `id` VARCHAR(255) PK
- `student_id` VARCHAR(255) NOT NULL → FK a `students(id)` ON DELETE CASCADE
- `game_id` VARCHAR(255) NOT NULL → FK a `games(id)` ON DELETE CASCADE
- `level` INTEGER NOT NULL DEFAULT 1
- `activity` INTEGER NOT NULL DEFAULT 1
- `points` INTEGER NOT NULL DEFAULT 0
- `total_points` INTEGER NOT NULL DEFAULT 0 (acumulado del juego)
- `attempts` INTEGER NOT NULL DEFAULT 0
- `correct_answers` INTEGER DEFAULT 0
- `total_questions` INTEGER DEFAULT 0
- `completion_time` INTEGER (en segundos)
- `is_completed` BOOLEAN NOT NULL DEFAULT false
- `max_unlocked_level` INTEGER NOT NULL DEFAULT 1
- `created_at` TIMESTAMP NOT NULL
- `updated_at` TIMESTAMP NOT NULL
- UNIQUE(`student_id`, `game_id`, `level`, `activity`)
- Índices: `student_id`, `game_id`, (`student_id`, `game_id`), (`student_id`, `game_id`, `level`), `created_at`

#### Datos por Defecto (Seeds)

La aplicación crea automáticamente un usuario administrador al ejecutar las migraciones:

- **Admin**: `admin`

Este es el único usuario que se crea automáticamente. Todos los demás usuarios (estudiantes, profesores, etc.) deben crearse a través de la aplicación.

##### Iniciar Sesión como Administrador

La respuesta incluirá un token JWT que puedes usar para autenticarte en los endpoints protegidos.

### Limpiar Base de Datos

Si necesitas empezar desde cero:

```bash
# Detener contenedores y eliminar volúmenes
docker-compose down -v

# Levantar de nuevo (ejecutará migraciones automáticamente)
docker-compose up -d
```

> **Nota**: Para información sobre despliegue en producción usando Docker Compose, consulta la sección [🚀 Despliegue en Producción](../README.md#-despliegue-en-producción) en el README principal del proyecto.

## 🔍 Verificación de Tipos

TypeScript está configurado con reglas estrictas para garantizar la calidad del código:
- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`
- `strictFunctionTypes: true`
