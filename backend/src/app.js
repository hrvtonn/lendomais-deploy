const express = require('express');
const cors = require('cors');
const bookRoutes = require('./routes/bookRoutes');

const app = express();

// CORS_ORIGIN aceita uma lista separada por vírgulas
// (ex.: https://lendomais-frontend.onrender.com). Sem a variável, libera todas.
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors(
    allowedOrigins.length
      ? {
          origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
            return callback(null, false);
          },
        }
      : {}
  )
);
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ name: 'LendoMais API', status: 'ok', endpoints: ['/health', '/api/books'] });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/books', bookRoutes);

module.exports = app;
