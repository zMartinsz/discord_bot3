const { SlashCommandBuilder } = require("discord.js");
const pool = require("../../database"); // Importa a conexão com o MySQL

module.exports = {
  data: new SlashCommandBuilder()
    .setName("criar_personagem")
    .setDescription("Cria um personagem para usar")
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
    console.log("✅ Comando /criar_personagem recebido!");

    const nome = interaction.options.getString("nome");
    let gatilho = interaction.options.getString("gatilho");
    const avatarAttachment = interaction.options.getAttachment("avatar");

    if (!gatilho.endsWith(":")) {
      gatilho += ":";
    }

    try {
      // Verifica se o personagem já existe
      const [personagemExistente] = await pool.query(
        "SELECT id FROM personagens WHERE nome = ?",
        [nome]
      );

      if (personagemExistente.length > 0) {
        return interaction.reply({
          content: `❌ O personagem **${nome}** já existe! Escolha outro nome.`,
          ephemeral: true,
        });
      }

      // Insere o personagem na tabela
      await pool.query(
        "INSERT INTO personagens (nome, forca, controle_poderes, agilidade, esgrima, inteligencia, resistencia) VALUES (?, 'F', 'F', 'F', 'F', 'F', 'F')",
        [nome]
      );

      await interaction.reply(
        `✅ O personagem **${nome}** foi criado com sucesso!`
      );
    } catch (error) {
      console.error("❌ Erro ao criar personagem:", error);
      await interaction.reply("❌ Ocorreu um erro ao criar o personagem.");
    }
  },
};
