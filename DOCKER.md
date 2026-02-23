# Docker Setup - Recursero Digital

Este proyecto incluye configuración de Docker para ejecutar tanto el backend como el frontend como servicios separados.

## Estructura de Servicios

- **Backend**: Puerto 3000 (interno y externo)
- **Frontend**: Puerto 5173 (interno y externo)

## Comandos Disponibles

### Construir y ejecutar todos los servicios
```bash
docker-compose up --build
```

### Ejecutar en segundo plano
```bash
docker-compose up -d --build
```

### Ver logs de los servicios
```bash
docker-compose logs -f
```

### Detener todos los servicios
```bash
docker-compose down
```

### Reconstruir solo un servicio específico
```bash
docker-compose up --build backend
docker-compose up --build frontend
```

## Acceso a los Servicios

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

## Notas Importantes

- Los puertos internos y externos son idénticos para ambos servicios
- Los servicios están conectados a través de una red Docker personalizada
- Los volúmenes se configuran automáticamente para node_modules
- Los servicios se reinician automáticamente a menos que se detengan manualmente

