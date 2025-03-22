const { REST, Routes } = require("discord.js");
require("dotenv").config();

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("🚨 Apagando todos os comandos globais...");

    // Remove todos os comandos globais
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: [],
    });

    console.log("✅ Todos os comandos globais foram removidos com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao remover comandos:", error);
  }
})();
