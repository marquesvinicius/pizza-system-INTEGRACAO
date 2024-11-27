const request = require("supertest");
const app = require("../app");
const db = require("../database");
const bcrypt = require("bcryptjs");

let token;
const testUser = {
  name: "John Doe",
  email: "test_user_" + Date.now() + "@example.com",
  password: "123456", // Senha em texto plano para login
  role: "user"
};

beforeAll(async () => {
  try {
    // Limpar usuários de teste anteriores
    await db.query("DELETE FROM users WHERE email LIKE 'test_user_%@example.com'");
    
    // Criar hash da senha
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    
    // Criar usuário de teste
    const result = await db.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
      [testUser.name, testUser.email, hashedPassword, testUser.role]
    );
    
    console.log("Usuário criado:", result.rows[0]); // Log para debug

    // Fazer login para obter token
    const loginResponse = await request(app)
      .post("/login")
      .send({
        email: testUser.email,
        password: testUser.password // Senha em texto plano para login
      });
    
    console.log("Login response:", loginResponse.body); // Log para debug
    
    if (!loginResponse.body.token) {
      throw new Error("Token não foi gerado no login");
    }
    
    token = loginResponse.body.token;
  } catch (error) {
    console.error("Erro no setup:", error);
    throw error;
  }
});

describe("GET /users", () => {
  it("deve retornar a lista de usuários quando um token válido for fornecido", async () => {
    console.log("Token usado no teste:", token); // Log para debug
    
    const response = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${token}`);
    
    console.log("Response do teste:", response.body); // Log para debug

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.some(user => user.email === testUser.email)).toBe(true);
  });

  it("deve retornar erro 403 se o token não for fornecido", async () => {
    const response = await request(app).get("/users");
    expect(response.status).toBe(403); // Mudado para 403 conforme seu middleware
    expect(response.body.error).toBe("Token não fornecido.");
  });

  it("deve retornar erro 401 se o token for inválido", async () => {
    const response = await request(app)
      .get("/users")
      .set("Authorization", "Bearer invalidtoken");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Token inválido");
  });
});

describe("POST /register", () => {
  it("deve cadastrar um usuário", async () => {
    const newUser = {
      name: "Jane Doe",
      email: "test_user_" + Date.now() + "@example.com",
      password: "123456",
      role: "user"
    };

    const response = await request(app)
      .post("/register")
      .send(newUser);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.email).toBe(newUser.email);
  });
});

describe("POST /login", () => {
  it("deve gerar um token JWT ao fazer login", async () => {
    const response = await request(app)
      .post("/login")
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body.token).toMatch(/^eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/);
  });
});

// Limpar após todos os testes
afterAll(async () => {
  try {
    await db.query("DELETE FROM users WHERE email LIKE 'test_user_%@example.com'");
    // Não usar db.end() se estiver usando um pool de conexões
    if (typeof db.close === 'function') {
      await db.close();
    } else if (typeof db.pool?.end === 'function') {
      await db.pool.end();
    }
  } catch (error) {
    console.error("Erro ao limpar:", error);
  }
});