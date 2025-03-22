const { WebhookClient } = require("discord.js");
const pool = require("../database"); // Importa a conexão com o MySQL

module.exports = {
  name: "messageCreate",
  async execute(message) {
    if (message.author.bot) return; // Ignora mensagens de bots

    try {
      // Buscar os perfis do usuário no banco
      const [rows] = await pool.execute(
        "SELECT nome, gatilho, avatar_url FROM perfis WHERE usuario_id = ?",
        [message.author.id]
      );

      if (rows.length === 0) return; // Se o usuário não tem perfis, ignora

      // Verificar se a mensagem começa com algum dos prefixos
      const perfilUsado = rows.find((perfil) =>
        message.content.startsWith(perfil.gatilho)
      );

      if (!perfilUsado) return; // Se nenhum prefixo bate, ignora

      // Remover o prefixo da mensagem
      const conteudo = message.content.slice(perfilUsado.gatilho.length).trim();
      if (!conteudo) return; // Se não sobrou nada, ignora

      console.log(
        `🔹 Mensagem detectada com o perfil ${perfilUsado.nome}: ${conteudo}`
      );

      // Criar um webhook temporário para enviar a mensagem com nome e avatar do personagem
      const webhook = await message.channel.createWebhook({
        name: perfilUsado.nome,
        avatar: perfilUsado.avatar_url,
      });

      // Apagar a mensagem original do usuário
      await message
        .delete()
        .catch((error) =>
          console.error("❌ Erro ao apagar a mensagem:", error)
        );

      // Enviar a mensagem como o personagem
      await webhook.send({ content: conteudo });

      // Deletar o webhook depois de enviar a mensagem
      setTimeout(() => webhook.delete(), 5000);
    } catch (error) {
      console.error("❌ Erro ao buscar o perfil no banco de dados:", error);
    }
  },
};
