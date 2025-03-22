const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Lista todos os comandos disponíveis e suas descrições."),

  async execute(interaction) {
    const commands = interaction.client.commands;

    if (!commands || commands.size === 0) {
      return interaction.reply("❌ Nenhum comando disponível.");
    }

    const embed = new EmbedBuilder()
      .setTitle("📜 Lista de Comandos")
      .setColor("#00ff00")
      .setDescription("Aqui estão todos os comandos disponíveis:");

    commands.forEach((command) => {
      embed.addFields({
        name: `/${command.data.name}`,
        value: command.data.description,
      });
    });

    await interaction.reply({ embeds: [embed] });
  },
};
