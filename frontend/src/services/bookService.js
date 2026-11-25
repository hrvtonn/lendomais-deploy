import axios from 'axios';

// Ordem de prioridade da URL da API:
// 1. window.__ENV__.VITE_API_URL -> gerado em runtime pelo contêiner (env do Render)
// 2. import.meta.env.VITE_API_URL -> definido no momento do build (.env / --build-arg)
// 3. fallback para desenvolvimento local
function resolveApiUrl() {
  const raw =
    (typeof window !== 'undefined' && window.__ENV__?.VITE_API_URL) ||
    import.meta.env.VITE_API_URL ||
    'http://localhost:3001';

  // Aceita tanto "https://api.onrender.com" quanto "https://api.onrender.com/api"
  const base = raw.trim().replace(/\/+$/, '');
  return base.endsWith('/api') ? base : `${base}/api`;
}

export const API_URL = resolveApiUrl();

const api = axios.create({
  baseURL: API_URL,
});

export const bookService = {
  async getAll() {
    const response = await api.get('/books');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/books/${id}`);
    return response.data;
  },

  async create(bookData) {
    const response = await api.post('/books', bookData);
    return response.data;
  },

  async update(id, bookData) {
    const response = await api.put(`/books/${id}`, bookData);
    return response.data;
  },

  async remove(id) {
    await api.delete(`/books/${id}`);
  },
};
