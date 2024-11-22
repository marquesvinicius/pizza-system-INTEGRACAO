const { Router } = require("express");
const userRoutes = require("./user.routes");

const routes = Router();

routes.use(userRoutes);

routes.get("/", (req, res) => {
  res.send("Welcome to the Pizza System API!");
});

module.exports = routes;
