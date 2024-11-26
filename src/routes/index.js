const { Router } = require("express");
const uiRoutes = require("./ui.routes");
const userRoutes = require("./user.routes");
const clienteRoutes = require("./client.routes");
const orderRoutes = require("./order.routes");

const routes = Router();

// Primeiro, monte as rotas de UI
routes.use("/", uiRoutes);

// Depois, monte as rotas de API
routes.use(userRoutes);
routes.use(clienteRoutes);
routes.use(orderRoutes);

routes.get("/", (req, res) => {
  res.send("Welcome to the Pizza System API!");
});

module.exports = routes;
