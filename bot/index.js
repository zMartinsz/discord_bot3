const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs").promises;
const path = require("path");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers, // 🚨 Para garantir que o bot leia reações corretamente!
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

  for (const file of eventFiles) {
    const event = require(file);
    if (!event.name || !event.execute) {
      console.warn(`⚠️ Evento inválido encontrado: ${file}`);
      continue;
    }

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }
}

async function loadCommands() {
  const commandsPath = path.join(__dirname, "commands");

  // Verifica se há subpastas ou comandos na raiz
  const files = await fs.readdir(commandsPath, { withFileTypes: true });

  for (const file of files) {
    if (file.isDirectory()) {
      // Se for uma pasta, carregamos os arquivos dela
      const commandFiles = await loadFiles(
        path.join(commandsPath, file.name),
        (f) => f.name.endsWith(".js")
      );
      for (const commandFile of commandFiles) {
        const command = require(commandFile);
        if (command.data && command.execute) {
          client.commands.set(command.data.name, command);
        }
      }
    } else if (file.name.endsWith(".js")) {
      // Se for um arquivo diretamente na pasta commands
      const command = require(path.join(commandsPath, file.name));
      if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
      }
    }
  }
}

client.once("ready", () => {
  console.log(`✅ Bot está online como ${client.user.tag}`);
});

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
  await loadEvents();
  await loadCommands();
  client.login(process.env.TOKEN);
})();
