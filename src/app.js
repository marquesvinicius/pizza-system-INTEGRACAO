const express = require("express");
const cors = require("cors");
const path = require("path");
const routes = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Configurar EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Configurar pasta de arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// // No seu app.js ou arquivo de configuração de rotas
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).json({
//       message: 'Erro interno do servidor',
//       error: process.env.NODE_ENV === 'development' ? err.message : {}
//     });
//   });

//   // Middleware de log (use apenas em desenvolvimento)
// app.use((req, res, next) => {
//     console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
//     next();
//   });

// Primeiro, use as rotas de UI
app.use("/", routes);

// // Adicione um log para verificar as rotas
// console.log('Rotas registradas:');
// app._router.stack.forEach(function(r){
//   if (r.route && r.route.path){
//     console.log(`Path: ${Object.keys(r.route.methods)} ${r.route.path}`);
//   }
// });

module.exports = app;