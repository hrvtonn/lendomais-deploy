#!/bin/sh
# Gera /env-config.js com as variáveis de ambiente do contêiner (Render),
# permitindo trocar a URL da API sem rebuildar a imagem.
set -e
TARGET=/usr/share/nginx/html/env-config.js
API_URL="${VITE_API_URL:-}"
# escapa aspas e barras invertidas
API_URL=$(printf '%s' "$API_URL" | sed 's/\\/\\\\/g; s/"/\\"/g')
printf 'window.__ENV__ = { VITE_API_URL: "%s" };\n' "$API_URL" > "$TARGET"
echo "env-config.js gerado (VITE_API_URL=${VITE_API_URL:-<vazio>})"
