const ClientService = require("../services/ClientService");
const clientService = new ClientService();

class ClientController {
  // Criar cliente
  async criar(req, res) {
    try {
      const client = await clientService.criar(req.body);
      res.status(201).json(client);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Listar todos os clientes
  async listarTodos(req, res) {
    try {
      console.log("Buscando todos os clientes...");
      const clients = await clientService.listarTodos(); // Chama o serviço
      console.log("Clientes encontrados:", clients); // Verifique o que está sendo retornado
      res.status(200).json(clients); // Retorna os dados diretamente em JSON
    } catch (error) {
      console.error("Erro ao carregar clientes:", error); // Log do erro
      res.status(500).send("Erro ao carregar clientes");
    }
  }

  // Buscar cliente por ID
  async buscarPorId(req, res) {
    try {
      const client = await clientService.buscarPorId(parseInt(req.params.id));
      res.status(200).json(client);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // Atualizar cliente
  async atualizar(req, res) {
    try {
      const client = await clientService.atualizar(parseInt(req.params.id), req.body);
      res.status(200).json(client);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Deletar cliente
  async deletar(req, res) {
    try {
      await clientService.deletar(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ClientController;
