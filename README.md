# 📚 Operação Nuvem Literária — LendoMais

Plataforma de catálogo de livros da startup **LendoMais**, levada do `localhost` para a nuvem
usando **Docker**, **Docker Hub** e **Render**.

- **Backend:** API REST em Node.js/Express com *Service Pattern* (Controller → Service → Repository) e PostgreSQL
- **Frontend:** React + Vite, servido por Nginx em produção
- **Infra:** cada aplicação tem seu `Dockerfile`, a imagem é publicada no Docker Hub e o Render executa essa imagem

---

## 🔗 Entregáveis

| Item | Link |
|---|---|
| Docker Hub — Backend | https://hub.docker.com/r/hrvton/lendomais-backend |
| Docker Hub — Frontend | https://hub.docker.com/r/hrvton/lendomais-frontend |
| Frontend no Render | https://lendomais-frontend-vdeo.onrender.com |
| API no Render (URL base) | https://lendomais-backend.onrender.com |
| Repositório no GitHub | https://github.com/hrvtonn/lendomais-deploy |

---

## 🏗️ Arquitetura

```
 Navegador ──HTTPS──► Frontend (Nginx + React)     imagem: hrvton/lendomais-frontend
     │                  └─ /env-config.js  ◄── VITE_API_URL (definida no Render)
     │
     └──────HTTPS──► Backend (Node.js/Express)     imagem: hrvton/lendomais-backend
                        └─ DATABASE_URL ──► PostgreSQL (Render)
```

## 🛠️ Tecnologias

| Camada | Tecnologias |
|---|---|
| Frontend | React 18, Vite 5, Axios, Nginx 1.27 |
| Backend | Node.js 20, Express 4, pg, cors, dotenv |
| Banco | PostgreSQL 16 |
| Infra | Docker, Docker Compose, Docker Hub, Render |

## 📁 Estrutura

```
.
├── backend/
│   ├── src/
│   │   ├── config/database.js       # conexão Postgres (DATABASE_URL ou DB_*)
│   │   ├── controllers/             # camada HTTP
│   │   ├── services/                # regras de negócio
│   │   ├── repositories/            # acesso a dados (SQL)
│   │   ├── routes/                  # rotas /api/books
│   │   ├── app.js                   # Express, CORS, /health
│   │   └── server.js                # sobe o servidor na porta PORT
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/                         # componentes React e serviço da API
│   ├── public/env-config.js         # placeholder (sobrescrito no contêiner)
│   ├── docker/
│   │   ├── default.conf.template    # Nginx: porta via PORT + fallback da SPA
│   │   └── 40-env-config.sh         # gera env-config.js com VITE_API_URL
│   ├── Dockerfile                   # multi-stage: build Node → Nginx
│   └── .env.example
├── docker-compose.yml               # ambiente local completo
└── README.md
```

---

## 🚀 Como rodar localmente (Docker)

**Pré-requisito:** Docker com Docker Compose instalado.

```bash
git clone <url-do-repositorio>
cd <pasta-do-projeto>

docker compose up --build -d
```

| Serviço | URL |
|---|---|
| Frontend | http://localhost:8080 |
| API | http://localhost:3000/api/books |
| Health check | http://localhost:3000/health |

Comandos úteis:

```bash
docker compose ps                 # status dos contêineres
docker compose logs -f backend    # logs da API
docker compose down               # parar (mantém os dados)
docker compose down -v            # parar e apagar o banco
```

### Rodar sem Docker (opcional)

Requer Node.js 20+ e um PostgreSQL rodando localmente.

```bash
# backend
cd backend && cp .env.example .env && npm install && npm run dev

# frontend (em outro terminal)
cd frontend && npm install && npm run dev   # http://localhost:5173
```

---

## ⚙️ Variáveis de ambiente

### Backend

| Variável | Descrição | Padrão |
|---|---|---|
| `PORT` | Porta HTTP (o Render injeta automaticamente) | `3000` na imagem |
| `DATABASE_URL` | URL de conexão do PostgreSQL | — |
| `DB_SSL` | Usa SSL na conexão (`true`/`false`) | `true` se houver `DATABASE_URL` |
| `CORS_ORIGIN` | Origens permitidas, separadas por vírgula | todas |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Alternativa à `DATABASE_URL` para uso local | `localhost` / `5432` / `postgres` / `postgres` / `books_db` |

