# ---------- Etapa 1: build do React com Vite ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Opcional: fixa a URL da API no build (docker build --build-arg VITE_API_URL=...)
# Se não for passada, a URL é lida em runtime da variável VITE_API_URL do Render.
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---------- Etapa 2: servir os arquivos estáticos com Nginx ----------
FROM nginx:1.27-alpine

# Porta padrão; o Render pode sobrescrever via variável PORT
ENV PORT=80
# Apenas PORT é substituída no template (evita conflito com $uri etc.)
ENV NGINX_ENVSUBST_FILTER=^PORT$

COPY docker/default.conf.template /etc/nginx/templates/default.conf.template
COPY docker/40-env-config.sh /docker-entrypoint.d/40-env-config.sh
RUN chmod +x /docker-entrypoint.d/40-env-config.sh \
    && rm -f /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
