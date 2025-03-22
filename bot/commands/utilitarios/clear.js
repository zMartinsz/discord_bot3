const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Apaga mensagens do chat")
    .addIntegerOption((option) =>
      option
        .setName("quantidade")
        .setDescription("Número de mensagens a serem apagadas (1-100)")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), // Apenas quem pode gerenciar mensagens pode usar

  async execute(interaction) {
    const quantidade = interaction.options.getInteger("quantidade");

    if (quantidade < 1 || quantidade > 100) {
      return interaction.reply({
        content: "❌ Escolha um número entre **1 e 100**.",
        ephemeral: true,
      });
    }

    const channel = interaction.channel;

    try {
      const messages = await channel.bulkDelete(quantidade, true);
      interaction.reply({
        content: `✅ **${messages.size} mensagens** foram apagadas!`,
        ephemeral: true, // Para não poluir o chat
      });
    } catch (error) {
      console.error("❌ Erro ao apagar mensagens:", error);
      interaction.reply({
        content: "❌ Ocorreu um erro ao apagar mensagens.",
        ephemeral: true,
      });
    }
  },
};
