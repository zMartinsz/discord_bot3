const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs").promises;
const path = require("path");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

async function loadFiles(dir, filter) {
  try {
    const files = await fs.readdir(dir, { withFileTypes: true });
    return files.filter(filter).map((f) => path.join(dir, f.name));
  } catch (error) {
    console.error(`❌ Erro ao carregar ${dir}:`, error);
    return [];
  }
}

async function loadEvents() {
  const eventFiles = await loadFiles(path.join(__dirname, "events"), (f) =>
    f.name.endsWith(".js")
  );
  eventFiles.forEach((file) => {
    const event = require(file);
    if (event.name) client.on(event.name, (...args) => event.execute(...args));
  });
}

async function loadCommands() {
  const commandFolders = await loadFiles(
    path.join(__dirname, "commands"),
    (f) => f.isDirectory()
  );
  await Promise.all(
    commandFolders.map(async (folder) => {
      const commandFiles = await loadFiles(folder, (f) =>
        f.name.endsWith(".js")
      );
      commandFiles.forEach((file) => {
        const command = require(file);
        if (command.data && command.execute)
          client.commands.set(command.data.name, command);
      });
    })
  );
}

client.once("ready", () =>
  console.log(`✅ Bot está online como ${client.user.tag}`)
);

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ Erro no comando ${interaction.commandName}:`, error);
    await interaction.reply({
      content: "❌ Erro ao executar o comando!",
      ephemeral: true,
    });
  }
});

(async () => {
  await Promise.all([loadEvents(), loadCommands()]);
  client.login(process.env.TOKEN);
})();

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
