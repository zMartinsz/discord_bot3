const { SlashCommandBuilder } = require("discord.js");
const pool = require("../database"); // Importa a conexão com o MySQL

module.exports = {
  data: new SlashCommandBuilder()
    .setName("criarperfil")
    .setDescription("Cria um perfil para usar como personagem")
    .addStringOption((option) =>
      option
        .setName("nome")
        .setDescription("Nome do personagem")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("gatilho")
        .setDescription("Palavra-chave para ativar o personagem")
        .setRequired(true)
    )
    .addAttachmentOption((option) =>
      option
        .setName("avatar")
        .setDescription("Imagem do avatar")
        .setRequired(true)
    ),

  async execute(interaction) {
    console.log("✅ Comando criarperfil recebido!");

    const nome = interaction.options.getString("nome");
    let gatilho = interaction.options.getString("gatilho");
    const avatarAttachment = interaction.options.getAttachment("avatar");

    if (!gatilho.endsWith(":")) {
      gatilho += ":";
    }

    try {
      await pool.execute(
        "INSERT INTO perfis (usuario_id, nome, gatilho, avatar_url) VALUES (?, ?, ?, ?)",
        [interaction.user.id, nome, gatilho, avatarAttachment.url]
      );

      await interaction.reply(`✅ Perfil **${nome}** criado com sucesso!`);
    } catch (error) {
      console.error("❌ Erro ao salvar o perfil no banco de dados:", error);
      await interaction.reply("❌ Ocorreu um erro ao salvar o perfil.");
    }
  },
};
