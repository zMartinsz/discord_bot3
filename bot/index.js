const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
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

const commandsPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);

  // Verifica se é um diretório antes de tentar carregar comandos
  if (fs.lstatSync(folderPath).isDirectory()) {
    const commandFiles = fs
      .readdirSync(folderPath)
      .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const filePath = path.join(folderPath, file);
      const command = require(filePath);
      if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
        console.log(`✅ Comando carregado: ${command.data.name}`);
      } else {
        console.warn(`⚠️ O comando ${file} não tem "data" ou "execute"!`);
      }
    }
  }
}

// Quando o bot estiver pronto
client.once("ready", () => {
  console.log(`✅ Bot está online como ${client.user.tag}`);
});

// Capturar interações (Slash Commands)
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) {
    console.error(`❌ Comando ${interaction.commandName} não encontrado!`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ Erro ao executar ${interaction.commandName}:`, error);
    await interaction.reply({
      content: "❌ Ocorreu um erro ao executar este comando!",
      ephemeral: true,
    });
  }
});

// Logar no bot
client.login(process.env.TOKEN);
