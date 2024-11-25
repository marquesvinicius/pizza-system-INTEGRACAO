const db = require("../database");

class OrderService {
    async criar(orderData) {
        try {
            const { product_id, quantity, pickup, payment_method, change, observation, coupon_id } = orderData;

            // Verificar se o produto existe
            const productResult = await db.query("SELECT * FROM products WHERE id = $1", [product_id]);
            if (productResult.rows.length === 0) {
                throw new Error("Produto não encontrado");
            }

            const product = productResult.rows[0];
            const price_products = product.price * quantity;

            // Se um cupom foi fornecido, aplicar desconto
            let price_total = price_products;
            if (coupon_id) {
                const couponResult = await db.query("SELECT * FROM coupons WHERE id = $1", [coupon_id]);
                if (couponResult.rows.length > 0) {
                    const coupon = couponResult.rows[0];
                    price_total = price_products - coupon.value;
                }
            }

            const result = await db.query(
                `INSERT INTO orders (
                    product_id, quantity, price_products, price_total,
                    pickup, payment_method, "change", observation,
                    coupon_id, status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
                RETURNING *`,
                [
                    product_id,
                    quantity,
                    price_products,
                    price_total,
                    pickup,
                    payment_method,
                    change || null,
                    observation || null,
                    coupon_id || null,
                    'pending'
                ]
            );

            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    async listarTodos() {
        try {
            const result = await db.query(`
                SELECT o.*, p.name as product_name, p.price as product_price
                FROM orders o
                JOIN products p ON o.product_id = p.id
                ORDER BY o.created_at DESC
            `);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    async buscarPorId(id) {
        if (!id) throw new Error("ID do pedido é obrigatório");
        
        try {
            const result = await db.query(`
                SELECT o.*, p.name as product_name, p.price as product_price
                FROM orders o
                JOIN products p ON o.product_id = p.id
                WHERE o.id = $1
            `, [id]);
            
            if (result.rows.length === 0) {
                throw new Error("Pedido não encontrado");
            }
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    async atualizarStatus(id, novoStatus) {
        if (!id) throw new Error("ID do pedido é obrigatório");
        if (!novoStatus) throw new Error("Novo status é obrigatório");

        try {
            const statusValidos = ['pending', 'em preparo', 'pronto', 'entregue'];
            
            if (!statusValidos.includes(novoStatus)) {
                throw new Error("Status inválido");
            }

            const result = await db.query(
                `UPDATE orders 
                SET status = $1, 
                    updated_at = CURRENT_TIMESTAMP 
                WHERE id = $2 
                RETURNING *`,
                [novoStatus, id]
            );

            if (result.rows.length === 0) {
                throw new Error("Pedido não encontrado");
            }

            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
}

module.exports = OrderService;