const db = require("../database");
const bcrypt = require("bcryptjs");

class UserService {
  async createUser(name, email, password, role) {
    // Verifica se o email já está cadastrado
    const emailCheck = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (emailCheck.rows.length > 0) {
      throw new Error("Email já cadastrado.");
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insere o novo usuário no banco
    const result = await db.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, hashedPassword, role]
    );

    return result.rows[0]; // Retorna o usuário criado
  }
}

module.exports = UserService;
