const db = require("../database");

class ClientService {
    // Criar um novo client
    async criar(clientData) {
      try {
        // Verificar se o email já existe
        const { email } = clientData;
        const clientExistente = await db.query("SELECT * FROM clients WHERE email = $1", [email]);
        if (clientExistente.rows.length > 0) {
          throw new Error("Email já cadastrado");
        }
  
        // Inserir novo client
        const result = await db.query(
          "INSERT INTO clients (name, email, phone, address, city, state, zip_code) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
          [clientData.name, clientData.email, clientData.phone, clientData.address, clientData.city, clientData.state, clientData.zip_code]
        );
        return result.rows[0];
      } catch (error) {
        throw new Error(`Erro ao criar client: ${error.message}`);
      }
    }
  
    // Listar todos os clients
    async listarTodos() {
      try {
        const result = await db.query("SELECT * FROM clients");
        return result.rows;
      } catch (error) {
        throw new Error(`Erro ao listar clients: ${error.message}`);
      }
    }
  
    // Buscar client por ID
    async buscarPorId(id) {
      try {
        const result = await db.query("SELECT * FROM clients WHERE id = $1", [id]);
        if (result.rows.length === 0) {
          throw new Error("client não encontrado");
        }
        return result.rows[0];
      } catch (error) {
        throw new Error(`Erro ao buscar client: ${error.message}`);
      }
    }
  
    // Atualizar um client
    async atualizar(id, dadosAtualizacao) {
      try {
        // Verificar se o client existe
        const result = await db.query("SELECT * FROM clients WHERE id = $1", [id]);
        if (result.rows.length === 0) {
          throw new Error("client não encontrado");
        }
  
        // Atualizar os dados
        const client = result.rows[0];
        const { name, email, phone, address, city, state, zip_code } = dadosAtualizacao;
  
        // Se o email foi alterado, verificar se já existe
        if (email && email !== client.email) {
          const emailExistente = await db.query("SELECT * FROM clients WHERE email = $1", [email]);
          if (emailExistente.rows.length > 0) {
            throw new Error("Email já em uso");
          }
        }
  
        const updatedclient = await db.query(
          "UPDATE clients SET name = $1, email = $2, phone = $3, address = $4, city = $5, state = $6, zip_code = $7 WHERE id = $8 RETURNING *",
          [name || client.name, email || client.email, phone || client.phone, address || client.address, city || client.city, state || client.state, zip_code || client.zip_code, id]
        );
  
        return updatedclient.rows[0];
      } catch (error) {
        throw new Error(`Erro ao atualizar client: ${error.message}`);
      }
    }
  
    // Deletar um client
    async deletar(id) {
      try {
        const result = await db.query("SELECT * FROM clients WHERE id = $1", [id]);
        if (result.rows.length === 0) {
          throw new Error("client não encontrado");
        }
  
        await db.query("DELETE FROM clients WHERE id = $1", [id]);
        return { message: "client deletado com sucesso!" };
      } catch (error) {
        throw new Error(`Erro ao deletar client: ${error.message}`);
      }
    }
  }
  
  module.exports = ClientService;