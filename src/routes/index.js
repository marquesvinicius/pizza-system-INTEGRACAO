const { Router } = require("express");
const userRoutes = require("./user.routes");
const clienteRoutes = require("./client.routes");
const orderRoutes = require("./order.routes");
const productRoutes = require("./product.routes");

const routes = Router();

routes.use(userRoutes);
routes.use(clienteRoutes);
routes.use(orderRoutes);
routes.use(productRoutes);

routes.get("/", (req, res) => {
  res.send("Welcome to the Pizza System API!");
});

module.exports = routes;
