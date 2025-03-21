const creatingCharacter = {};

async function handleInteraction(client, interaction) {
  if (interaction.commandName === "criar_personagem") {
    creatingCharacter[interaction.user.id] = { step: 1 };
    interaction.reply("Olá! Qual será o nome do personagem?");
  }
}

module.exports = { handleInteraction };