### Frontend

| Variável | Descrição | Padrão |
|---|---|---|
| `VITE_API_URL` | URL pública da API (com ou sem `/api`), lida **ao iniciar o contêiner** | `http://localhost:3001` |
| `PORT` | Porta em que o Nginx escuta | `80` |

> **Por que em runtime?** O Vite embute as variáveis `VITE_*` no JavaScript durante o build.
> Como a imagem é gerada uma única vez e publicada no Docker Hub, o contêiner gera um
> `env-config.js` ao iniciar, a partir de `VITE_API_URL`. Assim a mesma imagem funciona em
> qualquer ambiente, bastando configurar a variável no Render.

---

## 🐳 Build e publicação no Docker Hub

```bash
docker login

docker build -t hrvton/lendomais-backend:latest ./backend
docker build -t hrvton/lendomais-frontend:latest ./frontend

docker push hrvton/lendomais-backend:latest
docker push hrvton/lendomais-frontend:latest
```

> Execute os comandos na raiz do projeto (onde ficam `backend/` e `frontend/`).
> Em Mac com Apple Silicon, adicione `--platform linux/amd64` ao `docker build`.

## ☁️ Deploy no Render

1. **Banco de dados:** *New → PostgreSQL* (plano Free). Copie a **Internal Database URL**.
2. **Backend:** *New → Web Service → Existing Image* → `docker.io/hrvton/lendomais-backend:latest`
   - Variáveis: `DATABASE_URL` = URL do passo 1. Opcional: `CORS_ORIGIN` = URL do frontend.
   - Use a mesma região do banco.
   - Teste em `https://<backend>.onrender.com/health` → `{"status":"ok"}`.
3. **Frontend:** *New → Web Service → Existing Image* → `docker.io/hrvton/lendomais-frontend:latest`
   - Variável: `VITE_API_URL` = `https://<backend>.onrender.com`.
4. Depois de um novo `docker push`, use **Manual Deploy → Deploy latest reference** no Render.

> No plano Free, os serviços "dormem" após um tempo sem acesso; a primeira requisição pode
> levar cerca de 1 minuto.

---

## 📡 Endpoints da API

Base: `/api/books`

| Método | Rota | Descrição | Status |
|---|---|---|---|
| GET | `/health` | Health check | 200 |
| GET | `/api/books` | Lista todos os livros | 200 |
| GET | `/api/books/:id` | Busca um livro | 200 / 404 |
| POST | `/api/books` | Cria um livro | 201 / 400 |
| PUT | `/api/books/:id` | Atualiza um livro | 200 / 400 / 404 |
| DELETE | `/api/books/:id` | Remove um livro | 204 / 404 |

Exemplo de corpo (POST/PUT), em que `title` e `author` são obrigatórios:

```json
{
  "title": "Arquitetura Limpa",
  "author": "Robert C. Martin",
  "published_year": 2017,
  "isbn": "978-8550804606"
}
```

```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"Arquitetura Limpa","author":"Robert C. Martin","published_year":2017}'
```

---

## 🧩 Maior desafio técnico

O maior desafio foi fazer o frontend se comunicar com a API na nuvem sem depender de
`localhost`. No Vite, as variáveis `VITE_*` são embutidas no JavaScript durante o
`npm run build`. Por isso, a imagem publicada no Docker Hub ficaria presa à URL usada no
build, e a variável `VITE_API_URL` configurada no Render seria ignorada. A solução foi
servir o build com Nginx e, na inicialização do contêiner, gerar um arquivo
`env-config.js` com o valor de `VITE_API_URL`, que o React lê antes de criar o cliente
Axios. Também foi preciso adaptar o backend ao ambiente do Render: escutar na porta
fornecida pela variável `PORT` (o Nginx também, via template), conectar ao PostgreSQL
por `DATABASE_URL` com SSL habilitado e liberar o CORS para a origem HTTPS do frontend.
