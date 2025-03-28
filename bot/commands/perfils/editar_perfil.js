const { SlashCommandBuilder } = require("discord.js");
const pool = require("../../database"); // Importa a conexão com o banco de dados

module.exports = {
  data: new SlashCommandBuilder()
    .setName("editar_personagem")
    .setDescription("Edita um perfil existente")
    .addStringOption((option) =>
      option
        .setName("nome_atual")
        .setDescription("Nome atual do perfil que deseja editar")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("novo_nome")
        .setDescription("Novo nome do perfil")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("novo_gatilho")
        .setDescription("Novo gatilho do perfil")
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option
        .setName("novo_avatar")
        .setDescription("Nova imagem do avatar")
        .setRequired(false)
    ),

  async execute(interaction) {
    console.log("✅ Comando editarperfil recebido!");

    const usuario_id = interaction.user.id;
    const nome_atual = interaction.options.getString("nome_atual");
    const novo_nome = interaction.options.getString("novo_nome");
    let novo_gatilho = interaction.options.getString("novo_gatilho");
    const novo_avatar = interaction.options.getAttachment("novo_avatar");

    if (novo_gatilho && !novo_gatilho.endsWith(":")) {
      novo_gatilho += ":";
    }

    try {
      const connection = await pool.getConnection();

      // Verifica se o perfil existe
      const [rows] = await connection.execute(
        "SELECT * FROM perfis WHERE usuario_id = ? AND nome = ?",
        [usuario_id, nome_atual]
      );

      if (rows.length === 0) {
        connection.release();
        return interaction.reply({
          content: `❌ Perfil **${nome_atual}** não encontrado.`,
          ephemeral: true,
        });
      }

      // Atualiza apenas os campos fornecidos
      const updates = [];
      const values = [];

      if (novo_nome) {
        updates.push("nome = ?");
        values.push(novo_nome);
      }
      if (novo_gatilho) {
        updates.push("gatilho = ?");
        values.push(novo_gatilho);
      }
      if (novo_avatar) {
        updates.push("avatar_url = ?");
        values.push(novo_avatar.url);
      }

      if (updates.length === 0) {
        connection.release();
        return interaction.reply({
          content: "⚠️ Nenhuma alteração foi feita.",
          ephemeral: true,
        });
      }

      values.push(usuario_id, nome_atual); // Adiciona os parâmetros para o WHERE

      await connection.execute(
        `UPDATE perfis SET ${updates.join(
          ", "
        )} WHERE usuario_id = ? AND nome = ?`,
        values
      );

      connection.release();

      await interaction.reply(
        `✅ Perfil **${nome_atual}** atualizado com sucesso!`
      );
    } catch (error) {
      console.error("❌ Erro ao editar o perfil:", error);
      await interaction.reply({
        content: "❌ Ocorreu um erro ao editar o perfil.",
        ephemeral: true,
      });
    }
  },
};
