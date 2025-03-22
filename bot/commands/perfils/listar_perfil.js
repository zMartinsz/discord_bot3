const { SlashCommandBuilder } = require("discord.js");
const pool = require("../../database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("listar_perfil")
    .setDescription("Lista todos os perfis que você criou."),

  async execute(interaction) {
    console.log("📜 Comando listarperfil recebido!");

    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(
        "SELECT nome, gatilho FROM perfis WHERE usuario_id = ?",
        [interaction.user.id]
      );
      connection.release();

      if (rows.length === 0) {
        return await interaction.reply(
          "⚠️ Você ainda não criou nenhum perfil."
        );
      }

      let perfilList = "📌 **Seus Perfis:**\n";
      rows.forEach((perfil) => {
        perfilList += `🔹 **Nome:** ${perfil.nome} | **Gatilho:** ${perfil.gatilho}\n`;
      });

      await interaction.reply(perfilList);
    } catch (error) {
      console.error("❌ Erro ao listar perfis:", error);
      await interaction.reply("❌ Ocorreu um erro ao listar seus perfis.");
    }
  },
};
