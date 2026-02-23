# Dockerfile para el frontend
FROM node:20-slim

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias primero (para aprovechar cache de Docker)
COPY package*.json ./

# Instalar dependencias con cache optimizado
RUN npm install --silent

# Copiar código fuente
COPY . .

# Limpiar e instalar dependencias para resolver problemas con dependencias nativas
RUN rm -rf node_modules package-lock.json && npm install --silent

# Construir la aplicación con variables de entorno
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Exponer puerto
EXPOSE 5173

# Comando para servir la aplicación construida
CMD ["npx", "serve", "-s", "dist", "-l", "tcp://0.0.0.0:5173"]

