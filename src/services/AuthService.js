const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../database');

class AuthService {
  async login(email, password) {
    // Busca o usuário pelo email
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Verifica a senha
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error('Senha inválida');
    }

    // Gera o token JWT
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Gera o refresh token
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      const result = await db.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
      const user = result.rows[0];

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      const accessToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      return accessToken;
    } catch (error) {
      throw new Error('Refresh token inválido');
    }
  }
}

module.exports = AuthService;