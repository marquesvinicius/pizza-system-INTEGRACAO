const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../database");
require("dotenv").config();

class AuthService {
  // Função para autenticar um usuário
  async login(email, password) {
    // Verifica se o usuário existe
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    // Verifica a senha
    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) {
      throw new Error("Senha inválida.");
    }

    // Gera o token JWT
    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,  // Verifique se o valor de JWT_SECRET no .env é o mesmo!
        { expiresIn: "1h" } // O token expira em 1 hora
      );
      

    return { user, token };
  }
}

module.exports = AuthService;
