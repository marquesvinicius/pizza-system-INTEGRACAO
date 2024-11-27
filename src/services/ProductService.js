const db = require("../database");

class ProductService {
  // Criar um novo produto
  async criar(productData) {
    try {
      const { name, category, description, image_url, size, price } = productData;

      // Inserir produto
      const result = await db.query(
        "INSERT INTO products (name, category, description, image_url, size, price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [name, category, description, image_url, size, price]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao criar produto: ${error.message}`);
    }
  }

  // Listar todos os produtos
  async listarTodos() {
    try {
      const result = await db.query("SELECT * FROM products");
      return result.rows;
    } catch (error) {
      throw new Error(`Erro ao listar produtos: ${error.message}`);
    }
  }

  // Buscar produto por ID
  async buscarPorId(id) {
    try {
      const result = await db.query("SELECT * FROM products WHERE id = $1", [id]);
      if (result.rows.length === 0) {
        throw new Error("Produto não encontrado");
      }
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao buscar produto: ${error.message}`);
    }
  }

  // Atualizar produto
  async atualizar(id, dadosAtualizacao) {
    try {
      const result = await db.query("SELECT * FROM products WHERE id = $1", [id]);
      if (result.rows.length === 0) {
        throw new Error("Produto não encontrado");
      }

      // Atualizar os dados do produto
      const updatedProduct = await db.query(
        "UPDATE products SET name = $1, category = $2, description = $3, image_url = $4, size = $5, price = $6 WHERE id = $7 RETURNING *",
        [
          dadosAtualizacao.name,
          dadosAtualizacao.category,
          dadosAtualizacao.description,
          dadosAtualizacao.image_url,
          dadosAtualizacao.size,
          dadosAtualizacao.price,
          id
        ]
      );

      return updatedProduct.rows[0];
    } catch (error) {
      throw new Error(`Erro ao atualizar produto: ${error.message}`);
    }
  }

  // Deletar produto
  async deletar(id) {
    try {
      const result = await db.query("SELECT * FROM products WHERE id = $1", [id]);
      if (result.rows.length === 0) {
        throw new Error("Produto não encontrado");
      }

      await db.query("DELETE FROM products WHERE id = $1", [id]);
      return { message: "Produto deletado com sucesso!" };
    } catch (error) {
      throw new Error(`Erro ao deletar produto: ${error.message}`);
    }
  }
}

module.exports = ProductService;
