# Imagen base liviana de Node
FROM node:20-alpine AS base

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el código fuente y compilar
COPY . .
RUN npm run build

# Exponer el puerto de Next.js
EXPOSE 3000

# Comando de inicio
CMD ["npm", "run", "start"]