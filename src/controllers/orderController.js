const OrderService = require('../services/OrderService');
const orderService = new OrderService();

class OrderController {
    async criar(req, res) {
        try {
            const order = await orderService.criar(req.body);
            return res.status(201).json(order);
        } catch (error) {
            console.error("Erro ao criar pedido:", error);
            return res.status(400).json({ error: error.message });
        }
    }

    async listarTodos(req, res) {
        try {
            const orders = await orderService.listarTodos();
            return res.status(200).json(orders);
        } catch (error) {
            console.error("Erro ao listar pedidos:", error);
            return res.status(400).json({ error: error.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const order = await orderService.buscarPorId(req.params.id);
            return res.status(200).json(order);
        } catch (error) {
            console.error("Erro ao buscar pedido:", error);
            if (error.message === "Pedido não encontrado") {
                return res.status(404).json({ error: error.message });
            }
            return res.status(400).json({ error: error.message });
        }
    }

    // Atualizar status de pedido
    async atualizarStatus(req, res) {
        try {
            const novoStatus = req.body.status || 'cancelado'; // Default para 'cancelado'
            const order = await orderService.atualizarStatus(req.params.id, novoStatus);
            return res.status(200).json(order);
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            if (error.message === "Pedido não encontrado") {
                return res.status(404).json({ error: error.message });
            }
            return res.status(400).json({ error: error.message });
        }
    }
}

module.exports = OrderController;
