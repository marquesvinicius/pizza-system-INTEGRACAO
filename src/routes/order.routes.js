const { Router } = require("express");
const OrderController = require("../controllers/OrderController");
const authMiddleware = require("../middlewares/authMiddleware");

const orderRoutes = Router();
const orderController = new OrderController();

orderRoutes.post("/orders", authMiddleware, (req, res) => orderController.criar(req, res));
orderRoutes.get("/orders", authMiddleware, (req, res) => orderController.listarTodos(req, res));
orderRoutes.get("/orders/:id", authMiddleware, (req, res) => orderController.buscarPorId(req, res));
orderRoutes.put("/orders/:id/status", authMiddleware, (req, res) => orderController.atualizarStatus(req, res));

module.exports = orderRoutes;
