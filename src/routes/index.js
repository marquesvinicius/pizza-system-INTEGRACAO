const { Router } = require("express");
const userRoutes = require("./user.routes");
const clienteRoutes = require("./client.routes");

const routes = Router();

routes.use(userRoutes);
routes.use(clienteRoutes);

routes.get("/", (req, res) => {
  res.send("Welcome to the Pizza System API!");
});

module.exports = routes;
