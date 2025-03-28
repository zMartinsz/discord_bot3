const { SlashCommandBuilder } = require("discord.js");
const pool = require("../../database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deletar_personagem")
    .setDescription("deleta um perfil criado")
    .addStringOption((option) =>
      option
        .setName("nome")
        .setDescription("Nome do perfil a ser excluído")
        .setRequired(true)
    ),

  async execute(interaction) {
    console.log("🗑️ Comando del_perfil recebido!");

    const nome = interaction.options.getString("nome");

    try {
      const connection = await pool.getConnection();
      const [result] = await connection.execute(
        "DELETE FROM perfis WHERE usuario_id = ? AND nome = ?",
        [interaction.user.id, nome]
      );
      connection.release();

      if (result.affectedRows > 0) {
        await interaction.reply(
          `✅ O perfil **${nome}** foi excluído com sucesso!`
        );
      } else {
        await interaction.reply(`⚠️ O perfil **${nome}** não foi encontrado.`);
      }
    } catch (error) {
      console.error("❌ Erro ao excluir o perfil:", error);
      await interaction.reply("❌ Ocorreu um erro ao excluir o perfil.");
    }
  },
};
