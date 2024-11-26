const { Router } = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const OrderController = require("../controllers/OrderController");

const orderRoutes = Router();
const orderController = new OrderController();

// Usar o controller para todas as rotas
orderRoutes.post("/orders", authMiddleware, (req, res) => orderController.criar(req, res));
orderRoutes.get("/orders", authMiddleware, (req, res) => orderController.listarTodos(req, res));
orderRoutes.get("/orders/:id", authMiddleware, (req, res) => orderController.buscarPorId(req, res));
orderRoutes.put("/orders/:id/status", authMiddleware, (req, res) => orderController.atualizarStatus(req, res));

// Rota para cancelar pedido
orderRoutes.put("/orders/:id/cancel", authMiddleware, (req, res) => orderController.atualizarStatus(req, res));

// Log para verificar registros de rotas
console.log('Rotas de pedidos sendo configuradas');

// Verificar rotas registradas no console
console.log('Rotas de pedidos:');
orderRoutes.stack.forEach((route) => {
    if (route.route) {
        console.log(`Método: ${Object.keys(route.route.methods)}, Caminho: ${route.route.path}`);
    }
});

module.exports = orderRoutes;
