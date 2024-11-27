const { Router } = require("express");
const ClientService = require("../services/ClientService");
const authMiddleware = require("../middlewares/authMiddleware");

const clientRoutes = Router();
const clientService = new ClientService();

// Criar client
clientRoutes.post("/clients", authMiddleware, async (req, res) => {
  try {
    const client = await clientService.criar(req.body);
    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Listar todos os clients
clientRoutes.get("/clients", authMiddleware, async (req, res) => {
  try {
    const clients = await clientService.listarTodos();
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar client por ID
clientRoutes.get("/clients/:id", authMiddleware, async (req, res) => {
  try {
    const client = await clientService.buscarPorId(parseInt(req.params.id));
    res.status(200).json(client);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Atualizar client
clientRoutes.put("/clients/:id", authMiddleware, async (req, res) => {
  try {
    const client = await clientService.atualizar(parseInt(req.params.id), req.body);
    res.status(200).json(client);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Deletar client
clientRoutes.delete("/clients/:id", authMiddleware, async (req, res) => {
  try {
    await clientService.deletar(parseInt(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = clientRoutes;
