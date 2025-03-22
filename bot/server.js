const express = require("express");
const app = express();

// Rota de exemplo
app.get("/", (req, res) => {
  res.write("Bot rodando...");
});

// Definindo a porta
const PORT = process.env.PORT || 3000;

// URL completo do serviço
const appUrl = `https://${process.env.RENDER_EXTERNAL_URL}`;

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando! Acesse: ${appUrl}`);
});
