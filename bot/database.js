const mysql = require("mysql2/promise");
require("dotenv").config();
// Obtendo a URL do banco de dados do arquivo .env
const MYSQL_URL = process.env.MYSQL_URL;

if (!MYSQL_URL) {
  console.error("❌ ERRO: A variável MYSQL_URL não está definida no .env!");
  process.exit(1);
}

// Criando a conexão com o banco de dados
const pool = mysql.createPool(
  MYSQL_URL + "?waitForConnections=true&connectionLimit=10&queueLimit=0"
);

module.exports = pool;
