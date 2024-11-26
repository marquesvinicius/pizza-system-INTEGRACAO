// ui.routes.js
const express = require("express");
const router = express.Router();
const ProductService = require("../services/ProductService");
const ClientService = require("../services/ClientService");
const OrderService = require("../services/OrderService");

const productService = new ProductService();
const clientService = new ClientService();
const orderService = new OrderService();

// Página inicial
router.get("/", (req, res) => {
  res.render("index");
});

// Página de produtos
router.get("/products", async (req, res) => {
  try {
    const products = await productService.listarTodos(); // Buscar produtos diretamente
    res.render("products", { products });
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    res.status(500).send("Erro ao carregar produtos");
  }
});

// Página de clientes
router.get("/clients", async (req, res) => {
  try {
    const clients = await clientService.listarTodos(req, res); // Agora usa o controller direto
    console.log("Clientes carregados:", clients); // Para debug
    res.render("clients", { clients }); // Passando os clientes para a view
  } catch (error) {
    res.status(500).send("Erro ao carregar clientes");
  }
});

// Página de pedidos
router.get("/orders", async (req, res) => {
  try {
    const orders = await orderService.listarTodos();
    res.render("orders", { orders });
  } catch (error) {
    console.error("Erro detalhado ao carregar pedidos:", error);
    res.status(500).send(`Erro ao carregar pedidos: ${error.message}`);
  }
});

module.exports = router;
