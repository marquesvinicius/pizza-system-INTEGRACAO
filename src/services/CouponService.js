const db = require("../database");

class CouponService {
  // Criar um novo cupom
  async criar(couponData) {
    try {
      const { code, value } = couponData;

      // Verificar se o código já existe
      const couponExistente = await db.query("SELECT * FROM coupons WHERE code = $1", [code]);
      if (couponExistente.rows.length > 0) {
        throw new Error("Código de cupom já existente");
      }

      // Inserir novo cupom
      const result = await db.query(
        "INSERT INTO coupons (code, value) VALUES ($1, $2) RETURNING *",
        [code, value]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao criar cupom: ${error.message}`);
    }
  }

  // Listar todos os cupons
  async listarTodos() {
    try {
      const result = await db.query("SELECT * FROM coupons");
      return result.rows;
    } catch (error) {
      throw new Error(`Erro ao listar cupons: ${error.message}`);
    }
  }

  // Buscar cupom por código
  async buscarPorCodigo(code) {
    try {
      const result = await db.query("SELECT * FROM coupons WHERE code = $1", [code]);
      if (result.rows.length === 0) {
        throw new Error("Cupom não encontrado");
      }
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao buscar cupom: ${error.message}`);
    }
  }
}

module.exports = CouponService;
