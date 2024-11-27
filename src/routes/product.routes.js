const { Router } = require("express");
const ProductController = require("../controllers/ProductController");
const authMiddleware = require("../middlewares/authMiddleware");

const productRoutes = Router();
const productController = new ProductController();

productRoutes.post("/products", authMiddleware, (req, res) => productController.criar(req, res));
productRoutes.get("/products", authMiddleware, (req, res) => productController.listarTodos(req, res));
productRoutes.delete("/products/:id", authMiddleware, (req, res) => productController.deletar(req, res));

module.exports = productRoutes;
