const pool = require("../database");
const config = require("../config.json"); // Importa a configuração

module.exports = {
  name: "messageReactionAdd",
  async execute(reaction, user) {
    if (user.bot) return; // Ignorar reações de bots

    const message = reaction.message;
    const canalFeitosID = "1354601404827697334"; // ID do canal onde os feitos são postados

    if (message.channel.id !== canalFeitosID) return; // Só processar se for no canal certo

    try {
      // Número de votos necessários para aprovação/rejeição
      const votosNecessarios = config.votosNecessarios;

      // Contar as reações
      const upVotes = message.reactions.cache.get("✅")?.count || 0;
      const downVotes = message.reactions.cache.get("❌")?.count || 0;

      console.log(
        `Votos: ✅ ${upVotes} | ❌ ${downVotes} | Necessários: ${votosNecessarios}`
      );

      // Verificar se um dos votos atingiu o número necessário
      if (upVotes >= votosNecessarios || downVotes >= votosNecessarios) {
        const aprovado = upVotes >= votosNecessarios ? 1 : 0;

        // Buscar o título do feito para atualizar no banco
        const titulo = message.embeds[0]?.title;
        if (!titulo) return;

        // Atualizar o banco de dados
        await pool.execute("UPDATE feitos SET aprovado = ? WHERE titulo = ?", [
          aprovado,
          titulo,
        ]);

        // Enviar mensagem informando a decisão
        await message.channel.send(
          `📜 O feito **"${titulo}"** foi ${
            aprovado ? "✅ APROVADO" : "❌ REJEITADO"
          } após atingir **${votosNecessarios} votos**!`
        );

        console.log(`Feito "${titulo}" atualizado no banco de dados.`);
      }
    } catch (error) {
      console.error("❌ Erro ao processar votos:", error);
    }
  },
};
