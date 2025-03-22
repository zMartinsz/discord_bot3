const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Mostra o tempo de resposta do bot."),

  async execute(interaction) {
    const ping = interaction.client.ws.ping; // Pega a latência do WebSocket
    const message = await interaction.reply({
      content: "🏓 Pong!",
      fetchReply: true,
    });

    const responseTime =
      message.createdTimestamp - interaction.createdTimestamp; // Calcula o tempo de resposta

    await interaction.editReply(
      `🏓 Pong!\n📡 **Latência da API:** ${ping}ms\n⏳ **Tempo de resposta:** ${responseTime}ms`
    );
  },
};
