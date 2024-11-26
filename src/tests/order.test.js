const request = require("supertest");
const app = require("../app");
const db = require("../database");
const bcrypt = require("bcryptjs");

let token;
let orderId;
let productId;
let couponId;

const testUser = {
  name: "John Doe",
  email: `test_user_order_${Date.now()}@example.com`,
  password: "123456",
  role: "user"
};

const couponData = {
  code: "DISCOUNT10",
  value: 10
};

beforeAll(async () => {
  try {
    // Inserir produto, cupom e usuário de teste
    const existingProduct = await db.query(`
      SELECT id FROM products 
      WHERE name = 'Pizza Margherita' AND category = 'Pizza' LIMIT 1
    `);

    if (existingProduct.rows.length === 0) {
      const productResult = await db.query(`
        INSERT INTO products (name, category, description, price)
        VALUES ('Pizza Margherita', 'Pizza', 'Pizza clássica com molho de tomate, mozzarella e manjericão.', 29.90)
        RETURNING id
      `);
      productId = productResult.rows[0].id;
    } else {
      productId = existingProduct.rows[0].id;
    }

    // Inserir cupom de teste
    const couponResult = await db.query(`
      INSERT INTO coupons (code, value) 
      VALUES ($1, $2) 
      RETURNING id`, [couponData.code, couponData.value]);
    couponId = couponResult.rows[0].id;

    // Criar usuário de teste
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    await db.query(`
      INSERT INTO users (name, email, password, role) 
      VALUES ($1, $2, $3, $4)`,
      [testUser.name, testUser.email, hashedPassword, testUser.role]
    );

    // Fazer login para obter token
    const loginResponse = await request(app)
      .post("/login")
      .send({ email: testUser.email, password: testUser.password });

    token = loginResponse.body.token;

  } catch (error) {
    console.error("Erro no setup:", error);
    throw error;
  }
});

// Testes de pedidos
describe("Pedidos", () => {
  it("Deve criar um novo pedido", async () => {
    const novoPedido = {
      product_id: productId,
      quantity: 2,
      pickup: true,
      payment_method: "Cartão",
      change: 10,
      observation: "Sem cebola",
      coupon_id: couponId
    };

    const response = await request(app)
      .post("/orders")
      .set("Authorization", `Bearer ${token}`)
      .send(novoPedido);

    orderId = response.body.id;

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.price_total).toBeDefined();
  });

  it("Deve listar todos os pedidos", async () => {
    const response = await request(app)
      .get("/orders")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it("Deve buscar um pedido por ID", async () => {
    const response = await request(app)
      .get(`/orders/${orderId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body.id).toBe(orderId);
  });

  it("Deve atualizar o status de um pedido", async () => {
    const response = await request(app)
      .put(`/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "em preparo" });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("em preparo");
  });
});

// Limpeza de dados após os testes
afterAll(async () => {
  try {
    // Limpar dados de pedido
    if (orderId) {
      await db.query("DELETE FROM orders WHERE id = $1", [orderId]);
    }

    // Limpar dados de cliente, cupom e produto
    await db.query("DELETE FROM clients WHERE email LIKE 'test_user_order_%'");
    await db.query("DELETE FROM coupons WHERE code = $1", [couponData.code]);
    await db.query("DELETE FROM products WHERE id = $1", [productId]);
    await db.query("DELETE FROM users WHERE email = $1", [testUser.email]);

    await new Promise(resolve => setTimeout(resolve, 100)); // Delay para garantir fechamento de conexões

    // Fechar a conexão com o banco de dados
    if (db.end) await db.end();
    else if (db.pool?.end) await db.pool.end();

  } catch (error) {
    console.error("Erro ao limpar:", error);
    throw error; // Propagar o erro para que o Jest saiba que houve uma falha
  }
});
