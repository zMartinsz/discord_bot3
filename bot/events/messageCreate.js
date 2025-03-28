const { Collection } = require("discord.js");
const pool = require("../database");

const webhooksCache = new Collection();
const userProfilesCache = new Collection();

module.exports = {
  name: "messageCreate",
  async execute(message) {
    if (message.author.bot) return;

    try {
      // 🔹 Verifica o cache antes de buscar no banco
      let userProfiles = userProfilesCache.get(message.author.id);

      if (!userProfiles) {
        const [rows] = await pool.execute(
          "SELECT nome, gatilho, avatar_url FROM perfis WHERE usuario_id = ?",
          [message.author.id]
        );

        if (!rows.length) return;

        userProfilesCache.set(message.author.id, rows);
        userProfiles = rows;
      }

      // 🔹 Verifica se a mensagem corresponde a um gatilho
      const perfilUsado = userProfiles.find((p) =>
        message.content.startsWith(p.gatilho)
      );
      if (!perfilUsado) return;

      const conteudo = message.content.slice(perfilUsado.gatilho.length).trim();
      if (!conteudo) return;

      // 🔹 Obtém ou cria um único webhook por canal
      let webhook = webhooksCache.get(message.channel.id);

      if (!webhook) {
        const webhooks = await message.channel.fetchWebhooks();
        webhook = webhooks.find((wh) => wh.owner.id === message.client.user.id);

        if (!webhook) {
          webhook = await message.channel.createWebhook({
            name: "Perfil Bot",
            avatar: message.client.user.displayAvatarURL(),
          });
        }

        webhooksCache.set(message.channel.id, webhook);
      }

      // 🔹 Deleta a mensagem original e envia pelo webhook com nome/avatar do usuário
      await Promise.allSettled([
        message.delete().catch(() => null),
        webhook.send({
          content: conteudo,
          username: perfilUsado.nome,
          avatarURL: perfilUsado.avatar_url,
        }),
      ]);
    } catch (error) {
      console.error("❌ Erro no sistema de perfis:", error);
    }
  },
};
