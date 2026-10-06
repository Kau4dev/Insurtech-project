# Estágio 1: Build da aplicação React + Vite
FROM node:22-alpine AS build

WORKDIR /app

# Copia arquivos de dependência e instala pacotes com cache otimizado
COPY package*.json ./
RUN npm ci

# Copia código-fonte e compila para produção
COPY . .
RUN npm run build

# Estágio 2: Servidor Web Nginx de alta performance e leve
FROM nginx:alpine

# Copia os artefatos de build estáticos para o Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copia configuração do Nginx com suporte a rotas SPA (React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]