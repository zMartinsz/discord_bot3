const { SlashCommandBuilder } = require("discord.js");
const pool = require("../../database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("criar_feito")
    .setDescription("Cria um feito para o personagem")
    .addStringOption((option) =>
      option
        .setName("personagem")
        .setDescription("Nome do personagem")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("atributo")
        .setDescription("Atributo relacionado ao feito")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("titulo")
        .setDescription("Título do feito")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("descricao")
        .setDescription("Descrição do feito")
        .setRequired(true)
    ),

  async execute(interaction) {
    console.log("✅ Comando /criar_feito recebido!");

    // Defere a resposta para evitar a expiração da interação
    await interaction.deferReply({ ephemeral: true });

    const personagem = interaction.options.getString("personagem");
    const atributo = interaction.options.getString("atributo");
    const titulo = interaction.options.getString("titulo");
    const descricao = interaction.options.getString("descricao");

    console.log("Personagem:", personagem);
    console.log("Atributo:", atributo);
    console.log("Título:", titulo);
    console.log("Descrição:", descricao);

    try {
      // Buscar o personagem no banco de dados
      const [personagemData] = await pool.query(
        "SELECT id FROM personagens WHERE nome = ?",
        [personagem]
      );

      if (personagemData.length === 0) {
        return interaction.editReply({
          content: "❌ Personagem não encontrado.",
        });
      }

      const personagemId = personagemData[0].id;
      console.log("ID do personagem:", personagemId);

      // Inserir o feito no banco de dados
      await pool.query(
        "INSERT INTO feitos (personagem_id, atributo, titulo, descricao, aprovado) VALUES (?, ?, ?, ?, ?)",
        [personagemId, atributo, titulo, descricao, 0] // Corrigido para 0 no campo 'aprovado'
      );

      console.log("✅ Feito inserido no banco de dados!");

      // ID do canal onde os feitos serão enviados
      const canalFeitosID = "1354601404827697334"; // Substituir pelo ID correto do canal

      // Buscar o canal de votação
      let canal;
      try {
        canal = await interaction.client.channels.fetch(canalFeitosID);
      } catch (error) {
        console.error("❌ Erro ao buscar o canal:", error);
        return interaction.editReply({
          content: "❌ Ocorreu um erro ao buscar o canal de votação.",
        });
      }

      // Verificar permissões do bot no canal
      const botPermissions = canal.permissionsFor(interaction.client.user);
      if (!botPermissions.has("SEND_MESSAGES")) {
        console.error(
          "❌ O bot não tem permissão para enviar mensagens no canal!"
        );
        return interaction.editReply({
          content:
            "❌ O bot não tem permissão para enviar mensagens no canal de votação.",
        });
      }

      // Criar o embed para o feito
      const embed = {
        color: 0x00ff00,
        title: titulo,
        description: descricao,
        fields: [
          { name: "Personagem", value: personagem, inline: true },
          { name: "Atributo", value: atributo, inline: true },
        ],
        footer: { text: "Votação: Aprovado ou Rejeitado" },
      };

      try {
        // Enviar a mensagem para o canal de votação
        const message = await canal.send({ embeds: [embed] });

        // Adicionar reações de votação
        await message.react("✅");
        await message.react("❌");

        await interaction.editReply({
          content: `✅ Feito criado e enviado para votação no canal <#${canalFeitosID}>.`,
        });
      } catch (error) {
        console.error("❌ Erro ao enviar a mensagem no canal:", error);
        await interaction.editReply({
          content:
            "❌ Ocorreu um erro ao tentar enviar o feito para o canal. Tente novamente mais tarde.",
        });
      }
    } catch (error) {
      console.error("❌ Erro inesperado:", error);
      await interaction.editReply({
        content: "❌ Ocorreu um erro inesperado ao processar o comando.",
      });
    }
  },
};
