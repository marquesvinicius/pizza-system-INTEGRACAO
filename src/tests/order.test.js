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
    // Criar ou recriar a tabela orders
    await db.query(`
      DROP TABLE IF EXISTS orders CASCADE;
      CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price_products NUMERIC(10,2),
        price_total NUMERIC(10,2),
        pickup BOOLEAN NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        change DECIMAL(10,2),
        observation TEXT,
        coupon_id INT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (coupon_id) REFERENCES coupons(id)
      );
    `);

    // Adicionar constraint UNIQUE para prevenir produtos duplicados
    await db.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 
          FROM pg_constraint 
          WHERE conname = 'unique_product_name_category'
        ) THEN 
          ALTER TABLE products 
          ADD CONSTRAINT unique_product_name_category 
          UNIQUE (name, category);
        END IF;
      END $$;
    `);

    // Verificar se o produto já existe antes de inserir
    const existingProduct = await db.query(`
      SELECT id FROM products 
      WHERE name = 'Pizza Margherita' 
      AND category = 'Pizza'
      LIMIT 1
    `);

    if (existingProduct.rows.length === 0) {
      // Inserir produto apenas se não existir
      const productResult = await db.query(`
        INSERT INTO products (name, category, description, price)
        VALUES ('Pizza Margherita', 'Pizza', 'Pizza clássica com molho de tomate, mozzarella e manjericão.', 29.90)
        ON CONFLICT (name, category) DO UPDATE 
        SET description = EXCLUDED.description, 
            price = EXCLUDED.price
        RETURNING id
      `);
      productId = productResult.rows[0].id;
    } else {
      productId = existingProduct.rows[0].id;
    }

    // Limpar e inserir cupom de teste
    await db.query("DELETE FROM coupons WHERE code = $1", [couponData.code]);
    const couponResult = await db.query(`
      INSERT INTO coupons (code, value) 
      VALUES ($1, $2) 
      RETURNING id`,
      [couponData.code, couponData.value]
    );
    couponId = couponResult.rows[0].id;

    // Limpar e criar usuário de teste
    await db.query("DELETE FROM users WHERE email = $1", [testUser.email]);
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    await db.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
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
    
        if (response.status !== 201) {
          console.log('Erro na resposta:', response.body);
        }
    
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("id");
        expect(response.body.price_total).toBeDefined();
        orderId = response.body.id;
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

afterAll(async () => {
    try {
      if (orderId) {
        await db.query("DELETE FROM orders WHERE id = $1", [orderId]);
      }
      await db.query("DELETE FROM users WHERE email = $1", [testUser.email]);
      await db.query("DELETE FROM coupons WHERE code = $1", [couponData.code]);
      await db.query("DELETE FROM products WHERE id = $1", [productId]);
  
      await new Promise(resolve => setTimeout(resolve, 100)); // Pequeno delay para garantir que todas as conexões sejam fechadas
  
      if (db.end) await db.end();
      else if (db.pool?.end) await db.pool.end();
    } catch (error) {
      console.error("Erro ao limpar:", error);
      throw error; // Propagar o erro para que o Jest saiba que houve uma falha
    }
  });