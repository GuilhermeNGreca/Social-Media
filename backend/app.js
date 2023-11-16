require("dotenv").config();

const express = require("express");
const path = require("path"); //para determinar onde vai ser o diretório das imagens
const cors = require("cors"); //para acessar o projeto na própria aplicação de frontend

const port = process.env.PORT; //pegando a porta do .env

const app = express(); //iniciando a aplicação

//configurando resposta em JSON e form data
app.use(express.json()); //json
app.use(express.urlencoded({ extended: false })); //form data

//cors
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

//diretório de upload de imagens
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

//conexão com o banco de dados
require("./config/db.js");

//routes
const router = require("./routes/Router");
app.use(router);

//rodando o backend
app.listen(port, () => {
  console.log(`App rodando na porta ${port}`);
});
