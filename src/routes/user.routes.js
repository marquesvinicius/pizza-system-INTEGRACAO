const { Router } = require("express");
const UserService = require("../services/UserService");
const AuthService = require("../services/AuthService");
const db = require("../database"); // Certifique-se de que está importando corretamente
const bcrypt = require("bcryptjs");
const authMiddleware = require("../middlewares/authMiddleware"); // Middleware para autenticação

const userRoutes = Router();
const userService = new UserService();
const authService = new AuthService();

// Rota de login
userRoutes.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const { accessToken, refreshToken } = await authService.login(email, password);
    res.status(200).json({ 
      token: accessToken, // Mantendo 'token' para compatibilidade com os testes
      refreshToken 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
  // Rota de refresh token (para obter um novo access token com base no refresh token)
userRoutes.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const newAccessToken = await authService.refreshToken(refreshToken);
    res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// Rota para cadastrar um novo usuário
userRoutes.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const user = await userService.createUser(name, email, password, role);
        return res.status(201).json(user);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
});

// Adiciona a rota para listar todos os usuários
userRoutes.get("/users", authMiddleware, async (req, res) => {
    try {
      const result = await db.query("SELECT * FROM users");
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  

// Adiciona a rota para buscar um usuário por ID
userRoutes.get("/users/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Adiciona a rota para atualizar um usuário
userRoutes.put("/users/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { name, email, password, role } = req.body;
  
    try {
      const emailCheck = await db.query("SELECT * FROM users WHERE email = $1", [email]);
      if (emailCheck.rows.length > 0) {
        throw new Error("Email já cadastrado.");
      }
  
      const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
  
      const result = await db.query(
        "UPDATE users SET name = $1, email = $2, password = $3, role = $4 WHERE id = $5 RETURNING *",
        [name, email, hashedPassword, role, id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
  
      res.status(200).json(result.rows[0]);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

// Adiciona a rota para deletar um usuário
userRoutes.delete("/users/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;
  
    try {
      const result = await db.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
  
      res.status(200).json({ message: "Usuário deletado com sucesso!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// Exporta as rotas de usuário
module.exports = userRoutes;
