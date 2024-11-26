const request = require("supertest");
const app = require("../app");
const db = require("../database");
const bcrypt = require("bcryptjs");

let token;
let testUser;

beforeAll(async () => {
  testUser = {
    name: "John Doe",
    email: `test_user_client_${Date.now()}@example.com`,
    password: "123456",
    role: "user"
  };

  const hashedPassword = await bcrypt.hash(testUser.password, 10);
  await db.query(
    "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
    [testUser.name, testUser.email, hashedPassword, testUser.role]
  );

  const loginResponse = await request(app)
    .post("/login")
    .send({ email: testUser.email, password: testUser.password });

  token = loginResponse.body.token;
});

describe("Testes de Client", () => {
  let clientId;

  // Limpar dados antes de cada teste, apenas dados inseridos pelos testes
  beforeEach(async () => {
    await db.query("DELETE FROM clients WHERE email LIKE 'test_user_client_%@example.com'");
  });

  it("Deve criar um novo cliente", async () => {
    const newClient = {
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
      .send(newClient);

    clientId = response.body.id;

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe(newClient.name);
  });

  it("Deve listar todos os clientes", async () => {
    const response = await request(app)
      .get("/clients")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  afterEach(async () => {
    if (clientId) {
      await db.query("DELETE FROM clients WHERE id = $1", [clientId]);
    }
  });

  afterAll(async () => {
    // Limpar usuário de teste após todos os testes
    await db.query("DELETE FROM users WHERE email = $1", [testUser.email]);
  });
});
