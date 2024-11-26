const { Router } = require("express");
const ClientController = require("../controllers/ClientController");
const authMiddleware = require("../middlewares/authMiddleware");

const clientRoutes = Router();
const clientController = new ClientController();

// Criar cliente
clientRoutes.post("/clients", authMiddleware, (req, res) => clientController.criar(req, res));

// Listar todos os clientes
clientRoutes.get("/clients", authMiddleware, (req, res) => clientController.listarTodos(req, res));

// Buscar cliente por ID
clientRoutes.get("/clients/:id", authMiddleware, (req, res) => clientController.buscarPorId(req, res));

// Atualizar cliente
clientRoutes.put("/clients/:id", authMiddleware, (req, res) => clientController.atualizar(req, res));

// Deletar cliente
clientRoutes.delete("/clients/:id", authMiddleware, (req, res) => clientController.deletar(req, res));

module.exports = clientRoutes;
