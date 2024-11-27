const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
  // Pega o header de autorização
  const authHeader = req.headers["authorization"];
  
  console.log("Authorization header:", authHeader);  // Log para debug

  if (!authHeader) {
    return res.status(403).json({ error: "Token não fornecido." });
  }

  // Verifica se está no formato correto e extrai o token
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: "Token mal formatado. Use o formato: Bearer <token>" });
  }

  const token = parts[1];

  // Verifica o token usando a chave secreta
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Armazena os dados decodificados do usuário
    next();  // Continua com a requisição
  } catch (err) {
    console.log("Erro ao verificar o token:", {
      message: err.message,
      token: token.substring(0, 10) + '...', // Log parcial do token por segurança
      secret: process.env.JWT_SECRET ? 'Presente' : 'Ausente'
    });
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expirado" });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Token inválido", details: err.message });
    }
    
    return res.status(401).json({ error: "Erro na autenticação", details: err.message });
  }
};

module.exports = authMiddleware;