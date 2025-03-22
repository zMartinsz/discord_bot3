const { WebhookClient, Collection } = require("discord.js");
const pool = require("../database");

const webhooksCache = new Collection();
const userPrefixesCache = new Collection();

module.exports = {
  name: "messageCreate",
  async execute(message) {
    if (message.author.bot) return;

    try {
      // 🔹 Verifica cache antes de buscar no banco
      let userProfiles = userPrefixesCache.get(message.author.id);

      if (!userProfiles) {
        const [rows] = await pool.execute(
          "SELECT nome, gatilho, avatar_url FROM perfis WHERE usuario_id = ?",
          [message.author.id]
        );

        if (rows.length === 0) return;

        userPrefixesCache.set(message.author.id, rows);
        userProfiles = rows;
      }

      // 🔹 Verifica se a mensagem começa com algum dos prefixos
      const perfilUsado = userProfiles.find((perfil) =>
        message.content.startsWith(perfil.gatilho)
      );

      if (!perfilUsado) return;

      const conteudo = message.content.slice(perfilUsado.gatilho.length).trim();
      if (!conteudo) return;

      console.log(
        `🔹 Mensagem detectada com o perfil ${perfilUsado.nome}: ${conteudo}`
      );

      // 🔹 Cria ou reutiliza um webhook específico para o usuário no canal
      const webhookKey = `${message.channel.id}-${message.author.id}`;
      let webhook = webhooksCache.get(webhookKey);

      if (!webhook) {
        webhook = await message.channel.createWebhook({
          name: perfilUsado.nome,
          avatar: perfilUsado.avatar_url,
        });

        webhooksCache.set(webhookKey, webhook);
      } else {
        // 🔹 Atualiza nome e avatar se forem diferentes do perfil
        await webhook.edit({
          name: perfilUsado.nome,
          avatar: perfilUsado.avatar_url,
        });
      }

      // 🔹 Executa ações em paralelo para reduzir o tempo de resposta
      await Promise.all([
        message
          .delete()
          .catch((error) =>
            console.error("❌ Erro ao apagar a mensagem:", error)
          ),
        webhook.send({ content: conteudo }),
      ]);
    } catch (error) {
      console.error("❌ Erro no sistema de prefixo:", error);
    }
  },
};
