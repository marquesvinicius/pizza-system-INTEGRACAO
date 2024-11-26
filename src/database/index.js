const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Erro inesperado no cliente PostgreSQL', err);
});

module.exports = {
  async query(text, params = []) {
    try {
      console.log('Executando query:', text, params); // Log da query
      const result = await pool.query(text, params);
      return result;
    } catch (error) {
      console.error('Erro na execução da query:', error);
      throw error;
    }
  },
  async getClient() {
    const client = await pool.connect();
    return client;
  }
};