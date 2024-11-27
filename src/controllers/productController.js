const ProductService = require("../services/ProductService");
const productService = new ProductService();

class ProductController {
    async criar(req, res) {
        try {
            const product = await productService.criar(req.body);
            return res.status(201).json(product);
        } catch (error) {
            console.error("Erro ao criar produto:", error);
            return res.status(400).json({ error: error.message });
        }
    }

    async listarTodos(req, res) {
        try {
            const products = await productService.listarTodos();
            return res.status(200).json(products);
        } catch (error) {
            console.error("Erro ao listar produtos:", error);
            return res.status(400).json({ error: error.message });
        }
    }

    async deletar(req, res) {
        try {
            const { id } = req.params;
            await productService.deletar(id);
            return res.status(204).send();
        } catch (error) {
            console.error("Erro ao deletar produto:", error);
            if (error.message === "Produto não encontrado") {
                return res.status(404).json({ error: error.message });
            }
            return res.status(400).json({ error: error.message });
        }
    }
}

module.exports = ProductController;
