const request = require("supertest");
const app = require("../app");
const db = require("../database");
const bcrypt = require("bcryptjs");

let token;
const testUser = {
  name: "John Doe",
  email: `test_user_client_${Date.now()}@example.com`, // Email único para testes de client
  password: "123456",
  role: "user"
};

// Limpar dados antes de todos os testes
beforeAll(async () => {
  try {
    // Limpar usuários de teste anteriores (apenas os relacionados aos testes de client)
    await db.query("DELETE FROM users WHERE email LIKE 'test_user_client_%@example.com'");
    
    // Criar hash da senha
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    
    // Criar usuário de teste
    const result = await db.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
      [testUser.name, testUser.email, hashedPassword, testUser.role]
    );
    
    // Fazer login para obter token
    const loginResponse = await request(app)
      .post("/login")
      .send({
        email: testUser.email,
        password: testUser.password
      });
    
    if (!loginResponse.body.token) {
      throw new Error("Token não foi gerado no login");
    }
    
    token = loginResponse.body.token;
  } catch (error) {
    console.error("Erro no setup:", error);
    throw error;
  }
});

describe("Rotas de clients", () => {
  // Limpar dados de clients antes de cada teste
  beforeEach(async () => {
    await db.query("DELETE FROM clients");
  });

  it("Deve listar todos os clients", async () => {
    const response = await request(app)
      .get("/clients")
      .set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
  
  it("Deve criar um novo client", async () => {
    const novoclient = {
      name: "Client Teste",
      email: "client@teste.com",
      phone: "123456789",
      address: "Rua Teste, 123",
      city: "Cidade Teste",
      state: "Estado Teste",
      zip_code: "12345-678"
    };
  
    const response = await request(app)
      .post("/clients")
      .set("Authorization", `Bearer ${token}`)
      .send(novoclient);
  
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe(novoclient.name);
    expect(response.body.city).toBe(novoclient.city);
    expect(response.body.zip_code).toBe(novoclient.zip_code);
  });
});

// Limpar todos os dados após os testes
afterAll(async () => {
  try {
    // Limpar dados de teste
    await db.query("DELETE FROM clients"); // Alterado de "clients" para "clients"
    await db.query("DELETE FROM users WHERE email LIKE 'test_user_client_%@example.com'");
    
    // Fechar conexão com o banco
    if (typeof db.close === 'function') {
      await db.close();
    } else if (typeof db.pool?.end === 'function') {
      await db.pool.end();
    }
  } catch (error) {
    console.error("Erro ao limpar:", error);
  }
});
