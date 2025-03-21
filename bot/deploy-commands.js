const { REST, Routes } = require("discord.js");
const fs = require("fs");
require("dotenv").config();

const commands = [];
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data) {
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("📡 Registrando comandos no Discord...");
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });
    console.log("✅ Comandos registrados com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao registrar comandos:", error);
  }
})();
