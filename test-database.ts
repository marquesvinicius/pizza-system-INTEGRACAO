const AppDataSource = require('./src/database/data-source');

AppDataSource.initialize()
  .then(() => {
    console.log("DataSource inicializado com sucesso!");
  })
  .catch((err: Error) => {
    console.error("Erro ao inicializar o DataSource:", err.message);
  });
