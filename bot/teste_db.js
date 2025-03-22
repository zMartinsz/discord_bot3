require("dotenv").config();
const pool = require("./database");

async function testarConexao() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Conexão bem-sucedida!");
    connection.release();
  } catch (error) {
    console.error("❌ Erro ao conectar ao banco de dados:", error);
  }
}

testarConexao();
