const { Pool } = require('pg');
require('dotenv').config();

// Em produção (Render) usamos DATABASE_URL; localmente, as variáveis DB_*.
// O Postgres do Render exige SSL em conexões externas. Defina DB_SSL=false
// para desabilitar (ex.: Postgres local via docker-compose).
const useSsl = process.env.DB_SSL
  ? process.env.DB_SSL === 'true'
  : Boolean(process.env.DATABASE_URL);

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
    })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'books_db',
      ssl: useSsl ? { rejectUnauthorized: false } : false,
    });

const initDatabase = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      published_year INTEGER,
      isbn VARCHAR(50),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(createTableQuery);
};

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  initDatabase,
};
